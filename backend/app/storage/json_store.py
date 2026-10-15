import json
import uuid
import re
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from ..config import settings
from ..models import ScheduleEntry


def normalize_action(action: Optional[str]) -> str:
    """Normalize action names to the approved system values."""
    if not action:
        return "SIMULATED_UNLOCK_MAIN_DOOR"
    a = action.strip()
    if a in ("unlock_main_door", "SIMULATED_UNLOCK_MAIN_DOOR"):
        return "SIMULATED_UNLOCK_MAIN_DOOR"
    if a in ("ALLOW_PACKAGE_DROP", "unlock_porch_box", "leave_at_door"):
        return "ALLOW_PACKAGE_DROP"
    if a in ("REQUIRE_OWNER_APPROVAL", "require_owner_approval"):
        return "REQUIRE_OWNER_APPROVAL"
    if a in ("CREATE_SECURITY_ALERT", "create_security_alert"):
        return "CREATE_SECURITY_ALERT"
    if a in ("PLAY_AUTO_RESPONSE", "play_auto_response"):
        return "PLAY_AUTO_RESPONSE"
    return a


def normalize_name(name: Optional[str]) -> str:
    """Trim, lowercase, and strip punctuation from a name for comparison."""
    if not name:
        return ""
    cleaned = re.sub(r"[^\w\s]", "", name.strip().lower())
    return " ".join(cleaned.split())


class JsonScheduleStore:
    def __init__(self, file_path: Optional[Path] = None):
        self.file_path = file_path or settings.DELIVERIES_FILE

    def _load_raw(self) -> Dict[str, Any]:
        if not self.file_path.exists():
            default_data = {
                "deliveries": [
                    {
                        "id": "deliv_001",
                        "carrier": "Amazon",
                        "recipient": "John",
                        "status": "out_for_delivery",
                        "allowed_action": "ALLOW_PACKAGE_DROP",
                        "scheduled_start": "Today 08:00",
                        "scheduled_end": "Today 20:00"
                    },
                    {
                        "id": "deliv_002",
                        "carrier": "FedEx",
                        "recipient": "Sarah",
                        "status": "out_for_delivery",
                        "allowed_action": "ALLOW_PACKAGE_DROP",
                        "scheduled_start": "Today 08:00",
                        "scheduled_end": "Today 20:00"
                    }
                ],
                "scheduled_guests": [
                    {
                        "id": "guest_001",
                        "entry_type": "guest",
                        "name": "David",
                        "visitor_type": "Caretaker",
                        "type": "Caretaker",
                        "organization": None,
                        "scheduled_start": "Today 00:00",
                        "scheduled_end": "Today 23:59",
                        "scheduled_time": "Today · 10:00–12:00",
                        "allowed_action": "SIMULATED_UNLOCK_MAIN_DOOR",
                        "status": "active",
                        "auto_approve": True,
                        "notes": "Regular caretaker visit"
                    },
                    {
                        "id": "guest_002",
                        "entry_type": "guest",
                        "name": "Ayush",
                        "visitor_type": "Friend",
                        "type": "Friend",
                        "organization": None,
                        "scheduled_start": "Today 18:00",
                        "scheduled_end": "Today 22:00",
                        "scheduled_time": "Today · 18:00–22:00",
                        "allowed_action": "REQUIRE_OWNER_APPROVAL",
                        "status": "active",
                        "auto_approve": False,
                        "notes": "Dinner guest"
                    }
                ]
            }
            self._save_raw(default_data)
            return default_data

        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"deliveries": [], "scheduled_guests": []}

    def _save_raw(self, data: Dict[str, Any]) -> None:
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def list_all(self) -> List[ScheduleEntry]:
        """
        Loads and normalizes all schedules (both deliveries and scheduled_guests).
        Ensures the 10 internal fields are consistently populated:
        1. id
        2. entry_type
        3. name
        4. visitor_type
        5. scheduled_start
        6. scheduled_end
        7. allowed_action
        8. status
        9. auto_approve
        10. notes
        """
        raw = self._load_raw()
        entries: List[ScheduleEntry] = []

        # Deliveries
        for idx, d in enumerate(raw.get("deliveries", [])):
            entry_id = d.get("id") or f"deliv_{idx}_{d.get('carrier', 'item').lower()}"
            action = normalize_action(d.get("allowed_action", "ALLOW_PACKAGE_DROP"))
            carrier = d.get("carrier") or d.get("organization") or "Courier"
            entries.append(
                ScheduleEntry(
                    id=entry_id,
                    entry_type="delivery",
                    name=d.get("name") or f"{carrier} Delivery",
                    visitor_type="Courier",
                    organization=carrier,
                    carrier=carrier,
                    recipient=d.get("recipient", "Homeowner"),
                    scheduled_start=d.get("scheduled_start", "Today 08:00"),
                    scheduled_end=d.get("scheduled_end", "Today 20:00"),
                    status="out_for_delivery" if d.get("status") in ("out_for_delivery", "active") else d.get("status", "active"),
                    allowed_action=action,
                    auto_approve=action == "ALLOW_PACKAGE_DROP",
                    notes=d.get("notes")
                )
            )

        # Scheduled Guests (supporting both legacy and modern formats)
        for idx, g in enumerate(raw.get("scheduled_guests", [])):
            name = g.get("name", "Guest")
            norm_name = normalize_name(name).replace(" ", "_")
            entry_id = g.get("id") or f"guest_{idx}_{norm_name}"

            # Type normalization
            raw_type = g.get("visitor_type") or g.get("type") or "Guest"
            norm_type = raw_type.capitalize()
            entry_type = "guest"
            if "caretaker" in raw_type.lower():
                entry_type = "caretaker"
            elif "service" in raw_type.lower():
                entry_type = "service"

            # Action & auto-approve normalization
            raw_action = g.get("allowed_action", "")
            action = normalize_action(raw_action)

            # auto_approve resolution
            if "auto_approve" in g:
                auto_approve = bool(g["auto_approve"])
            else:
                auto_approve = action == "SIMULATED_UNLOCK_MAIN_DOOR" or raw_action == "unlock_main_door"

            if auto_approve and action != "SIMULATED_UNLOCK_MAIN_DOOR":
                action = "SIMULATED_UNLOCK_MAIN_DOOR"

            # Times resolution
            scheduled_start = g.get("scheduled_start")
            scheduled_end = g.get("scheduled_end")
            if not scheduled_start:
                # Check legacy scheduled_time e.g. "10:00 AM" or "14:00-16:00"
                leg_time = g.get("scheduled_time", "Today 10:00")
                if "-" in leg_time:
                    parts = leg_time.split("-")
                    scheduled_start = parts[0].strip()
                    scheduled_end = parts[1].strip()
                else:
                    scheduled_start = leg_time.strip()
                    scheduled_end = "Today 23:59"

            entries.append(
                ScheduleEntry(
                    id=entry_id,
                    entry_type=entry_type,
                    name=name,
                    visitor_type=norm_type,
                    organization=g.get("organization") or (norm_type if norm_type != "Guest" else None),
                    carrier=None,
                    recipient=g.get("recipient", "Homeowner"),
                    scheduled_start=scheduled_start,
                    scheduled_end=scheduled_end or "Today 23:59",
                    status=g.get("status", "active"),
                    allowed_action=action,
                    auto_approve=auto_approve,
                    notes=g.get("notes")
                )
            )

        return entries

    def add_entry(self, entry: ScheduleEntry) -> ScheduleEntry:
        raw = self._load_raw()
        norm_action = normalize_action(entry.allowed_action)

        if entry.entry_type == "delivery":
            raw.setdefault("deliveries", []).append({
                "id": entry.id,
                "carrier": entry.carrier or entry.organization or "Courier",
                "recipient": entry.recipient or "Homeowner",
                "status": entry.status,
                "allowed_action": norm_action,
                "scheduled_start": entry.scheduled_start,
                "scheduled_end": entry.scheduled_end,
                "notes": entry.notes
            })
        else:
            # Preserve all 10 fields and backward-compatible fields
            raw.setdefault("scheduled_guests", []).append({
                "id": entry.id,
                "entry_type": entry.entry_type,
                "name": entry.name or "Guest",
                "visitor_type": entry.visitor_type or entry.entry_type.capitalize(),
                "type": entry.visitor_type or entry.entry_type.capitalize(),
                "organization": entry.organization,
                "scheduled_start": entry.scheduled_start,
                "scheduled_end": entry.scheduled_end,
                "scheduled_time": f"{entry.scheduled_start or ''} - {entry.scheduled_end or ''}".strip(" -"),
                "allowed_action": norm_action,
                "status": entry.status,
                "auto_approve": entry.auto_approve,
                "notes": entry.notes
            })
        entry.allowed_action = norm_action
        self._save_raw(raw)
        return entry

    def delete_entry(self, entry_id: str) -> bool:
        raw = self._load_raw()
        found = False

        # Filter deliveries
        new_delivs = []
        for idx, d in enumerate(raw.get("deliveries", [])):
            cur_id = d.get("id") or f"deliv_{idx}_{d.get('carrier', 'item').lower()}"
            if cur_id == entry_id:
                found = True
            else:
                new_delivs.append(d)
        raw["deliveries"] = new_delivs

        # Filter scheduled guests
        new_guests = []
        for idx, g in enumerate(raw.get("scheduled_guests", [])):
            cur_id = g.get("id") or f"guest_{idx}_{normalize_name(g.get('name', 'guest')).replace(' ', '_')}"
            if cur_id == entry_id:
                found = True
            else:
                new_guests.append(g)
        raw["scheduled_guests"] = new_guests

        if found:
            self._save_raw(raw)
        return found

    def update_entry(self, entry_id: str, updates: Dict[str, Any]) -> Optional[ScheduleEntry]:
        all_entries = self.list_all()
        target = next((e for e in all_entries if e.id == entry_id), None)
        if not target:
            return None
        self.delete_entry(entry_id)

        data = target.model_dump()
        for k, v in updates.items():
            if v is not None:
                data[k] = v
        updated = ScheduleEntry(**data)
        self.add_entry(updated)
        return updated


json_schedule_store = JsonScheduleStore()
