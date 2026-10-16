import React, { useState, useEffect } from 'react'
import {
  Bell,
  Server,
  Cpu,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Lock,
  Layers
} from 'lucide-react'
import { subscribeToEventStream } from '../../lib/api'
import { WebhookResponse } from '../../types'

export type ArchitectureNode = {
  id: string
  number: string
  title: string
  shortLabel: string
  purpose: string
  description: string
  technology: string[]
  input: string
  output: string
  securityBoundary: string
  category: 'event' | 'backend' | 'ai' | 'schedule' | 'policy' | 'action'
  color: {
    primary: string
    accentHex: string
    badgeBg: string
    badgeText: string
    borderAccent: string
    iconBg: string
    iconText: string
    activeGradient: string
    activeRing: string
    activeShadow: string
  }
}

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'ring-event',
    number: '01',
    title: 'Ring event',
    shortLabel: 'Motion or chime detected',
    purpose: 'Detect physical arrival and ingest visitor audio stream.',
    description:
      'A Ring doorbell or built-in virtual simulator sends a motion or chime trigger with a visitor speech transcript.',
    technology: ['Ring API', 'Webhook Trigger', 'Event Normalizer'],
    input: 'Motion, chime, device ID, transcript, timestamp',
    output: 'Validated RingEvent object',
    securityBoundary: 'Ingests raw untrusted hardware signal into security perimeter.',
    category: 'event',
    color: {
      primary: 'Cosmic Latte Ingest',
      accentHex: '#B7A89A',
      badgeBg: 'bg-[#FAF6EF] text-[#615348] border-[#C9BCB0]',
      badgeText: 'text-[#615348]',
      borderAccent: 'border-t-[#B7A89A]',
      iconBg: 'bg-[#E8DCC6]/60 text-[#615348]',
      iconText: 'text-[#615348]',
      activeGradient: 'from-[#B7A89A] to-[#8C7D6F]',
      activeRing: 'ring-[#B7A89A]',
      activeShadow: 'shadow-[0_16px_36px_rgba(183,168,154,0.45)]'
    }
  },
  {
    id: 'fastapi-ingest',
    number: '02',
    title: 'FastAPI ingest',
    shortLabel: 'Validate and normalize',
    purpose: 'Validate incoming payload and enforce webhook authentication.',
    description:
      'The FastAPI service verifies the X-Ring-Token header, enforces payload schemas, and creates an immutable audit record.',
    technology: ['FastAPI', 'Pydantic v2', 'Token Validator'],
    input: 'Raw incoming webhook payload',
    output: 'Normalized and sanitized event object',
    securityBoundary: 'Rejects unauthenticated or malformed requests before processing.',
    category: 'backend',
    color: {
      primary: 'Royal Indigo',
      accentHex: '#6366F1',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badgeText: 'text-indigo-700',
      borderAccent: 'border-t-[#6366F1]',
      iconBg: 'bg-indigo-100 text-indigo-700',
      iconText: 'text-indigo-700',
      activeGradient: 'from-[#6366F1] to-[#4F46E5]',
      activeRing: 'ring-indigo-400',
      activeShadow: 'shadow-[0_16px_36px_rgba(99,102,241,0.35)]'
    }
  },
  {
    id: 'bedrock-analysis',
    number: '03',
    title: 'Bedrock claim extraction',
    shortLabel: 'Understand visitor speech',
    purpose: 'Understand what the visitor is claiming through natural language speech.',
    description:
      'Amazon Bedrock (Claude 3.5 Haiku) extracts claimed identity, organization, recipient, purpose, urgency, and potential risk flags.',
    technology: ['Amazon Bedrock', 'Claude 3.5 Haiku', 'Structured JSON'],
    input: 'Visitor speech transcript',
    output: 'Structured visitor claims object with risk indicators',
    securityBoundary: 'Bedrock extracts claims. It does not authorize access or control locks.',
    category: 'ai',
    color: {
      primary: 'Amber Spark',
      accentHex: '#EA580C',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      badgeText: 'text-orange-700',
      borderAccent: 'border-t-[#EA580C]',
      iconBg: 'bg-orange-100 text-orange-700',
      iconText: 'text-orange-700',
      activeGradient: 'from-[#EA580C] to-[#C2410C]',
      activeRing: 'ring-orange-400',
      activeShadow: 'shadow-[0_16px_36px_rgba(234,88,12,0.35)]'
    }
  },
  {
    id: 'schedule-match',
    number: '04',
    title: 'Schedule match',
    shortLabel: 'Check expected visitors',
    purpose: 'Cross-reference visitor claims against active homeowner manifests.',
    description:
      'The structured claims are matched against registered package deliveries, expected caretakers, contractors, and guests.',
    technology: ['Schedule Store', 'JSON Manifest', 'Time Window Matcher'],
    input: 'Structured claims and active schedule records',
    output: 'Matched manifest record or unmatched flag',
    securityBoundary: 'Validates claims against authoritative homeowner records.',
    category: 'schedule',
    color: {
      primary: 'Teal Manifest',
      accentHex: '#0D9488',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      badgeText: 'text-teal-700',
      borderAccent: 'border-t-[#0D9488]',
      iconBg: 'bg-teal-100 text-teal-700',
      iconText: 'text-teal-700',
      activeGradient: 'from-[#0D9488] to-[#0F766E]',
      activeRing: 'ring-teal-400',
      activeShadow: 'shadow-[0_16px_36px_rgba(13,148,136,0.35)]'
    }
  },
  {
    id: 'policy-engine',
    number: '05',
    title: 'Deterministic policy',
    shortLabel: 'Apply zero-trust rules',
    purpose: 'Enforce deterministic zero-trust access control rules.',
    description:
      'The policy engine makes the final authorization. AI never independently unlocks a door. Unannounced strangers or urgency flags are escalated or denied.',
    technology: ['Deterministic Policy', 'Zero-Trust Engine', 'Fail-Closed Guard'],
    input: 'Claims, schedule match, risk indicators',
    output: 'Approved, review required, or access denied verdict',
    securityBoundary: 'Deterministic authorization. Only verified conditions trigger access.',
    category: 'policy',
    color: {
      primary: 'Deep Burgundy Zero-Trust',
      accentHex: '#722F37',
      badgeBg: 'bg-[#F7EFF0] text-[#722F37] border-[#DAB3B9]',
      badgeText: 'text-[#722F37]',
      borderAccent: 'border-t-[#722F37]',
      iconBg: 'bg-[#F7EFF0] text-[#722F37]',
      iconText: 'text-[#722F37]',
      activeGradient: 'from-[#722F37] to-[#4A1C22]',
      activeRing: 'ring-[#8D3A44]',
      activeShadow: 'shadow-[0_16px_36px_rgba(114,47,55,0.45)]'
    }
  },
  {
    id: 'action-audit',
    number: '06',
    title: 'Action and audit',
    shortLabel: 'Respond and record',
    purpose: 'Simulate safe physical hardware action and log complete audit trail.',
    description:
      'The system simulates the safe response (such as unlocking a porch box), alerts the homeowner if review is needed, and streams real-time updates.',
    technology: ['Action Simulator', 'SSE Stream', 'Audit Store'],
    input: 'Final policy decision and parameters',
    output: 'Simulated hardware state, homeowner notification, audit log',
    securityBoundary: 'Maintains fail-closed lock state. Simulates all actions safely.',
    category: 'action',
    color: {
      primary: 'Emerald Verified',
      accentHex: '#16A34A',
      badgeBg: 'bg-green-50 text-green-700 border-green-200',
      badgeText: 'text-green-700',
      borderAccent: 'border-t-[#16A34A]',
      iconBg: 'bg-green-100 text-green-700',
      iconText: 'text-green-700',
      activeGradient: 'from-[#16A34A] to-[#15803D]',
      activeRing: 'ring-green-400',
      activeShadow: 'shadow-[0_16px_36px_rgba(22,163,74,0.35)]'
    }
  }
]

interface InteractiveArchitectureProps {
  latestEvent?: WebhookResponse | null
  onRunDemoConsole?: () => void
}

export const InteractiveArchitecture: React.FC<InteractiveArchitectureProps> = ({
  latestEvent,
  onRunDemoConsole
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('bedrock-analysis')
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null)
  const [isTracing, setIsTracing] = useState<boolean>(false)
  const [traceResult, setTraceResult] = useState<{
    decision: string
    action: string
    reason: string
  } | null>(null)

  // Listen to live SSE events and advance pipeline
  useEffect(() => {
    const unsubscribe = subscribeToEventStream((eventType) => {
      if (eventType === 'ring_event_received') {
        setActiveStepIndex(0)
      } else if (eventType === 'analysis_started') {
        setActiveStepIndex(2)
      } else if (eventType === 'analysis_completed') {
        setActiveStepIndex(3)
      } else if (eventType === 'policy_evaluated') {
        setActiveStepIndex(4)
      } else if (eventType === 'action_executed') {
        setActiveStepIndex(5)
      }
    })
    return () => unsubscribe()
  }, [])

  const runDecisionTrace = () => {
    setIsTracing(true)
    setTraceResult(null)
    setActiveStepIndex(0)
    setSelectedNodeId(ARCHITECTURE_NODES[0].id)

    const stepInterval = 750 // ~750ms per step for clear readability

    ARCHITECTURE_NODES.forEach((node, index) => {
      setTimeout(() => {
        setActiveStepIndex(index)
        setSelectedNodeId(node.id)

        // When trace finishes
        if (index === ARCHITECTURE_NODES.length - 1) {
          setTimeout(() => {
            setIsTracing(false)
            setTraceResult({
              decision: 'APPROVED_EXPECTED',
              action: 'ALLOW_PACKAGE_DROP',
              reason: 'Verified Amazon delivery matching registered tracking manifest. Porch box safely unlocked.'
            })
          }, stepInterval)
        }
      }, index * stepInterval)
    })
  }

  const loadLatestEventTrace = () => {
    if (latestEvent) {
      setTraceResult({
        decision: latestEvent.decision,
        action: latestEvent.action,
        reason: latestEvent.reason
      })
      setSelectedNodeId('policy-engine')
    } else {
      runDecisionTrace()
    }
  }

  const selectedNode =
    ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) || ARCHITECTURE_NODES[2]

  const getNodeIcon = (id: string, isWhite = false) => {
    const iconClass = `w-5 h-5 ${isWhite ? 'text-white' : ''}`
    switch (id) {
      case 'ring-event':
        return <Bell className={iconClass} />
      case 'fastapi-ingest':
        return <Server className={iconClass} />
      case 'bedrock-analysis':
        return <Cpu className={iconClass} />
      case 'schedule-match':
        return <CalendarCheck className={iconClass} />
      case 'policy-engine':
        return <ShieldCheck className={iconClass} />
      default:
        return <CheckCircle2 className={iconClass} />
    }
  }

  return (
    <div className="space-y-10 text-left text-[#1C1917]">
      {/* ─── SECTION HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#B7A89A]/30 pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8DCC6]/60 border border-[#B7A89A]/40 text-xs font-bold text-[#722F37] uppercase tracking-wider font-editorial">
            <Layers className="w-3.5 h-3.5 text-[#722F37]" />
            <span>Interactive Security Architecture</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1C1917]">
            How the decision is made
          </h2>
          <p className="font-editorial text-base sm:text-lg text-[#5C544D] leading-relaxed">
            GuestVerify strictly separates <strong className="text-[#722F37]">AI-assisted visitor intent</strong> from <strong className="text-[#722F37]">deterministic zero-trust policy enforcement</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 font-display">
          <button
            onClick={runDecisionTrace}
            disabled={isTracing}
            className={`px-7 py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-75 ${
              isTracing
                ? 'bg-gradient-to-r from-[#722F37] via-[#8D3A44] to-[#B7A89A] text-white shadow-[0_8px_24px_rgba(114,47,55,0.4)] animate-pulse'
                : 'bg-gradient-to-r from-[#722F37] to-[#8D3A44] hover:from-[#5C232A] hover:to-[#7E333C] text-white shadow-[0_4px_16px_rgba(114,47,55,0.32)] hover:shadow-[0_8px_24px_rgba(114,47,55,0.45)]'
            }`}
          >
            {isTracing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Tracing Stage {activeStepIndex !== null ? activeStepIndex + 1 : 1} of 6...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Decision Trace</span>
                <Sparkles className="w-3.5 h-3.5 text-[#E8DCC6]" />
              </>
            )}
          </button>

          <button
            onClick={loadLatestEventTrace}
            disabled={isTracing}
            className="px-5 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#E8DCC6]/50 border border-[#B7A89A]/40 text-[#1C1917] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8C8074]" />
            <span>Latest Event</span>
          </button>
        </div>
      </div>

      {/* Progress Bar for Active Trace */}
      {isTracing && (
        <div className="w-full bg-[#E8DCC6]/40 h-1.5 rounded-full overflow-hidden border border-[#B7A89A]/30">
          <div
            className="bg-gradient-to-r from-[#B7A89A] via-[#722F37] to-[#16A34A] h-full transition-all duration-500 ease-out"
            style={{ width: `${(((activeStepIndex ?? 0) + 1) / 6) * 100}%` }}
          />
        </div>
      )}

      {/* ─── 6-NODE HORIZONTAL PIPELINE WITH DYNAMIC STYLES ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {ARCHITECTURE_NODES.map((node, index) => {
          const isSelected = selectedNodeId === node.id
          const isActiveStep = activeStepIndex === index
          const isPassedStep = activeStepIndex !== null && activeStepIndex > index

          // Determine card styling based on state
          let cardClasses = 'relative p-6 text-left cursor-pointer transition-all duration-300 flex flex-col justify-between rounded-[22px] border h-[225px] overflow-hidden '
          
          if (isActiveStep) {
            // Dynamic Active State: Changes background color to the stage's vibrant gradient!
            cardClasses += `bg-gradient-to-br ${node.color.activeGradient} text-white ${node.color.activeShadow} scale-[1.04] ring-4 ${node.color.activeRing} z-10 border-transparent animate-in zoom-in-95 duration-200`
          } else if (isPassedStep) {
            // Passed State: Crisp highlighted card with green check mark
            cardClasses += 'bg-[#F9FCFA] border-[#A8DFB8] shadow-sm hover:shadow-md'
          } else if (isSelected) {
            // Selected for Inspection
            cardClasses += `bg-[#FCFAF6] border-2 border-[#722F37] ${node.color.borderAccent} shadow-[0_12px_32px_rgba(114,47,55,0.12)] -translate-y-1`
          } else {
            // Idle State: Clean warm card with subtle top color border and soft hover
            cardClasses += `bg-[#FCFAF6] border-[#DCD2C3] ${node.color.borderAccent} hover:border-[#B7A89A] hover:shadow-[0_8px_24px_rgba(114,47,55,0.06)] hover:-translate-y-0.5`
          }

          return (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={cardClasses}
            >
              <div>
                {/* Top Badge & Status Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-bold tracking-tight ${isActiveStep ? 'text-white/80' : 'text-[#8C8074]'}`}>
                    STAGE {node.number}
                  </span>

                  {isActiveStep ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>Active</span>
                    </span>
                  ) : isPassedStep ? (
                    <span className="w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[11px] shadow-sm font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#722F37]' : 'bg-[#B7A89A]/30'}`} />
                  )}
                </div>

                {/* Node Icon Container */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                  isActiveStep
                    ? 'bg-white/20 text-white shadow-inner'
                    : isPassedStep
                    ? 'bg-green-100 text-[#16A34A]'
                    : node.color.iconBg
                }`}>
                  {getNodeIcon(node.id, isActiveStep)}
                </div>

                {/* Title & Short Label */}
                <h3 className={`font-display font-bold text-[14px] leading-tight ${isActiveStep ? 'text-white' : 'text-[#1C1917]'}`}>
                  {node.title}
                </h3>
                <p className={`text-[12px] mt-1 leading-snug line-clamp-2 ${isActiveStep ? 'text-white/90' : 'text-[#5C544D]'}`}>
                  {node.shortLabel}
                </p>
              </div>

              {/* Bottom Inspection Indicator */}
              <div className={`text-[11px] font-semibold flex items-center justify-between pt-2.5 border-t ${
                isActiveStep ? 'border-white/20 text-white/90' : 'border-[#B7A89A]/20 text-[#8C8074]'
              }`}>
                <span>{isActiveStep ? 'Analyzing...' : isSelected ? 'Inspecting' : 'Click to inspect'}</span>
                {isSelected && !isActiveStep && <span className="w-1.5 h-1.5 rounded-full bg-[#722F37]" />}
                {isActiveStep && <ArrowRight className="w-3 h-3 text-white animate-bounce" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Trace result banner */}
      {traceResult && (
        <div className="p-6 rounded-[24px] bg-gradient-to-r from-[#FAF7F2] to-[#E8DCC6]/50 border border-[#B7A89A]/40 text-[#722F37] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#722F37] text-[#FAF7F2] flex items-center justify-center shadow-md shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#722F37]">Trace Pipeline Complete:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#722F37]/15 text-[#722F37] text-xs font-bold font-mono">
                  {traceResult.decision}
                </span>
              </div>
              <p className="text-xs text-[#5C544D] mt-1 leading-relaxed">{traceResult.reason}</p>
            </div>
          </div>
          <button
            onClick={() => setTraceResult(null)}
            className="text-xs font-bold px-4 py-2 rounded-full bg-white hover:bg-neutral-50 text-[#722F37] border border-[#B7A89A]/40 shadow-sm transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── NODE DETAIL INSPECTION PANEL ─── */}
      <div className={`p-8 sm:p-10 rounded-[28px] bg-[#FCFAF6] border border-[#DCD2C3] shadow-[0_12px_40px_rgba(114,47,55,0.05)] space-y-7 transition-all duration-300 ${selectedNode.color.borderAccent} border-t-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B7A89A]/20 pb-6">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${selectedNode.color.iconBg} flex items-center justify-center shadow-sm`}>
              {getNodeIcon(selectedNode.id)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#8C8074]">
                  STAGE {selectedNode.number}
                </span>
                <span className="text-black/20">•</span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${selectedNode.color.badgeBg}`}>
                  {selectedNode.color.primary}
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-[#1C1917] mt-0.5">
                {selectedNode.title}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {selectedNode.technology.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#FAF7F2] text-[#5C544D] border border-[#B7A89A]/30"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <p className="font-editorial text-base text-[#5C544D] leading-relaxed">
          {selectedNode.description}
        </p>

        {/* 4 Dimension Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#B7A89A]/30 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8074] block font-editorial">
              Purpose
            </span>
            <span className="text-[#1C1917] font-medium leading-snug block">{selectedNode.purpose}</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#B7A89A]/30 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8074] block font-editorial">
              Input
            </span>
            <span className="text-[#1C1917] font-medium leading-snug block">{selectedNode.input}</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#B7A89A]/30 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8074] block font-editorial">
              Output
            </span>
            <span className="text-[#1C1917] font-medium leading-snug block">{selectedNode.output}</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#B7A89A]/30 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8074] block font-editorial">
              Security Boundary
            </span>
            <span className="text-[#1C1917] font-semibold leading-snug block">
              {selectedNode.securityBoundary}
            </span>
          </div>
        </div>
      </div>

      {/* ─── DUAL SECURITY BOUNDARY CARDS (Core Differentiator) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[28px] bg-[#FCFAF6] border border-[#DCD2C3] shadow-sm space-y-3 relative overflow-hidden border-t-4 border-t-[#B7A89A]">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#615348]">
            <Cpu className="w-4 h-4" />
            <span>Responsibility 01</span>
          </div>
          <h4 className="font-display text-xl font-bold tracking-tight text-[#1C1917]">
            AI-Assisted Interpretation
          </h4>
          <p className="font-editorial text-sm text-[#5C544D] leading-relaxed">
            Amazon Bedrock parses noisy natural visitor speech, identifies claimed carriers and recipients, and detects urgency or coercion indicators. It never makes the final security verdict or directly unlocks any hardware.
          </p>
        </div>

        <div className="p-8 rounded-[28px] bg-[#FCFAF6] border border-[#DCD2C3] shadow-sm space-y-3 relative overflow-hidden border-t-4 border-t-[#722F37]">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#722F37]">
            <Shield className="w-4 h-4" />
            <span>Responsibility 02</span>
          </div>
          <h4 className="font-display text-xl font-bold tracking-tight text-[#1C1917]">
            Deterministic Authorization
          </h4>
          <p className="font-editorial text-sm text-[#5C544D] leading-relaxed">
            A zero-trust policy engine strictly verifies claims against registered delivery manifests and homeowner guest lists. Unrecognized visitors require homeowner PIN approval or trigger a security denial.
          </p>
        </div>
      </div>
    </div>
  )
}
