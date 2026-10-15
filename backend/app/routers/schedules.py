from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from ..models import ScheduleEntry
from ..schemas import ScheduleCreateRequest, ScheduleUpdateRequest
from ..services.schedule_service import schedule_service
from ..storage.json_store import json_schedule_store

router = APIRouter(prefix="/api/v1", tags=["Schedules"])


@router.get("/schedules", response_model=List[ScheduleEntry])
async def list_schedules():
    return schedule_service.get_all_schedules()


@router.post("/schedules", response_model=ScheduleEntry, status_code=status.HTTP_201_CREATED)
async def create_schedule(payload: ScheduleCreateRequest):
    return await schedule_service.create_schedule(payload)


@router.patch("/schedules/{schedule_id}", response_model=ScheduleEntry)
async def update_schedule(schedule_id: str, payload: ScheduleUpdateRequest):
    updated = await schedule_service.update_schedule(schedule_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    return updated


@router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    success = await schedule_service.delete_schedule(schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    return {"status": "success", "message": f"Schedule {schedule_id} deleted."}


# ─── Backward Compatibility: /api/v1/deliveries ───────────────────────────────

@router.get("/deliveries")
async def get_deliveries_legacy():
    return json_schedule_store._load_raw()


@router.post("/deliveries")
async def add_delivery_legacy(req: Dict[str, Any]):
    raw = json_schedule_store._load_raw()
    if "delivery" in req:
        raw.setdefault("deliveries", []).append(req["delivery"])
    if "guest" in req:
        raw.setdefault("scheduled_guests", []).append(req["guest"])
    json_schedule_store._save_raw(raw)
    return {"status": "success", "database": raw}


@router.delete("/deliveries/{entry_type}/{index}")
async def delete_delivery_legacy(entry_type: str, index: int):
    raw = json_schedule_store._load_raw()
    key = "deliveries" if entry_type == "delivery" else "scheduled_guests"
    items = raw.get(key, [])
    if 0 <= index < len(items):
        removed = items.pop(index)
        json_schedule_store._save_raw(raw)
        return {"status": "success", "removed": removed, "database": raw}
    raise HTTPException(status_code=404, detail="Entry index out of range")
