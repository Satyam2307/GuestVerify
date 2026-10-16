import {
  WebhookResponse,
  ScheduleEntry,
  EventRecord,
  HealthResponse,
  DecisionType
} from '../types'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export async function triggerWebhook(params: {
  device_id: string
  event_type: 'ding' | 'motion' | 'two_way_audio'
  transcript: string
  token?: string
}): Promise<WebhookResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Ring-Token': params.token || 'demo-token',
    'Idempotency-Key': `idemp_${Date.now()}`
  }

  const res = await fetch(`${API_BASE}/api/v1/ring-webhook`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      device_id: params.device_id,
      event_type: params.event_type,
      transcript: params.transcript,
      timestamp: new Date().toISOString()
    })
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`)
  }

  return res.json()
}

export async function fetchSchedules(): Promise<ScheduleEntry[]> {
  const res = await fetch(`${API_BASE}/api/v1/schedules`)
  if (!res.ok) throw new Error('Failed to fetch schedules')
  return res.json()
}

export async function createSchedule(entry: {
  entry_type: 'delivery' | 'guest' | 'caretaker' | 'service'
  name?: string
  visitor_type?: string
  organization?: string
  carrier?: string
  recipient?: string
  scheduled_start?: string
  scheduled_end?: string
  status?: string
  allowed_action?: string
  auto_approve?: boolean
  notes?: string
}): Promise<ScheduleEntry> {
  const res = await fetch(`${API_BASE}/api/v1/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
  if (!res.ok) throw new Error('Failed to create schedule entry')
  return res.json()
}

export async function deleteSchedule(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/schedules/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete schedule entry')
}

export async function fetchEvents(filters?: {
  decision?: DecisionType
  device_id?: string
  limit?: number
}): Promise<EventRecord[]> {
  const params = new URLSearchParams()
  if (filters?.decision) params.append('decision', filters.decision)
  if (filters?.device_id) params.append('device_id', filters.device_id)
  if (filters?.limit) params.append('limit', String(filters.limit))

  const url = `${API_BASE}/api/v1/events${params.toString() ? `?${params.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function fetchEventDetail(eventId: string): Promise<EventRecord> {
  const res = await fetch(`${API_BASE}/api/v1/events/${eventId}`)
  if (!res.ok) throw new Error('Failed to fetch event detail')
  return res.json()
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('Failed to fetch health status')
  return res.json()
}

export function subscribeToEventStream(
  onEvent: (eventType: string, data: any) => void,
  onError?: (err: any) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/api/v1/stream`)

  const eventTypes = [
    'connected',
    'ring_event_received',
    'analysis_started',
    'analysis_completed',
    'policy_evaluated',
    'action_executed'
  ]

  eventTypes.forEach((type) => {
    eventSource.addEventListener(type, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data)
        onEvent(type, parsed)
      } catch {
        onEvent(type, e.data)
      }
    })
  })

  eventSource.onerror = (err) => {
    if (onError) onError(err)
  }

  return () => {
    eventSource.close()
  }
}

export async function submitContact(data: {
  full_name: string
  email: string
  organization?: string
  inquiry_type: string
  message: string
}): Promise<{ status: string; ticket_id: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/v1/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to submit inquiry. Please try again.')
  }

  return res.json()
}
