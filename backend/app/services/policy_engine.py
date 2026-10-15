import logging
import re
from datetime import datetime, timezone, time
from typing import List, Optional, Tuple, Dict, Any
from ..models import VisitorAnalysis, ScheduleEntry, PolicyDecision

logger = logging.getLogger("guestverify.policy")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(levelname)s] [POLICY] %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


def normalize_name(name: Optional[str]) -> str:
    """Trim whitespace, convert to lowercase, and remove unnecessary punctuation."""
    if not name:
        return ""
    cleaned = re.sub(r"[^\w\s]", "", name.strip().lower())
    return " ".join(cleaned.split())


def get_system_now() -> datetime:
    """Returns current system datetime with local timezone awareness."""
    return datetime.now().astimezone()


def parse_datetime_flexible(val: Optional[str], is_end: bool = False) -> Optional[datetime]:
    """Parses ISO 8601 strings or relative time strings into a comparable datetime object."""
    if not val:
        return None
    val_clean = val.strip()
    local_now = get_system_now()

    # 1. Try ISO 8601 parsing (e.g. 2026-10-14T21:00:00 or 2025-01-01T10:00:00Z)
    try:
        iso_str = val_clean.replace("Z", "+00:00")
        dt = datetime.fromisoformat(iso_str)
        if dt.tzinfo is not None:
            # Convert timezone-aware to system local timezone
            return dt.astimezone(local_now.tzinfo)
        else:
            # Naive datetime from form input represents local time
            return dt.replace(tzinfo=local_now.tzinfo)
    except Exception:
        pass

    today = local_now.date()

    # 2. Check for "Today" prefix or standard time formats
    t_clean = re.sub(r"(?i)\btoday\b", "", val_clean).strip(" ·:-")

    # Match HH:MM or HH:MM:SS (24-hour or with AM/PM)
    match_12 = re.search(r"(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)", t_clean, re.IGNORECASE)
    if match_12:
        h, m = int(match_12.group(1)), int(match_12.group(2))
        ampm = match_12.group(4).lower()
        if ampm == "pm" and h < 12:
            h += 12
        elif ampm == "am" and h == 12:
            h = 0
        return datetime.combine(today, time(h, m), tzinfo=local_now.tzinfo)

    match_24 = re.search(r"\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b", t_clean)
    if match_24:
        h, m = int(match_24.group(1)), int(match_24.group(2))
        return datetime.combine(today, time(h, m), tzinfo=local_now.tzinfo)

    if "active" in val_clean.lower() or "always" in val_clean.lower():
        if is_end:
            return datetime.combine(today, time(23, 59, 59), tzinfo=local_now.tzinfo)
        return datetime.combine(today, time(0, 0, 0), tzinfo=local_now.tzinfo)

    return None


def is_within_time_window(
    scheduled_start: Optional[str],
    scheduled_end: Optional[str],
    reference_dt: Optional[datetime] = None
) -> Tuple[bool, str]:
    """
    Validates whether the reference datetime falls within [scheduled_start, scheduled_end].
    Accounts for system local timezone, grace buffer, and time-of-day tolerance.
    """
    now = reference_dt or get_system_now()
    if now.tzinfo is None:
        local_tz = get_system_now().tzinfo
        now = now.replace(tzinfo=local_tz)

    start_dt = parse_datetime_flexible(scheduled_start, is_end=False)
    end_dt = parse_datetime_flexible(scheduled_end, is_end=True)

    if not start_dt and not end_dt:
        return True, "No time restriction"

    # Add 30-minute grace buffer on both sides for smart-home convenience
    from datetime import timedelta
    grace_start = (start_dt - timedelta(minutes=30)) if start_dt else None
    grace_end = (end_dt + timedelta(minutes=30)) if end_dt else None

    # Exact date check with grace buffer
    if grace_start and grace_end:
        if grace_start <= now <= grace_end:
            return True, "Visit is within scheduled time window"

    # Time-of-day fallback: if scheduled within 1 day (today or tomorrow) and time of day matches
    if start_dt and end_dt and abs((start_dt.date() - now.date()).days) <= 1:
        s_dt_today = datetime.combine(now.date(), start_dt.time(), tzinfo=now.tzinfo) - timedelta(minutes=30)
        e_dt_today = datetime.combine(now.date(), end_dt.time(), tzinfo=now.tzinfo) + timedelta(minutes=30)
        if s_dt_today <= now <= e_dt_today:
            return True, "Visit is within active time-of-day window"

    if start_dt and now < (grace_start or start_dt):
        return False, f"Visit is scheduled for the future (starts at {scheduled_start})"

    if end_dt and now > (grace_end or end_dt):
        return False, f"Scheduled access window has expired (ended at {scheduled_end})"

    return True, "Visit is within scheduled time window"


class DeterministicPolicyEngine:
    """
    Core Security Principle:
    AI extracts claims only. It does NOT independently approve access or unlock doors.
    The policy engine deterministically enforces access rules based on verified manifest schedules.
    """

    def evaluate(
        self,
        analysis: VisitorAnalysis,
        schedules: List[ScheduleEntry],
        current_time: Optional[datetime] = None
    ) -> PolicyDecision:
        local_tz = get_system_now().tzinfo
        if current_time:
            now = current_time.astimezone(local_tz) if current_time.tzinfo else current_time.replace(tzinfo=local_tz)
        else:
            now = get_system_now()

        # ── Development Diagnostics Logging ──
        logger.info("================ POLICY EVALUATION START ================")
        logger.info(f"Loaded schedules count: {len(schedules)}")
        logger.info(f"Current server time: {now.isoformat()}")
        logger.info(f"Extracted visitor claims: identity='{analysis.claimed_identity}', name='{analysis.visitor_name}', org='{analysis.organization}', recipient='{analysis.recipient}', risk_flags={analysis.risk_flags}")

        try:
            # 1. Critical Security Gate: High-risk flags immediately deny & alert
            critical_flags = [
                "AUTHORITY_IMPERSONATION",
                "HIGH_URGENCY",
                "AGGRESSIVE_TONE",
                "SUSPICIOUS_CLAIM"
            ]
            has_critical_risk = any(flag in analysis.risk_flags for flag in critical_flags)
            if has_critical_risk:
                flag_str = ", ".join(analysis.risk_flags)
                logger.warning(f"CRITICAL RISK DETECTED: {flag_str}. Escalating to DENIED_SUSPICIOUS.")
                decision = PolicyDecision(
                    decision="DENIED_SUSPICIOUS",
                    reason=f"Visitor flagged for elevated risk ({flag_str}). Unscheduled high-urgency claim detected. Escalating to security alert.",
                    action="CREATE_SECURITY_ALERT",
                    confidence=max(0.92, analysis.confidence),
                    matched_schedule_id=None,
                    risk_flags=analysis.risk_flags
                )
                logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
                return decision

            # 2. Check Scheduled Guests, Caretakers, and Service Visitors
            # Determine claimed visitor name
            raw_claimed_name = analysis.visitor_name or analysis.claimed_identity or ""
            norm_claimed_name = normalize_name(raw_claimed_name)
            logger.info(f"Normalized visitor claimed name: '{norm_claimed_name}'")

            for s in schedules:
                if s.entry_type in ("guest", "caretaker", "service"):
                    norm_sched_name = normalize_name(s.name)
                    norm_sched_type = normalize_name(s.visitor_type or s.entry_type)

                    # Strict name matching: compare normalized names
                    name_matched = bool(
                        norm_sched_name and norm_claimed_name and (
                            norm_claimed_name == norm_sched_name or
                            norm_claimed_name in norm_sched_name.split() or
                            norm_sched_name in norm_claimed_name.split()
                        )
                    )

                    logger.info(
                        f"Evaluating guest [{s.id}] name='{s.name}' (norm='{norm_sched_name}'): "
                        f"name_matched={name_matched}, status='{s.status}', "
                        f"start='{s.scheduled_start}', end='{s.scheduled_end}', "
                        f"auto_approve={s.auto_approve}, allowed_action='{s.allowed_action}'"
                    )

                    if name_matched:
                        # Check schedule status
                        is_active = (s.status == "active")
                        if not is_active:
                            logger.info(f"Guest [{s.id}] matches name but status is '{s.status}' (not active).")
                            decision = PolicyDecision(
                                decision="DENIED_UNKNOWN",
                                reason=f"The visitor matches a guest record [{s.id}], but the schedule status is '{s.status}'.",
                                action="CREATE_SECURITY_ALERT",
                                matched_schedule_id=s.id,
                                confidence=analysis.confidence,
                                risk_flags=["INACTIVE_SCHEDULE"]
                            )
                            logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
                            return decision

                        # Check time window
                        in_window, window_reason = is_within_time_window(s.scheduled_start, s.scheduled_end, now)
                        logger.info(f"Time-window check for [{s.id}]: in_window={in_window} ({window_reason})")

                        if not in_window:
                            decision = PolicyDecision(
                                decision="DENIED_UNKNOWN",
                                reason="The visitor matches a guest record, but the scheduled access window is no longer active.",
                                action="CREATE_SECURITY_ALERT",
                                matched_schedule_id=s.id,
                                confidence=analysis.confidence,
                                risk_flags=["EXPIRED_WINDOW"]
                            )
                            logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
                            return decision

                        # Check auto-approval
                        norm_allowed = s.allowed_action
                        is_auto_approved = s.auto_approve and (norm_allowed in ("SIMULATED_UNLOCK_MAIN_DOOR", "unlock_main_door"))
                        logger.info(f"Auto-approval check for [{s.id}]: is_auto_approved={is_auto_approved} (auto_approve={s.auto_approve}, allowed_action={norm_allowed})")

                        if is_auto_approved:
                            decision = PolicyDecision(
                                decision="APPROVED_EXPECTED",
                                reason="The visitor matches an active scheduled guest and the visit is within the approved time window.",
                                action="SIMULATED_UNLOCK_MAIN_DOOR",
                                matched_schedule_id=s.id,
                                confidence=max(0.95, analysis.confidence),
                                risk_flags=[]
                            )
                            logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
                            return decision
                        else:
                            decision = PolicyDecision(
                                decision="NEEDS_OWNER_CONFIRMATION",
                                reason="The visitor matches a scheduled guest, but automatic main-door access is disabled.",
                                action="REQUIRE_OWNER_APPROVAL",
                                matched_schedule_id=s.id,
                                confidence=max(0.90, analysis.confidence),
                                risk_flags=[]
                            )
                            logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
                            return decision

            # 3. Check Active Deliveries
            claimed_org = (analysis.organization or "").strip().lower()
            claimed_recipient = (analysis.recipient or "").strip().lower()

            for s in schedules:
                if s.entry_type == "delivery" and s.status in ("active", "out_for_delivery"):
                    schedule_carrier = (s.carrier or s.organization or "").strip().lower()
                    schedule_recipient = (s.recipient or "").strip().lower()

                    carrier_match = bool(schedule_carrier and claimed_org and (schedule_carrier in claimed_org or claimed_org in schedule_carrier))
                    recipient_match = bool(schedule_recipient and claimed_recipient and (schedule_recipient in claimed_recipient or claimed_recipient in schedule_recipient))

                    if carrier_match and recipient_match:
                        decision = PolicyDecision(
                            decision="APPROVED_EXPECTED",
                            reason=f"Verified {s.carrier} delivery for recipient {s.recipient}. Matches active scheduled manifest [{s.id}] with status '{s.status}'.",
                            action="ALLOW_PACKAGE_DROP",
                            confidence=0.96,
                            matched_schedule_id=s.id,
                            risk_flags=[]
                        )
                        logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
                        return decision
                    elif carrier_match and not recipient_match:
                        decision = PolicyDecision(
                            decision="NEEDS_OWNER_CONFIRMATION",
                            reason=f"Carrier matches active {s.carrier} manifest, but claimed recipient '{analysis.recipient}' does not match expected recipient '{s.recipient}'.",
                            action="NOTIFY_OWNER",
                            confidence=0.88,
                            matched_schedule_id=s.id,
                            risk_flags=["RECIPIENT_MISMATCH"]
                        )
                        logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
                        return decision

            # 4. Fall closed: Unknown / Unverified visitor
            all_flags = list(analysis.risk_flags)
            if "NO_SCHEDULE_MATCH" not in all_flags:
                all_flags.append("NO_SCHEDULE_MATCH")

            logger.info("Visitor could not be matched to any active delivery or guest schedule.")
            decision = PolicyDecision(
                decision="DENIED_UNKNOWN",
                reason="The visitor could not be matched to any active delivery, guest, or service appointment. Access is denied and homeowner is notified.",
                action="CREATE_SECURITY_ALERT",
                confidence=0.90,
                matched_schedule_id=None,
                risk_flags=all_flags
            )
            logger.info(f"Final policy decision: {decision.decision} | Final action: {decision.action}")
            return decision

        except Exception as e:
            logger.error(f"Policy evaluation exception: {e}", exc_info=True)
            return PolicyDecision(
                decision="DENIED_UNKNOWN",
                reason=f"Policy evaluation encountered an exception: {str(e)}. Defaulting to fail-closed state.",
                action="CREATE_SECURITY_ALERT",
                confidence=1.0,
                matched_schedule_id=None,
                risk_flags=["POLICY_ENGINE_ERROR"]
            )


policy_engine = DeterministicPolicyEngine()
