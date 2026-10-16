import { DecisionType } from '../types'

export interface ScenarioPreset {
  id: string
  title: string
  subtitle: string
  transcript: string
  eventType: 'ding' | 'motion' | 'two_way_audio'
  deviceId: string
  expectedDecision: DecisionType
  tag: string
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'amazon_john',
    title: 'Amazon Delivery',
    subtitle: 'John (Recipient Match)',
    transcript: 'Hi, I have an Amazon package for John. Can you open the porch box?',
    eventType: 'ding',
    deviceId: 'front_door_doorbell',
    expectedDecision: 'APPROVED_EXPECTED',
    tag: 'Auto-Approved'
  },
  {
    id: 'fedex_sarah',
    title: 'FedEx Courier',
    subtitle: 'Sarah (Recipient Match)',
    transcript: 'Hello, FedEx delivery for Sarah. Package drop-off at front door.',
    eventType: 'ding',
    deviceId: 'front_door_doorbell',
    expectedDecision: 'APPROVED_EXPECTED',
    tag: 'Auto-Approved'
  },
  {
    id: 'caretaker_david',
    title: 'Scheduled Caretaker',
    subtitle: 'David (Requires Confirmation)',
    transcript: 'Hi, I am David, here for the scheduled afternoon caretaker visit.',
    eventType: 'ding',
    deviceId: 'front_door_doorbell',
    expectedDecision: 'NEEDS_OWNER_CONFIRMATION',
    tag: 'Owner Review'
  },
  {
    id: 'guest_ayush',
    title: 'Dinner Guest',
    subtitle: 'Ayush (Friend Visit)',
    transcript: 'Hey John, it is Ayush! We had plans to catch up for dinner tonight.',
    eventType: 'ding',
    deviceId: 'front_door_doorbell',
    expectedDecision: 'NEEDS_OWNER_CONFIRMATION',
    tag: 'Owner Review'
  },
  {
    id: 'water_inspector',
    title: 'Unannounced Inspector',
    subtitle: 'Urgent Authority Claim',
    transcript: 'I am here for a mandatory city water inspection. Open the gate quickly.',
    eventType: 'motion',
    deviceId: 'front_door_doorbell',
    expectedDecision: 'DENIED_SUSPICIOUS',
    tag: 'High Alert'
  },
  {
    id: 'unknown_stranger',
    title: 'Unknown Visitor',
    subtitle: 'Unrecognized / No Appointment',
    transcript: 'Hello? Is anyone home? Looking for someone named Michael.',
    eventType: 'ding',
    deviceId: 'front_door_doorbell',
    expectedDecision: 'DENIED_UNKNOWN',
    tag: 'Access Denied'
  }
]

export const DECISION_CONFIG = {
  APPROVED_EXPECTED: {
    label: 'APPROVED EXPECTED',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40',
    cardBorder: 'border-emerald-500/30',
    glow: 'glow-emerald',
    iconColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400'
  },
  NEEDS_OWNER_CONFIRMATION: {
    label: 'NEEDS OWNER CONFIRMATION',
    badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/40',
    cardBorder: 'border-amber-500/30',
    glow: 'glow-amber',
    iconColor: 'text-amber-400',
    dotColor: 'bg-amber-400'
  },
  DENIED_SUSPICIOUS: {
    label: 'DENIED SUSPICIOUS',
    badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/50',
    cardBorder: 'border-red-500/40',
    glow: 'glow-red',
    iconColor: 'text-red-400',
    dotColor: 'bg-red-500'
  },
  DENIED_UNKNOWN: {
    label: 'DENIED UNKNOWN',
    badgeClass: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    cardBorder: 'border-rose-500/30',
    glow: 'glow-red',
    iconColor: 'text-rose-400',
    dotColor: 'bg-rose-400'
  }
}
