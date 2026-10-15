import React from 'react'
import {
  GitCommit,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { WebhookResponse } from '../../types'

interface DecisionTimelineProps {
  lastEvent: WebhookResponse | null
  loading: boolean
}

export const DecisionTimeline: React.FC<DecisionTimelineProps> = ({
  lastEvent,
  loading
}) => {
  const analysis = lastEvent?.visitor_analysis
  const timeline = lastEvent?.timeline || []

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between h-full space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Policy Engine & Audit Log</h2>
            <p className="text-[11px] text-zinc-400">Deterministic security evaluation flow</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Zero-Trust Rule
        </span>
      </div>

      {/* Content: Either Structured Empty State or Real Decision & Timeline */}
      {!lastEvent ? (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  No active decision yet
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                Ready for Event
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              When a doorbell event occurs, GuestVerify will evaluate the stream and display:
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="w-5 h-5 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-3 h-3" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-white font-semibold block">Extracted visitor claims</span>
                  <span className="text-zinc-400">Identity, carrier, organization, recipient, and requested action</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="w-5 h-5 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-3 h-3" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-white font-semibold block">Schedule match</span>
                  <span className="text-zinc-400">Cross-referenced against registered deliveries and guest roster</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-white font-semibold block">Risk indicators</span>
                  <span className="text-zinc-400">Urgency level, suspicious phrasing, and coercion flags</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-white font-semibold block">Policy result</span>
                  <span className="text-zinc-400">Deterministic zero-trust approval, owner review, or security denial</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="w-5 h-5 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <GitCommit className="w-3 h-3" />
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="text-white font-semibold block">Simulated action</span>
                  <span className="text-zinc-400">Safe sandbox latch trigger, notification dispatch, and immutable audit record</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Structured Bedrock AI Claim Extraction */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>Bedrock Structured Claims</span>
              </span>
              <span className="text-[10px] text-zinc-500">
                {lastEvent?.engine || 'Claude 3.5 Haiku'}
              </span>
            </div>

            {analysis && (
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Claimed Role</span>
                  <span className="text-zinc-200 font-semibold truncate block">
                    {analysis.claimed_identity || 'Not Claimed'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Organization</span>
                  <span className="text-zinc-200 font-semibold truncate block">
                    {analysis.organization || 'None'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Target Recipient</span>
                  <span className="text-zinc-200 font-semibold truncate block">
                    {analysis.recipient || 'None'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-zinc-500 block uppercase">Requested Action</span>
                  <span className="text-zinc-200 font-semibold truncate block">
                    {analysis.requested_action || 'Access'}
                  </span>
                </div>
              </div>
            )}

            {/* Risk Flags */}
            {analysis?.risk_flags && analysis.risk_flags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {analysis.risk_flags.map((flag) => (
                  <span
                    key={flag}
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{flag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Chronological Step-by-Step Decision Timeline */}
          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[220px] pr-1">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
              Execution Timeline
            </span>

            {timeline.length > 0 ? (
              <div className="space-y-2 border-l border-white/10 ml-2 pl-3">
                {timeline.map((step, idx) => (
                  <div key={idx} className="relative group text-xs">
                    {/* Timeline node */}
                    <span
                      className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-[#080A0F] ${
                        step.status === 'flagged'
                          ? 'border-red-400'
                          : step.status === 'neutral'
                          ? 'border-amber-400'
                          : 'border-emerald-400'
                      }`}
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span className="font-semibold text-zinc-300">{step.stage}</span>
                      <span>{step.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">{step.detail}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 italic py-2">
                Timeline will generate automatically when an event is received.
              </div>
            )}
          </div>
        </>
      )}

      {/* Simulated Hardware & Notification Action */}
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-mono text-blue-400 uppercase block font-semibold">
            Simulated Action Triggered
          </span>
          <span className="text-xs font-semibold text-white">
            {lastEvent?.action || 'NO_OP (STANDBY)'}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-black/40 text-blue-300 border border-blue-500/30">
          Safety: Simulated
        </span>
      </div>
    </div>
  )
}
