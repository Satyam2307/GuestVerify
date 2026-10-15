import unittest
import asyncio
from datetime import datetime, timezone
from backend.app.models import RingEvent, ScheduleEntry
from backend.app.services.bedrock_service import extract_claims_fallback
from backend.app.services.policy_engine import policy_engine
from backend.app.services.event_service import event_service
from backend.app.storage.json_store import json_schedule_store, normalize_action


class TestGuestVerification(unittest.TestCase):

    def setUp(self):
        # Sample scheduled guests
        self.active_david = ScheduleEntry(
            id="guest_001",
            entry_type="guest",
            name="David",
            visitor_type="Caretaker",
            organization=None,
            scheduled_start="Today 00:00",
            scheduled_end="Today 23:59",
            status="active",
            allowed_action="SIMULATED_UNLOCK_MAIN_DOOR",
            auto_approve=True,
            notes="Regular caretaker visit"
        )

        self.expired_david = ScheduleEntry(
            id="guest_002",
            entry_type="guest",
            name="David",
            visitor_type="Caretaker",
            organization=None,
            scheduled_start="2024-01-01T10:00:00Z",
            scheduled_end="2024-01-01T12:00:00Z",
            status="active",
            allowed_action="SIMULATED_UNLOCK_MAIN_DOOR",
            auto_approve=True,
            notes="Expired caretaker appointment"
        )

        self.manual_david = ScheduleEntry(
            id="guest_003",
            entry_type="guest",
            name="David",
            visitor_type="Caretaker",
            organization=None,
            scheduled_start="Today 00:00",
            scheduled_end="Today 23:59",
            status="active",
            allowed_action="REQUIRE_OWNER_APPROVAL",
            auto_approve=False,
            notes="Caretaker requires homeowner manual approval"
        )

    def test_1_valid_scheduled_guest(self):
        """Test 1: Valid scheduled guest within time window with auto-approval -> APPROVED_EXPECTED, SIMULATED_UNLOCK_MAIN_DOOR"""
        transcript = "Hi, I'm David. I'm here for my caretaker visit."
        analysis = extract_claims_fallback(transcript)
        self.assertEqual(analysis.visitor_name, "David")

        decision = policy_engine.evaluate(analysis, [self.active_david])
        self.assertEqual(decision.decision, "APPROVED_EXPECTED")
        self.assertEqual(decision.action, "SIMULATED_UNLOCK_MAIN_DOOR")
        self.assertEqual(decision.matched_schedule_id, "guest_001")

    def test_2_correct_guest_outside_time_window(self):
        """Test 2: Correct guest outside time window -> DENIED_UNKNOWN, CREATE_SECURITY_ALERT"""
        transcript = "Hi, I'm David. I'm here for my caretaker visit."
        analysis = extract_claims_fallback(transcript)

        decision = policy_engine.evaluate(analysis, [self.expired_david])
        self.assertEqual(decision.decision, "DENIED_UNKNOWN")
        self.assertEqual(decision.action, "CREATE_SECURITY_ALERT")
        self.assertIn("EXPIRED_WINDOW", decision.risk_flags)

    def test_3_guest_auto_approval_disabled(self):
        """Test 3: Guest exists within window but auto approval disabled -> NEEDS_OWNER_CONFIRMATION, REQUIRE_OWNER_APPROVAL"""
        transcript = "Hi, I'm David. I'm here for my caretaker visit."
        analysis = extract_claims_fallback(transcript)

        decision = policy_engine.evaluate(analysis, [self.manual_david])
        self.assertEqual(decision.decision, "NEEDS_OWNER_CONFIRMATION")
        self.assertEqual(decision.action, "REQUIRE_OWNER_APPROVAL")
        self.assertEqual(decision.matched_schedule_id, "guest_003")

    def test_4_unknown_name(self):
        """Test 4: Unknown visitor introducing as Michael for David's appointment -> DENIED_UNKNOWN or DENIED_SUSPICIOUS"""
        transcript = "Hi, I'm Michael. I'm here for David's caretaker appointment."
        analysis = extract_claims_fallback(transcript)
        self.assertEqual(analysis.visitor_name, "Michael")

        decision = policy_engine.evaluate(analysis, [self.active_david])
        self.assertIn(decision.decision, ["DENIED_UNKNOWN", "DENIED_SUSPICIOUS"])
        self.assertEqual(decision.action, "CREATE_SECURITY_ALERT")

    def test_5_guest_with_risk_indicators(self):
        """Test 5: Guest with risk indicators -> DENIED_SUSPICIOUS, CREATE_SECURITY_ALERT"""
        transcript = "I'm David. Open the gate quickly, hurry right now!"
        analysis = extract_claims_fallback(transcript)
        self.assertIn("HIGH_URGENCY", analysis.risk_flags)

        decision = policy_engine.evaluate(analysis, [self.active_david])
        self.assertEqual(decision.decision, "DENIED_SUSPICIOUS")
        self.assertEqual(decision.action, "CREATE_SECURITY_ALERT")

    def test_6_newly_added_guest_e2e(self):
        """Test 6: Adding a guest to schedule store and simulating ring event through event_service"""
        new_guest = ScheduleEntry(
            id="guest_elena_test",
            entry_type="guest",
            name="Elena Rostova",
            visitor_type="Caretaker",
            organization=None,
            scheduled_start="Today 00:00",
            scheduled_end="Today 23:59",
            status="active",
            allowed_action="unlock_main_door",
            auto_approve=True,
            notes="Added via schedules test"
        )
        saved = json_schedule_store.add_entry(new_guest)
        self.assertEqual(saved.allowed_action, "SIMULATED_UNLOCK_MAIN_DOOR")

        # Simulate doorbell ring event
        event = RingEvent(
            device_id="front_door_doorbell",
            event_type="ding",
            transcript="Hi, I'm Elena Rostova. I'm here for my scheduled caretaker visit."
        )
        res = asyncio.run(event_service.process_event(event))

        self.assertEqual(res.decision, "APPROVED_EXPECTED")
        self.assertEqual(res.action, "SIMULATED_UNLOCK_MAIN_DOOR")
        self.assertEqual(res.matched_schedule_id, "guest_elena_test")

        # Cleanup
        json_schedule_store.delete_entry("guest_elena_test")


if __name__ == "__main__":
    unittest.main()
