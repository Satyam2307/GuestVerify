from fastapi import APIRouter
from ..config import settings
from ..schemas import HealthResponse
from ..services.bedrock_service import bedrock_service
from ..storage.json_store import json_schedule_store
from ..storage.memory_store import memory_event_store

router = APIRouter(tags=["Health & Status"])


@router.get("/health", response_model=HealthResponse)
@router.get("/api/v1/health", response_model=HealthResponse)
async def get_system_health():
    schedules = json_schedule_store.list_all()
    events = memory_event_store.list_events()

    return HealthResponse(
        status="ok",
        bedrock_configured=bedrock_service.is_configured(),
        bedrock_available=bedrock_service.is_configured(),
        demo_mode=settings.DEMO_MODE,
        sse_connected=True,
        version=settings.VERSION,
        model_id=settings.BEDROCK_MODEL_ID,
        active_schedules_count=len(schedules),
        total_events_count=len(events)
    )
