from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..models import EventRecord
from ..storage.memory_store import memory_event_store

router = APIRouter(prefix="/api/v1", tags=["Events"])


@router.get("/events", response_model=List[EventRecord])
async def list_events(
    decision: Optional[str] = Query(None, description="Filter by decision state: APPROVED_EXPECTED, NEEDS_OWNER_CONFIRMATION, DENIED_UNKNOWN, DENIED_SUSPICIOUS"),
    device_id: Optional[str] = Query(None, description="Filter by source device ID"),
    limit: int = Query(50, ge=1, le=200)
):
    return memory_event_store.list_events(decision=decision, device_id=device_id, limit=limit)


@router.get("/events/{event_id}", response_model=EventRecord)
async def get_event_detail(event_id: str):
    record = memory_event_store.get_event(event_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found in audit log.")
    return record
