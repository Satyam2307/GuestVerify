from typing import Dict, Any
from ..models import PolicyDecision


class ActionSimulator:
    """
    Simulates physical Ring actions safely without directly unlocking doors in production.
    Produces auditable log events for smart-home execution.
    """

    def execute_action(self, decision: PolicyDecision, device_id: str) -> Dict[str, Any]:
        action_name = decision.action
        
        simulated_effects = {
            "SIMULATED_UNLOCK_MAIN_DOOR": {
                "hardware_state": "MAIN_DOOR_SIMULATED_UNLOCK",
                "duration_seconds": 60,
                "chime_cue": "GUEST_WELCOME_CHIME",
                "notification": "Main door unlock simulated. Physical door control is disabled in this prototype.",
                "disclaimer": "Simulation only. No physical door or lock is controlled.",
                "security_status": "NORMAL"
            },
            "ALLOW_PACKAGE_DROP": {
                "hardware_state": "PORCH_BOX_TEMPORARY_UNLOCK",
                "duration_seconds": 60,
                "chime_cue": "TWO_CHIMES_PERMITTED",
                "notification": "Package drop-off approved. Porch box unlocked for 60 seconds.",
                "security_status": "NORMAL"
            },
            "REQUIRE_OWNER_APPROVAL": {
                "hardware_state": "DOORS_LOCKED_AWAITING_PIN",
                "duration_seconds": 180,
                "chime_cue": "PROMPT_VISITOR_WAIT",
                "notification": "Scheduled guest at front door. Tap to approve entrance.",
                "security_status": "ELEVATED_ATTENTION"
            },
            "NOTIFY_OWNER": {
                "hardware_state": "DOORS_LOCKED",
                "duration_seconds": 0,
                "chime_cue": "SILENT",
                "notification": "Visitor statement flagged for review. Tap to view camera stream.",
                "security_status": "FLAGGED"
            },
            "CREATE_SECURITY_ALERT": {
                "hardware_state": "PERIMETER_LOCKDOWN_RECORDING",
                "duration_seconds": 300,
                "chime_cue": "SECURITY_WARNING_TONE",
                "notification": "SECURITY ALERT: Unrecognized or suspicious visitor at front door.",
                "security_status": "HIGH_ALERT"
            },
            "PLAY_AUTO_RESPONSE": {
                "hardware_state": "DOORS_LOCKED",
                "duration_seconds": 30,
                "chime_cue": "PLAY_PRERECORDED_MESSAGE",
                "notification": "Played automated response to visitor.",
                "security_status": "NORMAL"
            },
            "REQUEST_MORE_INFORMATION": {
                "hardware_state": "DOORS_LOCKED",
                "duration_seconds": 60,
                "chime_cue": "PROMPT_VOICE_QUERY",
                "notification": "Prompted visitor for additional verification details.",
                "security_status": "FLAGGED"
            }
        }

        effect = simulated_effects.get(action_name, {
            "hardware_state": "DEFAULT_LOCKED",
            "duration_seconds": 0,
            "chime_cue": "NONE",
            "notification": "Default secure state maintained.",
            "security_status": "LOCKED"
        })

        return {
            "action": action_name,
            "device_id": device_id,
            "simulation": effect,
            "success": True
        }


action_simulator = ActionSimulator()
