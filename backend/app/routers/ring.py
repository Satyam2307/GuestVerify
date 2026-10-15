from typing import Optional
from fastapi import APIRouter, Header, HTTPException, status
from ..models import RingEvent
from ..schemas import WebhookResponse
from ..services.event_service import event_service
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["Ring Webhooks"])


@router.post("/ring-webhook", response_model=WebhookResponse)
async def handle_ring_webhook(
    event: RingEvent,
    x_ring_token: Optional[str] = Header(None, alias="X-Ring-Token"),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key")
):
    """
    Receives Ring doorbell motion, chime, or two-way audio events.
    Normalizes the payload, triggers Bedrock analysis, executes deterministic policy,
    and returns immediate security verification decision.
    """
    # Token validation: check configured token if not in demo mode
    if not settings.DEMO_MODE and settings.RING_WEBHOOK_TOKEN != "change-me":
        if x_ring_token != settings.RING_WEBHOOK_TOKEN:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing X-Ring-Token header."
            )

    return await event_service.process_event(event)
