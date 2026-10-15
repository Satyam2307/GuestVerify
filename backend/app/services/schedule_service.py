import uuid
from typing import List, Optional, Dict, Any
from ..storage.json_store import json_schedule_store, normalize_action
from ..storage.memory_store import memory_event_store
from ..models import ScheduleEntry
from ..schemas import ScheduleCreateRequest, ScheduleUpdateRequest


class ScheduleService:
    def __init__(self):
        self.store = json_schedule_store
        self.memory_store = memory_event_store

    def get_all_schedules(self) -> List[ScheduleEntry]:
        return self.store.list_all()

    async def create_schedule(self, req: ScheduleCreateRequest) -> ScheduleEntry:
        new_id = f"{req.entry_type}_{uuid.uuid4().hex[:6]}"
        norm_action = normalize_action(req.allowed_action)
        auto_approve = req.auto_approve or (norm_action == "SIMULATED_UNLOCK_MAIN_DOOR")

        entry = ScheduleEntry(
            id=new_id,
            entry_type=req.entry_type,
            name=req.name or f"{req.entry_type.capitalize()} Entry",
            visitor_type=req.visitor_type or req.entry_type.capitalize(),
            organization=req.organization or req.carrier,
            carrier=req.carrier,
            recipient=req.recipient or "Homeowner",
            scheduled_start=req.scheduled_start or "Today 09:00",
            scheduled_end=req.scheduled_end or "Today 18:00",
            status=req.status or "active",
            allowed_action=norm_action,
            auto_approve=auto_approve,
            notes=req.notes
        )
        saved = self.store.add_entry(entry)
        await self.memory_store.broadcast("schedule_updated", {
            "action": "create",
            "entry": saved.model_dump()
        })
        return saved

    async def update_schedule(self, schedule_id: str, req: ScheduleUpdateRequest) -> Optional[ScheduleEntry]:
        updates = {k: v for k, v in req.model_dump().items() if v is not None}
        if "allowed_action" in updates:
            updates["allowed_action"] = normalize_action(updates["allowed_action"])
        updated = self.store.update_entry(schedule_id, updates)
        if updated:
            await self.memory_store.broadcast("schedule_updated", {
                "action": "update",
                "entry": updated.model_dump()
            })
        return updated

    async def delete_schedule(self, schedule_id: str) -> bool:
        success = self.store.delete_entry(schedule_id)
        if success:
            await self.memory_store.broadcast("schedule_updated", {
                "action": "delete",
                "schedule_id": schedule_id
            })
        return success


schedule_service = ScheduleService()
