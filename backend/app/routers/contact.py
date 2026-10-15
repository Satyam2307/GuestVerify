import html
import re
import uuid
import json
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, HTTPException, status, Request
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["Contact & Inquiries"])

CONTACTS_FILE = settings.BASE_DIR / "contacts.json"

def sanitize_text(text: str) -> str:
    """Strip dangerous HTML tags and escape entities to protect against XSS."""
    if not text:
        return ""
    # Strip script/style/iframe tags
    cleaned = re.sub(r"<(script|style|iframe|object|embed)[^>]*>.*?</\1>", "", text, flags=re.IGNORECASE | re.DOTALL)
    # Strip any remaining HTML tags
    cleaned = re.sub(r"<[^>]+>", "", cleaned)
    # HTML escape
    return html.escape(cleaned.strip())

class ContactInquiryRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    organization: Optional[str] = Field("Individual", max_length=120)
    inquiry_type: Optional[str] = Field("demo", max_length=50)
    message: str = Field(..., min_length=10, max_length=2500)

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        email_clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email_clean):
            raise ValueError("Invalid email format.")
        return email_clean

    @field_validator("full_name", "organization", "message")
    def sanitize_fields(cls, v: Optional[str]) -> str:
        return sanitize_text(v or "")

class ContactInquiryResponse(BaseModel):
    status: str
    message: str
    ticket_id: str
    received_at: str

@router.post("/contact", response_model=ContactInquiryResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_inquiry(inquiry: ContactInquiryRequest, request: Request):
    """
    Receives and sanitizes incoming enterprise contact or support inquiries.
    Stores the inquiry safely with zero exposure of sensitive database credentials.
    """
    ticket_id = f"GV-SEC-{uuid.uuid4().hex[:8].upper()}"
    received_at = datetime.now(timezone.utc).isoformat()

    record = {
        "ticket_id": ticket_id,
        "full_name": inquiry.full_name,
        "email": inquiry.email,
        "organization": inquiry.organization,
        "inquiry_type": inquiry.inquiry_type,
        "message": inquiry.message,
        "received_at": received_at,
        "client_ip": request.client.host if request.client else "unknown"
    }

    # Append to safe local contacts store
    try:
        contacts = []
        if CONTACTS_FILE.exists():
            try:
                with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
                    contacts = json.load(f)
            except Exception:
                contacts = []
        contacts.append(record)
        # Keep only recent 500 inquiries
        contacts = contacts[-500:]
        with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
            json.dump(contacts, f, indent=2)
    except Exception as e:
        # Non-fatal log
        print(f"[WARN] Failed to write contacts.json: {e}")

    return ContactInquiryResponse(
        status="success",
        message="Your security inquiry has been recorded. Our team will contact you shortly.",
        ticket_id=ticket_id,
        received_at=received_at
    )
