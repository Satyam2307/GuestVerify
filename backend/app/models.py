from datetime import datetime, timezone
from typing import Literal, Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RingEvent(BaseModel):
    event_id: Optional[str] = None
    device_id: str = Field(default="front_door_doorbell")
    event_type: Literal["ding", "motion", "two_way_audio"] = Field(default="ding")
    transcript: str
    timestamp: Optional[str] = None


class ScheduleEntry(BaseModel):
    id: str
    entry_type: Literal["delivery", "guest", "caretaker", "service"] = "guest"
    name: Optional[str] = None
    visitor_type: Optional[str] = None
    organization: Optional[str] = None
    carrier: Optional[str] = None
    recipient: Optional[str] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    status: Literal["active", "out_for_delivery", "completed", "cancelled"] = "active"
    allowed_action: str = "SIMULATED_UNLOCK_MAIN_DOOR"
    auto_approve: bool = False
    notes: Optional[str] = None


class VisitorAnalysis(BaseModel):
    claimed_identity: Optional[str] = None
    organization: Optional[str] = None
    recipient: Optional[str] = None
    purpose: Optional[str] = None
    visitor_name: Optional[str] = None
    requested_action: Optional[str] = None
    urgency_level: str = "normal"
    risk_flags: List[str] = Field(default_factory=list)
    confidence: float = 0.90
    summary: str


class PolicyDecision(BaseModel):
    decision: Literal[
        "APPROVED_EXPECTED",
        "NEEDS_OWNER_CONFIRMATION",
        "DENIED_UNKNOWN",
        "DENIED_SUSPICIOUS"
    ]
    reason: str
    action: Literal[
        "ALLOW_PACKAGE_DROP",
        "NOTIFY_OWNER",
        "PLAY_AUTO_RESPONSE",
        "REQUEST_MORE_INFORMATION",
        "CREATE_SECURITY_ALERT",
        "REQUIRE_OWNER_APPROVAL",
        "SIMULATED_UNLOCK_MAIN_DOOR"
    ]
    confidence: float
    matched_schedule_id: Optional[str] = None
    risk_flags: List[str] = Field(default_factory=list)


class TimelineStep(BaseModel):
    timestamp: str
    stage: str
    detail: str
    status: Literal["completed", "in_progress", "flagged", "neutral"] = "completed"


class EventRecord(BaseModel):
    event_id: str
    processed_at: str
    device_id: str
    event_type: str
    transcript: str
    decision: str
    reason: str
    action: str
    confidence: float
    matched_schedule_id: Optional[str] = None
    risk_flags: List[str] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    engine: str
    visitor_analysis: Optional[VisitorAnalysis] = None
    timeline: List[TimelineStep] = Field(default_factory=list)
