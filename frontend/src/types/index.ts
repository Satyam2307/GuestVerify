export type DecisionType =
  | 'APPROVED_EXPECTED'
  | 'NEEDS_OWNER_CONFIRMATION'
  | 'DENIED_UNKNOWN'
  | 'DENIED_SUSPICIOUS'

export type ActionType =
  | 'ALLOW_PACKAGE_DROP'
  | 'NOTIFY_OWNER'
  | 'PLAY_AUTO_RESPONSE'
  | 'REQUEST_MORE_INFORMATION'
  | 'CREATE_SECURITY_ALERT'
  | 'REQUIRE_OWNER_APPROVAL'
  | 'SIMULATED_UNLOCK_MAIN_DOOR'

export interface TimelineStep {
  timestamp: string
  stage: string
  detail: string
  status: 'completed' | 'in_progress' | 'flagged' | 'neutral'
}

export interface VisitorAnalysis {
  claimed_identity: string | null
  organization: string | null
  recipient: string | null
  purpose: string | null
  visitor_name: string | null
  requested_action: string | null
  urgency_level: string
  risk_flags: string[]
  confidence: number
  summary: string
}

export interface WebhookResponse {
  status: string
  event_id: string
  processed_at: string
  decision: DecisionType
  reason: string
  action: ActionType
  confidence: number
  matched_schedule_id: string | null
  risk_flags: string[]
  transcript?: string
  ai_summary?: string
  engine: string
  timeline: TimelineStep[]
  visitor_analysis?: VisitorAnalysis
}

export interface ScheduleEntry {
  id: string
  entry_type: 'delivery' | 'guest' | 'caretaker' | 'service'
  name?: string
  visitor_type?: string
  organization?: string
  carrier?: string
  recipient?: string
  scheduled_start?: string
  scheduled_end?: string
  status: 'active' | 'out_for_delivery' | 'completed' | 'cancelled'
  allowed_action: string
  auto_approve?: boolean
  notes?: string
}

export interface EventRecord {
  event_id: string
  processed_at: string
  device_id: string
  event_type: string
  transcript: string
  decision: DecisionType
  reason: string
  action: ActionType
  confidence: number
  matched_schedule_id: string | null
  risk_flags: string[]
  ai_summary?: string
  engine: string
  visitor_analysis?: VisitorAnalysis
  timeline: TimelineStep[]
}

export interface HealthResponse {
  status: string
  bedrock_configured: boolean
  bedrock_available?: boolean
  demo_mode: boolean
  sse_connected?: boolean
  version: string
  model_id: string
  active_schedules_count: number
  total_events_count: number
}
