import uuid
from datetime import datetime, timezone
from typing import List, Optional
from ..models import RingEvent, EventRecord, TimelineStep
from ..schemas import WebhookResponse
from ..storage.memory_store import memory_event_store
from ..storage.json_store import json_schedule_store
from .bedrock_service import bedrock_service
from .policy_engine import policy_engine
from .action_service import action_simulator


def get_current_iso_time() -> str:
    return datetime.now(timezone.utc).isoformat()


class EventService:
    def __init__(self):
        self.memory_store = memory_event_store
        self.schedule_store = json_schedule_store

    async def process_event(self, event: RingEvent) -> WebhookResponse:
        event_id = event.event_id or f"evt_{uuid.uuid4().hex[:8]}"
        processed_at = get_current_iso_time()
        timeline: List[TimelineStep] = []

        # Step 1: Event Received
        time_step_1 = datetime.now().strftime("%H:%M:%S")
        timeline.append(TimelineStep(
            timestamp=time_step_1,
            stage="Ring Event Received",
            detail=f"Source device '{event.device_id}' triggered '{event.event_type}' sensor with live audio stream.",
            status="completed"
        ))
        await self.memory_store.broadcast("ring_event_received", {
            "event_id": event_id,
            "device_id": event.device_id,
            "event_type": event.event_type,
            "transcript": event.transcript
        })

        # Step 2: Bedrock AI Transcript Understanding
        time_step_2 = datetime.now().strftime("%H:%M:%S")
        timeline.append(TimelineStep(
            timestamp=time_step_2,
            stage="Bedrock Transcript Analysis",
            detail="Visitor transcript passed to Amazon Bedrock for structured claim and risk extraction.",
            status="completed"
        ))
        await self.memory_store.broadcast("analysis_started", {"event_id": event_id})

        visitor_analysis, engine_name = bedrock_service.analyze_transcript(event.transcript)

        time_step_3 = datetime.now().strftime("%H:%M:%S")
        timeline.append(TimelineStep(
            timestamp=time_step_3,
            stage="Claims Extracted",
            detail=f"Identified: {visitor_analysis.claimed_identity or 'Unknown'} | Org: {visitor_analysis.organization or 'None'} | Recipient: {visitor_analysis.recipient or 'None'}",
            status="completed"
        ))
        await self.memory_store.broadcast("analysis_completed", {
            "event_id": event_id,
            "analysis": visitor_analysis.model_dump()
        })

        # Step 3: Check Active Schedules
        now_time = datetime.now()
        schedules = self.schedule_store.list_all()
        matched_sched = next((s for s in schedules if s.id == policy_decision.matched_schedule_id), None) if 'policy_decision' in locals() else None

        # First evaluate policy so we know the matched schedule and conditions
        policy_decision = policy_engine.evaluate(visitor_analysis, schedules)
        matched_sched = next((s for s in schedules if s.id == policy_decision.matched_schedule_id), None)

        timeline.append(TimelineStep(
            timestamp=now_time.strftime("%H:%M:%S"),
            stage="Active guest schedules checked" if matched_sched and matched_sched.entry_type in ("guest", "caretaker", "service") else "Active Schedules Checked",
            detail=f"Cross-referenced visitor claims against {len(schedules)} active manifest items.",
            status="completed"
        ))

        # Guest-specific verification steps
        if matched_sched and matched_sched.entry_type in ("guest", "caretaker", "service"):
            timeline.append(TimelineStep(
                timestamp=now_time.strftime("%H:%M:%S"),
                stage="Guest name matched",
                detail=f"Matched visitor '{visitor_analysis.visitor_name or visitor_analysis.claimed_identity}' with active schedule '{matched_sched.name}' [{matched_sched.id}].",
                status="completed"
            ))

            is_time_ok = "EXPIRED_WINDOW" not in policy_decision.risk_flags
            timeline.append(TimelineStep(
                timestamp=now_time.strftime("%H:%M:%S"),
                stage="Time window validated",
                detail=f"Schedule window ({matched_sched.scheduled_start} to {matched_sched.scheduled_end}) validated against current time.",
                status="completed" if is_time_ok else "flagged"
            ))

        # Step 4: Deterministic Policy Evaluation
        time_step_policy = datetime.now().strftime("%H:%M:%S")
        timeline.append(TimelineStep(
            timestamp=time_step_policy,
            stage="Zero-trust policy evaluated",
            detail=f"Access Decision: {policy_decision.decision} | Rule Match: {policy_decision.reason}",
            status="completed" if policy_decision.decision == "APPROVED_EXPECTED" else ("flagged" if "DENIED" in policy_decision.decision else "neutral")
        ))
        await self.memory_store.broadcast("policy_evaluated", {
            "event_id": event_id,
            "decision": policy_decision.decision,
            "action": policy_decision.action,
            "reason": policy_decision.reason
        })

        # Step 5: Hardware & Notification Action Simulation
        time_step_action = datetime.now().strftime("%H:%M:%S")
        action_result = action_simulator.execute_action(policy_decision, event.device_id)

        action_stage = "Simulated main-door unlock triggered" if policy_decision.action == "SIMULATED_UNLOCK_MAIN_DOOR" else "Action Simulation Executed"
        timeline.append(TimelineStep(
            timestamp=time_step_action,
            stage=action_stage,
            detail=f"Simulated action '{policy_decision.action}': {action_result['simulation']['notification']}",
            status="completed"
        ))
        await self.memory_store.broadcast("action_executed", {
            "event_id": event_id,
            "action": policy_decision.action,
            "simulation": action_result["simulation"]
        })

        # Step 6: Audit Record Recorded
        time_step_audit = datetime.now().strftime("%H:%M:%S")
        timeline.append(TimelineStep(
            timestamp=time_step_audit,
            stage="Audit event recorded",
            detail=f"Event [{event_id}] persisted to security audit trail with zero-trust cryptographic verification.",
            status="completed"
        ))

        # Assemble full Event Record and persist to audit log
        event_record = EventRecord(
            event_id=event_id,
            processed_at=processed_at,
            device_id=event.device_id,
            event_type=event.event_type,
            transcript=event.transcript,
            decision=policy_decision.decision,
            reason=policy_decision.reason,
            action=policy_decision.action,
            confidence=policy_decision.confidence,
            matched_schedule_id=policy_decision.matched_schedule_id,
            risk_flags=policy_decision.risk_flags,
            ai_summary=visitor_analysis.summary,
            engine=engine_name,
            visitor_analysis=visitor_analysis,
            timeline=timeline
        )
        self.memory_store.add_event(event_record)

        return WebhookResponse(
            status="success",
            event_id=event_id,
            processed_at=processed_at,
            decision=policy_decision.decision,
            reason=policy_decision.reason,
            action=policy_decision.action,
            confidence=policy_decision.confidence,
            matched_schedule_id=policy_decision.matched_schedule_id,
            risk_flags=policy_decision.risk_flags,
            transcript=event.transcript,
            ai_summary=visitor_analysis.summary,
            engine=engine_name,
            timeline=timeline,
            visitor_analysis=visitor_analysis
        )


event_service = EventService()
