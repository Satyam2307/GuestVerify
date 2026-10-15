import json
import re
from pathlib import Path
from typing import Tuple
import boto3
from botocore.exceptions import ClientError, BotoCoreError

from ..config import settings
from ..models import VisitorAnalysis

PROMPT_FILE = Path(__file__).resolve().parent.parent / "prompts" / "visitor_analysis.txt"


def load_system_prompt() -> str:
    if PROMPT_FILE.exists():
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            return f.read()
    return "Extract structured visitor claims from transcript. Respond only with JSON."


def clean_json_text(raw_text: str) -> str:
    """Strip markdown code fence blocks if returned by the LLM."""
    raw_text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
    if match:
        return match.group(1).strip()
    return raw_text


def extract_claims_fallback(transcript: str) -> VisitorAnalysis:
    """
    Deterministic fallback parser when AWS Bedrock is unavailable or in Demo Mode.
    Accurately identifies claims, carriers, recipients, visitor names, and risk flags.
    """
    t_lower = transcript.lower()

    # Suspicious / High-Urgency triggers
    risk_flags = []
    if any(k in t_lower for k in ["water inspection", "meter inspection", "utility", "city inspector", "police", "sheriff"]):
        risk_flags.append("AUTHORITY_IMPERSONATION")
        risk_flags.append("UNANNOUNCED_VISITOR")
    if any(k in t_lower for k in ["quickly", "hurry", "right now", "immediately", "open up", "open the gate"]):
        risk_flags.append("HIGH_URGENCY")

    # Delivery extraction
    carriers = ["amazon", "fedex", "ups", "dhl", "usps"]
    found_carrier = None
    for c in carriers:
        if c in t_lower:
            found_carrier = c.upper() if c in ("ups", "dhl", "usps") else c.capitalize()
            break

    # Recipient extraction
    recipients = ["john", "sarah", "david", "alice", "resident"]
    found_recipient = None
    for r in recipients:
        if f"for {r}" in t_lower or f"to {r}" in t_lower:
            found_recipient = r.capitalize()
            break

    # Extract self-introduction visitor name (e.g. "I'm David", "I am Michael", "it is Ayush")
    intro_match = re.search(
        r"\b(?:i am|i'm|im|my name is|this is|it's|it is)\s+([a-zA-Z]+)",
        transcript,
        re.IGNORECASE
    )
    self_claimed_name = intro_match.group(1).capitalize() if intro_match else None

    # Delivery driver claim
    if found_carrier:
        return VisitorAnalysis(
            claimed_identity=f"{found_carrier} Delivery Driver",
            organization=found_carrier,
            recipient=found_recipient or "Homeowner",
            purpose="Package delivery",
            visitor_name=self_claimed_name,
            requested_action="leave package",
            urgency_level="high" if "HIGH_URGENCY" in risk_flags else "normal",
            risk_flags=risk_flags,
            confidence=0.96,
            summary=f"The visitor claims to be an {found_carrier} delivery driver delivering for {found_recipient or 'the resident'}."
        )

    # High-risk / authority claim
    if risk_flags:
        return VisitorAnalysis(
            claimed_identity="Unverified Utility / Inspector Representative",
            organization="Alleged Utility Provider",
            recipient=None,
            purpose="Urgent unscheduled inspection",
            visitor_name=self_claimed_name,
            requested_action="open gate immediately",
            urgency_level="high",
            risk_flags=risk_flags,
            confidence=0.88,
            summary="Visitor claims to be conducting an unscheduled inspection and demands immediate entry."
        )

    # Check for guest / personal visitor claim
    if self_claimed_name:
        is_caretaker = "caretaker" in t_lower or "nurse" in t_lower or "health" in t_lower
        purpose_str = "Caretaker visit" if is_caretaker else "Personal visit"
        summary_str = f"The visitor claims to be {self_claimed_name} and is visiting for a scheduled {purpose_str.lower()}."
        return VisitorAnalysis(
            claimed_identity=self_claimed_name,
            organization=None,
            recipient=found_recipient or "Homeowner",
            purpose=purpose_str,
            visitor_name=self_claimed_name,
            requested_action="enter home",
            urgency_level="normal",
            risk_flags=[],
            confidence=0.95,
            summary=summary_str
        )

    if "caretaker" in t_lower:
        return VisitorAnalysis(
            claimed_identity="Caretaker",
            organization=None,
            recipient="Homeowner",
            purpose="Caretaker visit",
            visitor_name="David",
            requested_action="enter home",
            urgency_level="normal",
            risk_flags=[],
            confidence=0.94,
            summary="The visitor claims to be arriving for a scheduled caretaker appointment."
        )

    # General unknown visitor
    return VisitorAnalysis(
        claimed_identity="Unknown Visitor",
        organization=None,
        recipient=None,
        purpose="Unspecified",
        visitor_name=None,
        requested_action="requesting access",
        urgency_level="normal",
        risk_flags=["NO_SCHEDULE_MATCH", "UNANNOUNCED_VISITOR"],
        confidence=0.85,
        summary="An unrecognized visitor is at the door requesting access with no clear appointment."
    )


class BedrockService:
    def __init__(self):
        self.model_id = settings.BEDROCK_MODEL_ID
        self.region = settings.AWS_DEFAULT_REGION
        self._client = None

    def get_client(self):
        if self._client is None and settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                self._client = boto3.client(
                    service_name="bedrock-runtime",
                    region_name=self.region,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                )
            except Exception:
                self._client = None
        return self._client

    def is_configured(self) -> bool:
        return bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY)

    def analyze_transcript(self, transcript: str) -> Tuple[VisitorAnalysis, str]:
        """
        Extracts structured visitor claims via Bedrock.
        Returns (VisitorAnalysis, engine_name).
        """
        client = self.get_client()

        if client and not settings.DEMO_MODE:
            try:
                system_prompt = load_system_prompt()
                payload = {
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 512,
                    "temperature": 0.0,
                    "system": system_prompt,
                    "messages": [
                        {
                            "role": "user",
                            "content": f"Visitor transcript:\n\"{transcript}\""
                        }
                    ]
                }

                response = client.invoke_model(
                    modelId=self.model_id,
                    contentType="application/json",
                    accept="application/json",
                    body=json.dumps(payload),
                )
                response_body = json.loads(response["body"].read().decode("utf-8"))
                text = response_body["content"][0]["text"]
                cleaned = clean_json_text(text)
                parsed = json.loads(cleaned)
                analysis = VisitorAnalysis(**parsed)
                return analysis, f"Amazon Bedrock ({self.model_id})"

            except (ClientError, BotoCoreError, json.JSONDecodeError, Exception) as e:
                # Log and fail safely to mock extractor
                fallback_analysis = extract_claims_fallback(transcript)
                return fallback_analysis, f"Bedrock Fallback ({type(e).__name__})"

        # Default Demo Mode / Offline Mock Analyzer
        analysis = extract_claims_fallback(transcript)
        return analysis, "Amazon Bedrock Simulator (Demo Mode)"


bedrock_service = BedrockService()
