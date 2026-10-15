from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from .models import ScheduleEntry, VisitorAnalysis, PolicyDecision, TimelineStep, EventRecord


class WebhookResponse(BaseModel):
    status: str = "success"
    event_id: str
    processed_at: str
    decision: str
    reason: str
    action: str
    confidence: float
    matched_schedule_id: Optional[str] = None
    risk_flags: List[str] = Field(default_factory=list)
    transcript: Optional[str] = None
    ai_summary: Optional[str] = None
    engine: str
    timeline: List[TimelineStep] = Field(default_factory=list)
    visitor_analysis: Optional[VisitorAnalysis] = None


class ScheduleCreateRequest(BaseModel):
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


class ScheduleUpdateRequest(BaseModel):
    name: Optional[str] = None
    visitor_type: Optional[str] = None
    organization: Optional[str] = None
    carrier: Optional[str] = None
    recipient: Optional[str] = None
    scheduled_start: Optional[str] = None
    scheduled_end: Optional[str] = None
    status: Optional[Literal["active", "out_for_delivery", "completed", "cancelled"]] = None
    allowed_action: Optional[str] = None
    auto_approve: Optional[bool] = None
    notes: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    bedrock_configured: bool
    bedrock_available: bool = True
    demo_mode: bool
    sse_connected: bool = True
    version: str
    model_id: str
    active_schedules_count: int
    total_events_count: int
