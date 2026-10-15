import React, { useState, useEffect, useRef } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Package,
  UserCheck,
  UserX,
  Truck,
  ChevronRight,
  X,
  Layers,
  ArrowRight,
  User,
  Key,
  ShieldCheck,
  RefreshCw,
  Zap
} from 'lucide-react'
import { SCENARIO_PRESETS, ScenarioPreset } from '../lib/constants'
import { triggerWebhook, subscribeToEventStream, fetchSchedules } from '../lib/api'
import { WebhookResponse, ScheduleEntry } from '../types'

const PIPELINE_STEPS = [
  'Event received',
  'Visitor understood',
  'Schedule checked',
  'Policy evaluated'
]

export const ConsolePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIO_PRESETS[0].id)
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)

  const [lastEvent, setLastEvent] = useState<WebhookResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [sseConnected, setSseConnected] = useState<boolean>(true)

  // Pipeline animation
  const [pipelineStep, setPipelineStep] = useState<number>(-1)
  const [processingLabel, setProcessingLabel] = useState<string>('')

  // Drawers
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState<boolean>(false)
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState<boolean>(false)

  // Evidence expand
  const [expandedEvidence, setExpandedEvidence] = useState<{ [key: string]: boolean }>({
    schedule: false,
    claim: false,
    risk: false,
    diagnostic: true
  })

  const scenarioRailRef = useRef<HTMLDivElement>(null)

  // Load schedules from backend
  const loadSchedules = async () => {
    try {
      const data = await fetchSchedules()
      setSchedules(data)
    } catch (err) {
      console.error('Error fetching schedules in Console:', err)
    }
  }

  // Active scheduled guests
  const activeGuests = schedules.filter(
    (s) => (s.entry_type === 'guest' || s.entry_type === 'caretaker' || s.entry_type === 'service') && s.status === 'active'
  )

  // Check if selected guest was removed
  useEffect(() => {
    if (selectedGuestId) {
      const exists = activeGuests.some((g) => g.id === selectedGuestId)
      if (!exists) {
        setSelectedGuestId(null)
      }
    }
  }, [schedules, selectedGuestId, activeGuests])

  useEffect(() => {
    loadSchedules()
  }, [])

  // Listen for custom schedule update events
  useEffect(() => {
    const handleSchedulesUpdate = () => loadSchedules()
    window.addEventListener('guestverify:schedules_updated', handleSchedulesUpdate)
    return () => window.removeEventListener('guestverify:schedules_updated', handleSchedulesUpdate)
  }, [])

  // Subscribe to live SSE stream
  useEffect(() => {
    const unsubscribe = subscribeToEventStream(
      (eventType, data) => {
        if (eventType === 'connected') {
          setSseConnected(true)
        } else if (eventType === 'schedule_updated') {
          loadSchedules()
        }
      },
      () => setSseConnected(false)
    )
    return () => unsubscribe()
  }, [])

  // Determine current active scenario or guest
  const currentGuest = selectedGuestId ? activeGuests.find((g) => g.id === selectedGuestId) : null
  const currentPreset = !selectedGuestId
    ? SCENARIO_PRESETS.find((s) => s.id === selectedScenarioId) || SCENARIO_PRESETS[0]
    : null

  // Generated transcript for current selection
  const currentTranscript = currentGuest
    ? `Hi, I'm ${currentGuest.name}. I'm here for my scheduled ${currentGuest.visitor_type || currentGuest.entry_type} visit.`
    : currentPreset?.transcript || ''

  // Animate pipeline steps
  const animatePipeline = () => {
    const labels = [
      'Receiving Ring event…',
      'Understanding visitor…',
      'Checking schedule…',
      'Evaluating policy…'
    ]
    let step = 0
    setPipelineStep(0)
    setProcessingLabel(labels[0])

    const interval = setInterval(() => {
      step++
      if (step < PIPELINE_STEPS.length) {
        setPipelineStep(step)
        setProcessingLabel(labels[step])
      } else {
        clearInterval(interval)
        setProcessingLabel('')
      }
    }, 400)

    return () => clearInterval(interval)
  }

  const handleTriggerEvent = async () => {
    setLoading(true)
    setErrorMsg(null)
    setLastEvent(null)
    setPipelineStep(-1)

    const cleanupAnimation = animatePipeline()

    try {
      const deviceId = currentPreset?.deviceId || 'front_door_doorbell'
      const eventType = currentPreset?.eventType || 'ding'

      const response = await triggerWebhook({
        device_id: deviceId,
        event_type: eventType,
        transcript: currentTranscript
      })
      setTimeout(() => {
        setPipelineStep(PIPELINE_STEPS.length)
        setProcessingLabel('')
        setLastEvent(response)
      }, PIPELINE_STEPS.length * 400 + 200)
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not process doorbell event.')
      setPipelineStep(-1)
      setProcessingLabel('')
    } finally {
      setTimeout(() => setLoading(false), PIPELINE_STEPS.length * 400 + 300)
    }
  }

  // Support navbar global run demo trigger
  useEffect(() => {
    const handleGlobalDemo = () => {
      const amazonPreset = SCENARIO_PRESETS[0]
      setSelectedGuestId(null)
      setSelectedScenarioId(amazonPreset.id)
      handleTriggerEvent()
    }
    window.addEventListener('guestverify:run_demo', handleGlobalDemo)
    return () => window.removeEventListener('guestverify:run_demo', handleGlobalDemo)
  }, [currentTranscript])

  const toggleEvidence = (key: string) => {
    setExpandedEvidence((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const decision = lastEvent?.decision
  const action = lastEvent?.action
  const isApproved = decision === 'APPROVED_EXPECTED'
  const isReview = decision === 'NEEDS_OWNER_CONFIRMATION'
  const isDenied = decision === 'DENIED_SUSPICIOUS' || (decision && !isApproved && !isReview)
  const isSimulatedUnlock = action === 'SIMULATED_UNLOCK_MAIN_DOOR'

  // Matched schedule lookup from event
  const matchedSchedule = lastEvent?.matched_schedule_id
    ? schedules.find((s) => s.id === lastEvent.matched_schedule_id)
    : null

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'amazon_john': return <Package className="w-4 h-4" />
      case 'fedex_sarah': return <Truck className="w-4 h-4" />
      case 'caretaker_david': return <UserCheck className="w-4 h-4" />
      case 'guest_ayush': return <User className="w-4 h-4" />
      case 'water_inspector': return <AlertTriangle className="w-4 h-4" />
      default: return <UserX className="w-4 h-4" />
    }
  }

  const getScenarioAccent = (expected: string) => {
    if (expected === 'APPROVED_EXPECTED') return { bg: 'bg-[#E1F3E7]', text: 'text-[#186941]', border: 'border-[#A8DFB8]', icon: 'text-[#5DA87E]' }
    if (expected === 'NEEDS_OWNER_CONFIRMATION') return { bg: 'bg-[#FFF1D2]', text: 'text-[#7A4E00]', border: 'border-[#F0D190]', icon: 'text-[#E4A02F]' }
    return { bg: 'bg-[#FDEAE9]', text: 'text-[#922525]', border: 'border-[#F0B5B5]', icon: 'text-[#E5654F]' }
  }

  const getDecisionStyles = () => {
    if (isApproved) {
      return {
        bg: 'bg-gradient-to-br from-[#E1F3E7] to-[#D2EDDA]',
        border: 'border-[#A8DFB8]',
        text: 'text-[#186941]',
        label: isSimulatedUnlock ? 'Approved expected guest' : 'Approved expected visitor',
        actionDisplay: isSimulatedUnlock ? 'Main door unlock simulated' : 'Package drop-off permitted',
        badge: 'Access approved',
        glow: 'glow-badge-green'
      }
    }
    if (isReview) {
      return {
        bg: 'bg-gradient-to-br from-[#FFF1D2] to-[#FDE8B6]',
        border: 'border-[#F0D190]',
        text: 'text-[#7A4E00]',
        label: 'Owner confirmation required',
        actionDisplay: 'Require homeowner approval',
        badge: 'Owner review required',
        glow: 'glow-badge-saffron'
      }
    }
    return {
      bg: 'bg-gradient-to-br from-[#FDEAE9] to-[#F9D1CF]',
      border: 'border-[#F0B5B5]',
      text: 'text-[#922525]',
      label: 'Access denied',
      actionDisplay: 'Create security alert',
      badge: 'Access denied',
      glow: 'glow-badge-coral'
    }
  }

  // Format time window for display
  const formatWindow = (start?: string, end?: string) => {
    if (!start) return 'Today · Active window'
    if (start.includes('T')) {
      const [startDatePart, startTimePart] = start.split('T')
      const startTime = startTimePart?.slice(0, 5) || ''
      const endTime = end?.includes('T') ? end.split('T')[1]?.slice(0, 5) : ''

      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const dayLabel = startDatePart === todayStr ? 'Today' : startDatePart
      return `${dayLabel} · ${startTime}${endTime ? `–${endTime}` : ''}`
    }
    return start
  }

  return (
    <div className="console-page px-5 sm:px-8 pb-3 text-[#18170F]">
      <div className="console-content max-w-[1400px] mx-auto flex flex-col h-full gap-2.5">

        {/* ── 1. COMPACT CONSOLE HEADER ── */}
        <div className="flex items-center justify-between py-1.5 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-[-0.03em] text-[#18170F] leading-tight">
              Live console
            </h1>
            <p className="text-xs text-[#65625B] leading-tight font-medium">
              Zero-trust visitor verification with Amazon Bedrock claim extraction and deterministic policy enforcement.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#65625B] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#5DA87E]" />
              <span>{activeGuests.length} active guest manifest{activeGuests.length !== 1 ? 's' : ''}</span>
            </div>
            <span className="text-[#DDD6CB]">·</span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#65625B] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#E4A02F]" />
              <span>AI analysis: Demo mode</span>
            </div>
          </div>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#FDEAE9] to-[#FDE0DE] border border-[#F0B5B5] text-[#922525] text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold px-2.5 py-0.5 rounded-lg hover:bg-black/5 cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* ── 2. SCENARIO & SCHEDULED GUESTS SELECTOR RAIL ── */}
        <div className="shrink-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-extrabold text-[#18170F] uppercase tracking-[0.08em]">Select visitor scenario</h2>
              <span className="text-[11px] text-[#918C84] font-medium">· Pick a scheduled guest or delivery scenario</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#65625B]">
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#DDD6CB] font-bold text-[#18170F] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                {activeGuests.length} Scheduled Guest{activeGuests.length !== 1 ? 's' : ''}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#DDD6CB] font-medium text-[#65625B] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                {SCENARIO_PRESETS.length} Presets
              </span>
            </div>
          </div>

          <div ref={scenarioRailRef} className="scenario-rail pb-1">
            {/* ── DYNAMIC SCHEDULED GUESTS ── */}
            {activeGuests.map((guest) => {
              const isSelected = selectedGuestId === guest.id
              const autoApproved = guest.auto_approve
              return (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => {
                    setSelectedGuestId(guest.id)
                    setSelectedScenarioId('')
                    setLastEvent(null)
                  }}
                  className={`flex-none w-[215px] p-3.5 rounded-2xl text-left cursor-pointer transition-all duration-250 border ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#FDE7E2] to-[#FBD5CE] border-[#E5654F] border-2 shadow-[0_6px_20px_rgba(229,101,79,0.14)] -translate-y-0.5'
                      : 'bg-[#FFFDFB] border-[#DDD6CB] hover:border-[#CBC5BC] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-white text-[#E5654F] shadow-sm' : autoApproved ? 'bg-gradient-to-br from-[#E1F3E7] to-[#D2EDDA] text-[#186941]' : 'bg-gradient-to-br from-[#FFF1D2] to-[#FDE8B6] text-[#7A4E00]'}`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#E5654F]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-[#18170F] leading-tight truncate">{guest.name}</h3>
                    <p className="text-[11px] text-[#65625B] mt-0.5 leading-snug truncate font-medium">{guest.visitor_type || guest.entry_type}</p>
                    <p className="text-[10px] text-[#918C84] mt-0.5 leading-none truncate">{formatWindow(guest.scheduled_start, guest.scheduled_end)}</p>
                  </div>
                  <div className="mt-2">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                      autoApproved
                        ? 'bg-[#E1F3E7] text-[#186941] border-[#A8DFB8]'
                        : 'bg-[#FFF1D2] text-[#7A4E00] border-[#F0D190]'
                    }`}>
                      {autoApproved ? 'Auto-approval enabled' : 'Requires confirmation'}
                    </span>
                  </div>
                </button>
              )
            })}

            {/* ── PRESET SCENARIOS ── */}
            {SCENARIO_PRESETS.map((preset) => {
              const isSelected = !selectedGuestId && selectedScenarioId === preset.id
              const accent = getScenarioAccent(preset.expectedDecision)
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedScenarioId(preset.id)
                    setSelectedGuestId(null)
                    setLastEvent(null)
                  }}
                  className={`flex-none w-[215px] p-3.5 rounded-2xl text-left cursor-pointer transition-all duration-250 border ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#FDE7E2] to-[#FBD5CE] border-[#E5654F] border-2 shadow-[0_6px_20px_rgba(229,101,79,0.14)] -translate-y-0.5'
                      : 'bg-[#FFFDFB] border-[#DDD6CB] hover:border-[#CBC5BC] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-white text-[#E5654F] shadow-sm' : `bg-gradient-to-br ${accent.bg} ${accent.icon}`}`}>
                      {getScenarioIcon(preset.id)}
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#E5654F]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-[#18170F] leading-tight truncate">{preset.title}</h3>
                    <p className="text-[11px] text-[#65625B] mt-0.5 leading-snug truncate font-medium">{preset.subtitle}</p>
                    <p className="text-[10px] text-[#918C84] mt-0.5 leading-none">Standard preset</p>
                  </div>
                  <div className="mt-2">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${accent.bg} ${accent.text} ${accent.border}`}>
                      {preset.tag}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 3. MAIN WORKSPACE: EVENT THEATER + DECISION CENTER ── */}
        <div className="main-workspace min-h-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-3.5">

          {/* ─── LEFT: EVENT THEATER ─── */}
          <div className="product-card flex flex-col min-h-0 overflow-hidden bg-[#FFFDFB]">
            {/* Theater Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#DDD6CB] shrink-0 bg-gradient-to-r from-[#FFFDFB] to-[#F8F5F0]">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${lastEvent ? 'bg-[#5DA87E]' : loading ? 'bg-[#E5654F] pulse-coral' : 'bg-[#918C84]'}`} />
                <h2 className="text-xs font-extrabold text-[#18170F] uppercase tracking-[0.08em]">Doorbell event theater</h2>
              </div>
              <span className="text-[11px] text-[#918C84] font-medium">
                {currentGuest ? `Scheduled Guest · ${currentGuest.name}` : currentPreset?.title || 'Front door sensor'}
              </span>
            </div>

            {/* Theater Body */}
            <div className="flex-1 panel-scrollable px-5 py-4 flex flex-col">
              {!lastEvent && !loading ? (
                /* Idle State */
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#918C84] font-bold">
                        Expected visitor transcript
                      </span>
                      {currentGuest && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E1F3E7] text-[#186941] font-bold border border-[#A8DFB8]">
                          Active Manifest: {currentGuest.id}
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB]">
                      <p className="text-sm sm:text-base font-semibold text-[#18170F] leading-relaxed italic">
                        "{currentTranscript}"
                      </p>
                    </div>

                    {/* Result Preview */}
                    <div className="p-3.5 rounded-xl bg-white border border-[#DDD6CB] text-xs space-y-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-between text-[#65625B]">
                        <span className="font-medium">Expected action:</span>
                        <span className="font-bold text-[#18170F]">
                          {currentGuest
                            ? currentGuest.auto_approve
                              ? 'SIMULATED_UNLOCK_MAIN_DOOR (Auto-Approval)'
                              : 'REQUIRE_OWNER_APPROVAL (Owner Review)'
                            : currentPreset?.expectedDecision || 'Verification'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#65625B]">
                        <span className="font-medium">Sensor trigger:</span>
                        <span className="font-mono text-[11px] text-[#18170F] font-semibold">ding (Front door chime)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DDD6CB] flex items-center justify-between">
                    <span className="text-[11px] text-[#918C84] font-medium">Ready to run zero-trust policy</span>
                    <button
                      onClick={handleTriggerEvent}
                      disabled={loading}
                      className="h-[44px] px-6 rounded-full bg-gradient-to-r from-[#18170F] to-[#2A2825] hover:from-[#E5654F] hover:to-[#F2815E] text-white text-xs font-bold shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(229,101,79,0.25)] transition-all duration-300 flex items-center gap-2.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {currentGuest ? <Key className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{currentGuest ? 'Check scheduled guest' : 'Run visitor event'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : loading && !lastEvent ? (
                /* Processing State */
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FDE7E2] to-[#FBD5CE] flex items-center justify-center pulse-coral shadow-[0_6px_24px_rgba(229,101,79,0.15)]">
                    <Bell className="w-7 h-7 text-[#E5654F] stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#18170F] tracking-tight">{processingLabel || 'Processing…'}</h3>
                    <p className="text-xs text-[#65625B] mt-1 max-w-[280px] truncate font-medium">"{currentTranscript}"</p>
                  </div>
                  {/* Inline pipeline progress */}
                  <div className="flex items-center gap-2 mt-1">
                    {PIPELINE_STEPS.map((step, idx) => (
                      <div key={step} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          idx <= pipelineStep ? 'bg-gradient-to-br from-[#E5654F] to-[#F2815E] scale-110 shadow-[0_2px_8px_rgba(229,101,79,0.3)]' : 'bg-[#DDD6CB]'
                        }`} />
                        <span className={`text-[10px] font-semibold transition-colors ${
                          idx <= pipelineStep ? 'text-[#18170F]' : 'text-[#918C84]'
                        }`}>{step}</span>
                        {idx < PIPELINE_STEPS.length - 1 && (
                          <div className={`w-3 h-[2px] rounded-full transition-all duration-300 ${
                            idx < pipelineStep ? 'bg-[#E5654F]' : 'bg-[#DDD6CB]'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : lastEvent ? (
                /* Completed Event State */
                <div className="flex-1 flex flex-col justify-between gap-3 fade-up-in">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#918C84] font-bold">
                        Audio transcript processed
                      </span>
                      <span className="text-[10px] font-mono text-[#65625B] font-semibold">
                        Device: {lastEvent.event_id}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB]">
                      <p className="text-sm sm:text-base font-bold text-[#18170F] leading-snug tracking-tight">
                        "{lastEvent.transcript}"
                      </p>
                    </div>

                    {/* Pipeline complete checkmarks */}
                    <div className="flex items-center gap-2 flex-wrap py-1">
                      {PIPELINE_STEPS.map((step, idx) => (
                        <div key={step} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#5DA87E]" />
                          <span className="text-[11px] font-semibold text-[#18170F]">{step}</span>
                          {idx < PIPELINE_STEPS.length - 1 && (
                            <span className="text-[#DDD6CB] mx-0.5">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulate Again / Re-run */}
                  <div className="pt-2.5 border-t border-[#DDD6CB] flex items-center justify-between">
                    <button
                      onClick={() => setTimelineDrawerOpen(true)}
                      className="text-xs font-semibold text-[#65625B] hover:text-[#18170F] flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>View decision timeline</span>
                    </button>
                    <button
                      onClick={handleTriggerEvent}
                      disabled={loading}
                      className="h-[40px] px-5 rounded-full bg-gradient-to-r from-[#18170F] to-[#2A2825] hover:from-[#E5654F] hover:to-[#F2815E] text-white text-xs font-bold shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(229,101,79,0.2)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Simulate again</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* ─── RIGHT: DECISION CENTER ─── */}
          <div className="product-card flex flex-col min-h-0 overflow-hidden bg-[#FFFDFB]">
            {/* Decision Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#DDD6CB] shrink-0 bg-gradient-to-r from-[#FFFDFB] to-[#F8F5F0]">
              <h2 className="text-xs font-extrabold text-[#18170F] uppercase tracking-[0.08em]">Policy decision center</h2>
              {lastEvent && (
                <button
                  onClick={() => setDetailsDrawerOpen(true)}
                  className="text-[11px] font-semibold text-[#65625B] hover:text-[#E5654F] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Technical details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Decision Body */}
            <div className="flex-1 panel-scrollable px-5 py-4 flex flex-col">
              {!lastEvent ? (
                /* Idle State */
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                    <Layers className="w-6 h-6 text-[#918C84]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#18170F] tracking-tight">No decision yet</h3>
                    <p className="text-xs text-[#65625B] mt-1 max-w-[260px] leading-relaxed font-medium">
                      Select a scheduled guest or scenario and click to run verification.
                    </p>
                  </div>
                </div>
              ) : (
                /* Decision Result */
                <div className="flex-1 flex flex-col gap-3 fade-up-in">
                  {/* Primary Decision Banner */}
                  {(() => {
                    const ds = getDecisionStyles()
                    return (
                      <div className={`p-4 rounded-2xl ${ds.bg} border ${ds.border} ${ds.glow}`}>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5">
                          {isApproved && <CheckCircle2 className={`w-4 h-4 ${ds.text}`} />}
                          {isReview && <AlertTriangle className={`w-4 h-4 ${ds.text}`} />}
                          {isDenied && <ShieldAlert className={`w-4 h-4 ${ds.text}`} />}
                          <span className={ds.text}>{ds.badge}</span>
                        </div>
                        <h3 className={`text-lg sm:text-xl font-extrabold tracking-[-0.02em] leading-snug ${ds.text}`}>
                          {ds.label}
                        </h3>
                        <p className={`text-xs mt-1.5 leading-relaxed opacity-90 font-medium ${ds.text}`}>
                          {lastEvent.reason}
                        </p>

                        {/* Matched Schedule Box */}
                        {matchedSchedule && (
                          <div className="mt-3 p-3 rounded-xl bg-white/70 border border-current/15 text-xs backdrop-blur-sm">
                            <span className="font-bold block text-[11px] opacity-80">Matched schedule:</span>
                            <div className="flex items-center justify-between mt-0.5 font-semibold">
                              <span>{matchedSchedule.name} · {matchedSchedule.visitor_type || matchedSchedule.entry_type}</span>
                              <span className="text-[10px]">{formatWindow(matchedSchedule.scheduled_start, matchedSchedule.scheduled_end)}</span>
                            </div>
                          </div>
                        )}

                        {/* Simulated Action & Safety Notice */}
                        <div className={`mt-3 pt-3 border-t border-current/15 flex flex-col gap-1.5 text-[11px] ${ds.text}`}>
                          <div className="flex items-center justify-between font-bold">
                            <span>Simulated action: {ds.actionDisplay}</span>
                            <span className="tabular-nums">Confidence: {(lastEvent.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <div className="text-[10px] opacity-80 italic font-medium">
                            Simulation only. No physical door or lock is controlled. Physical door control is disabled in this prototype.
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Diagnostics: Structured Check when denied or unapproved */}
                  {(!isApproved || isDenied) && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB] text-xs space-y-2">
                      <span className="font-extrabold text-[#18170F] text-[11px] block tracking-tight">
                        Guest verification diagnostics:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#65625B]">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${lastEvent.matched_schedule_id ? 'bg-[#5DA87E]' : 'bg-[#E5654F]'}`} />
                          <span className="font-medium">1. Name matched: {lastEvent.matched_schedule_id ? 'Yes' : 'No match'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${matchedSchedule?.status === 'active' ? 'bg-[#5DA87E]' : 'bg-[#918C84]'}`} />
                          <span className="font-medium">2. Schedule status: {matchedSchedule?.status || 'None'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${!lastEvent.risk_flags.includes('EXPIRED_WINDOW') ? 'bg-[#5DA87E]' : 'bg-[#E5654F]'}`} />
                          <span className="font-medium">3. Time window: {!lastEvent.risk_flags.includes('EXPIRED_WINDOW') ? 'Valid' : 'Expired / Outside'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${matchedSchedule?.auto_approve ? 'bg-[#5DA87E]' : 'bg-[#E4A02F]'}`} />
                          <span className="font-medium">4. Auto-approval: {matchedSchedule?.auto_approve ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                      {lastEvent.risk_flags.length > 0 && (
                        <div className="pt-1 text-[10px] text-[#922525] flex items-center gap-1.5 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>5. Risk indicators detected: {lastEvent.risk_flags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expandable Evidence Rows */}
                  <div className="space-y-1.5">
                    {/* Schedule Evidence */}
                    <button
                      onClick={() => toggleEvidence('schedule')}
                      className="w-full p-3 rounded-xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB] flex items-center justify-between text-left cursor-pointer hover:border-[#CBC5BC] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${lastEvent.matched_schedule_id ? 'bg-[#5DA87E]' : 'bg-[#918C84]'}`} />
                        <span className="text-xs font-bold text-[#18170F]">Schedule match</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#65625B] font-medium">
                          {lastEvent.matched_schedule_id ? `Matched [${lastEvent.matched_schedule_id}]` : 'No match'}
                        </span>
                        {expandedEvidence.schedule ? <ChevronUp className="w-3.5 h-3.5 text-[#918C84]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#918C84]" />}
                      </div>
                    </button>
                    {expandedEvidence.schedule && (
                      <div className="px-3.5 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#DDD6CB] text-xs text-[#65625B] grid grid-cols-3 gap-2">
                        <div>
                          <span className="font-bold text-[#18170F] block">Claimed identity</span>
                          <span className="truncate block font-medium">{lastEvent.visitor_analysis?.claimed_identity || lastEvent.visitor_analysis?.visitor_name || 'None'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[#18170F] block">Matched manifest</span>
                          <span className="truncate block font-medium">{lastEvent.matched_schedule_id ? `${matchedSchedule?.name || lastEvent.matched_schedule_id}` : 'None'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[#18170F] block">Result</span>
                          <span className={lastEvent.matched_schedule_id ? 'text-[#186941] font-bold' : 'text-[#922525] font-bold'}>
                            {lastEvent.matched_schedule_id ? 'Verified' : 'Unmatched'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. COMPACT EVENT TRACE BAR ── */}
        <div className="h-[48px] shrink-0 flex items-center justify-between px-4 rounded-2xl bg-[#FFFDFB] border border-[#DDD6CB] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            {['Event received', 'Claims extracted', 'Schedule checked', 'Policy evaluated', 'Simulated execution'].map((step, idx) => (
              <div key={step} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                  lastEvent ? 'bg-[#5DA87E]' :
                  loading && idx <= pipelineStep ? 'bg-[#E5654F]' :
                  'bg-[#DDD6CB]'
                }`} />
                <span className={`text-[10px] font-semibold transition-colors ${
                  lastEvent || (loading && idx <= pipelineStep) ? 'text-[#18170F]' : 'text-[#918C84]'
                }`}>{step}</span>
                {idx < 4 && <div className={`w-2.5 h-[2px] rounded-full ${
                  lastEvent ? 'bg-[#5DA87E]' :
                  loading && idx < pipelineStep ? 'bg-[#E5654F]' :
                  'bg-[#DDD6CB]'
                }`} />}
              </div>
            ))}
          </div>
          <button
            onClick={() => lastEvent && setTimelineDrawerOpen(true)}
            className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              lastEvent ? 'text-[#65625B] hover:text-[#E5654F]' : 'text-[#918C84] cursor-default'
            }`}
          >
            <span>Full audit</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── TECHNICAL DETAILS DRAWER ── */}
      {detailsDrawerOpen && lastEvent && (
        <>
          <div className="drawer-overlay" onClick={() => setDetailsDrawerOpen(false)} />
          <div className="drawer-panel">
            <div className="sticky top-0 bg-[#FFFDFB] border-b border-[#DDD6CB] px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-extrabold text-[#18170F] tracking-tight">Technical details</h3>
                <p className="text-xs text-[#65625B] font-medium">Bedrock extraction, schedule match, and policy rules</p>
              </div>
              <button onClick={() => setDetailsDrawerOpen(false)} className="p-2.5 rounded-full hover:bg-black/5 cursor-pointer transition-colors">
                <X className="w-5 h-5 text-[#65625B]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-6">
              {/* Bedrock Claims */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-[#918C84] mb-2.5">Bedrock claim extraction</h4>
                <div className="rounded-xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB] p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Identity</span><span className="font-bold text-[#18170F]">{lastEvent.visitor_analysis?.claimed_identity || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Visitor name</span><span className="font-bold text-[#18170F]">{lastEvent.visitor_analysis?.visitor_name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Organization</span><span className="font-bold text-[#18170F]">{lastEvent.visitor_analysis?.organization || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Recipient</span><span className="font-bold text-[#18170F]">{lastEvent.visitor_analysis?.recipient || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Purpose</span><span className="font-bold text-[#18170F]">{lastEvent.visitor_analysis?.purpose || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Requested action</span><span className="font-bold text-[#18170F]">{lastEvent.visitor_analysis?.requested_action || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Urgency</span><span className="font-bold text-[#18170F] capitalize">{lastEvent.visitor_analysis?.urgency_level || 'normal'}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">AI confidence</span><span className="font-bold text-[#18170F] tabular-nums">{((lastEvent.visitor_analysis?.confidence || lastEvent.confidence) * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Engine</span><span className="font-bold text-[#18170F]">{lastEvent.engine}</span></div>
                </div>
              </div>

              {/* Matched Schedule */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-[#918C84] mb-2.5">Matched schedule</h4>
                <div className="rounded-xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB] p-4 text-xs">
                  {lastEvent.matched_schedule_id ? (
                    <div className="space-y-2.5">
                      <div className="flex justify-between"><span className="text-[#65625B] font-medium">Schedule ID</span><span className="font-mono font-bold text-[#18170F]">{lastEvent.matched_schedule_id}</span></div>
                      <div className="flex justify-between"><span className="text-[#65625B] font-medium">Name</span><span className="font-bold text-[#18170F]">{matchedSchedule?.name || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-[#65625B] font-medium">Type</span><span className="font-bold text-[#18170F]">{matchedSchedule?.visitor_type || matchedSchedule?.entry_type || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-[#65625B] font-medium">Status</span><span className="font-bold text-[#186941]">Active</span></div>
                      <div className="flex justify-between"><span className="text-[#65625B] font-medium">Auto-approved</span><span className="font-bold text-[#18170F]">{matchedSchedule?.auto_approve ? 'Yes' : 'No'}</span></div>
                    </div>
                  ) : (
                    <span className="text-[#65625B] font-medium">No matching schedule found</span>
                  )}
                </div>
              </div>

              {/* Policy */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-[#918C84] mb-2.5">Policy evaluation</h4>
                <div className="rounded-xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB] p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Decision</span><span className="font-bold text-[#18170F]">{lastEvent.decision}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Action</span><span className="font-bold text-[#18170F]">{lastEvent.action}</span></div>
                  <div className="flex justify-between"><span className="text-[#65625B] font-medium">Confidence</span><span className="font-bold text-[#18170F] tabular-nums">{(lastEvent.confidence * 100).toFixed(0)}%</span></div>
                </div>
              </div>

              {/* Risk Flags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-[#918C84] mb-2.5">Risk flags</h4>
                <div className="rounded-xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] border border-[#DDD6CB] p-4 text-xs">
                  {lastEvent.risk_flags && lastEvent.risk_flags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {lastEvent.risk_flags.map((flag) => (
                        <span key={flag} className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FDEAE9] to-[#FDE0DE] text-[#922525] border border-[#F0B5B5] text-[10px] font-bold">
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#5DA87E] font-semibold">No risk flags detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TIMELINE DRAWER ── */}
      {timelineDrawerOpen && lastEvent && (
        <>
          <div className="drawer-overlay" onClick={() => setTimelineDrawerOpen(false)} />
          <div className="drawer-panel">
            <div className="sticky top-0 bg-[#FFFDFB] border-b border-[#DDD6CB] px-6 py-5 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-extrabold text-[#18170F] tracking-tight">Decision timeline</h3>
                <p className="text-xs text-[#65625B] font-medium">Event ID: {lastEvent.event_id}</p>
              </div>
              <button onClick={() => setTimelineDrawerOpen(false)} className="p-2.5 rounded-full hover:bg-black/5 cursor-pointer transition-colors">
                <X className="w-5 h-5 text-[#65625B]" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-5 relative pl-5 border-l-2 border-[#DDD6CB] ml-2">
                {lastEvent.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full border-[2.5px] bg-[#FFFDFB] ${
                      step.status === 'flagged' ? 'border-[#E5654F]' :
                      step.status === 'neutral' ? 'border-[#E4A02F]' :
                      'border-[#5DA87E]'
                    }`} />
                    <div className="text-[11px] text-[#918C84] tabular-nums font-semibold">{step.timestamp}</div>
                    <div className="text-sm font-extrabold text-[#18170F] tracking-tight">{step.stage}</div>
                    <p className="text-xs text-[#65625B] mt-0.5 leading-relaxed font-medium">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
