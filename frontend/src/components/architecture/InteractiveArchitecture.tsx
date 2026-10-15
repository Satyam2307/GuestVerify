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
  Layers,
  ArrowRight
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
  category: 'event' | 'backend' | 'ai' | 'policy' | 'action'
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
    category: 'event'
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
    category: 'backend'
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
    category: 'ai'
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
    category: 'backend'
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
    category: 'policy'
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
    category: 'action'
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

    const stepInterval = 650 // Smooth ~650ms per step

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
              reason: 'Verified Amazon delivery for John matching active schedule. Porch box safely unlocked.'
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

  const getNodeIcon = (id: string) => {
    switch (id) {
      case 'ring-event':
        return <Bell className="w-5 h-5 text-[#1D1D1F]" />
      case 'fastapi-ingest':
        return <Server className="w-5 h-5 text-[#1D1D1F]" />
      case 'bedrock-analysis':
        return <Cpu className="w-5 h-5 text-[#1D1D1F]" />
      case 'schedule-match':
        return <CalendarCheck className="w-5 h-5 text-[#1D1D1F]" />
      case 'policy-engine':
        return <ShieldCheck className="w-5 h-5 text-[#1D1D1F]" />
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#1D1D1F]" />
    }
  }

  return (
    <div className="space-y-10 text-left text-[#1D1D1F]">
      {/* ─── SECTION HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/[0.06] pb-8">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
            System architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F]">
            How the decision is made
          </h2>
          <p className="text-base sm:text-lg text-[#6E6E73] leading-relaxed">
            GuestVerify separates AI-assisted understanding from deterministic security authorization.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={runDecisionTrace}
            disabled={isTracing}
            className="px-6 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isTracing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Tracing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run decision trace</span>
              </>
            )}
          </button>

          <button
            onClick={loadLatestEventTrace}
            disabled={isTracing}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-black/5 border border-black/[0.08] text-[#1D1D1F] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#86868B]" />
            <span>Use latest event</span>
          </button>
        </div>
      </div>

      {/* ─── 6-NODE HORIZONTAL PIPELINE ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {ARCHITECTURE_NODES.map((node, index) => {
          const isSelected = selectedNodeId === node.id
          const isActiveStep = activeStepIndex === index
          const isPassedStep = activeStepIndex !== null && activeStepIndex > index

          return (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`relative product-card p-6 text-left cursor-pointer transition-all duration-300 flex flex-col justify-between h-[210px] ${
                isSelected
                  ? 'border-2 border-[#1D1D1F] shadow-[0_12px_34px_rgba(0,0,0,0.12)]'
                  : 'product-card-hover'
              } ${isActiveStep ? 'ring-2 ring-[#1D1D1F] -translate-y-1' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#86868B]">
                    {node.number}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isPassedStep
                        ? 'bg-[#228B5B]'
                        : isActiveStep
                        ? 'bg-[#1D1D1F] scale-125'
                        : 'bg-black/10'
                    }`}
                  />
                </div>

                <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-3">
                  {getNodeIcon(node.id)}
                </div>

                <h3 className="font-semibold text-sm text-[#1D1D1F] leading-tight">
                  {node.title}
                </h3>
                <p className="text-xs text-[#6E6E73] mt-1 leading-snug">
                  {node.shortLabel}
                </p>
              </div>

              <div className="text-[11px] font-medium text-[#86868B] flex items-center gap-1 pt-2 border-t border-black/[0.04]">
                <span>{isSelected ? 'Active inspection' : 'Inspect'}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#1D1D1F]" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Trace result banner */}
      {traceResult && (
        <div className="p-5 rounded-2xl bg-[#EAF7EF] border border-[#B9E5C8] text-[#1D6B42] flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">Trace complete: {traceResult.decision}</span>
              <p className="text-xs opacity-90 mt-0.5">{traceResult.reason}</p>
            </div>
          </div>
          <button
            onClick={() => setTraceResult(null)}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── NODE DETAIL INSPECTION PANEL ─── */}
      <div className="product-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-[#86868B]">
              Stage {selectedNode.number}
            </span>
            <span className="text-black/20">•</span>
            <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
              {selectedNode.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedNode.technology.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#6E6E73] border border-black/[0.06]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
          {selectedNode.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] block">
              Purpose
            </span>
            <span className="text-[#1D1D1F] leading-snug block">{selectedNode.purpose}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] block">
              Input
            </span>
            <span className="text-[#1D1D1F] leading-snug block">{selectedNode.input}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] block">
              Output
            </span>
            <span className="text-[#1D1D1F] leading-snug block">{selectedNode.output}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] block">
              Security responsibility
            </span>
            <span className="text-[#1D1D1F] font-medium leading-snug block">
              {selectedNode.securityBoundary}
            </span>
          </div>
        </div>
      </div>

      {/* ─── DUAL SECURITY BOUNDARY CARDS (Core Differentiator) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="product-card p-8 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
            Responsibility 01
          </span>
          <h4 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
            AI-assisted interpretation
          </h4>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            Amazon Bedrock extracts visitor speech, identifies claimed carriers and recipients, and detects urgency or coercion indicators. It never makes the final security verdict or directly unlocks any hardware.
          </p>
        </div>

        <div className="product-card p-8 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
            Responsibility 02
          </span>
          <h4 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
            Deterministic authorization
          </h4>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            A zero-trust policy engine strictly verifies claims against registered delivery manifests and homeowner guest lists. Unrecognized visitors require homeowner PIN approval or trigger a security denial.
          </p>
        </div>
      </div>
    </div>
  )
}
