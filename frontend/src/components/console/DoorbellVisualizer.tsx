import React, { useState, useEffect } from 'react'
import {
  Camera,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Radio,
  Volume2,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react'
import { WebhookResponse } from '../../types'
import { DECISION_CONFIG } from '../../lib/constants'

interface DoorbellVisualizerProps {
  lastEvent: WebhookResponse | null
  loading: boolean
  onRunDemoPreset?: () => void
}

export const DoorbellVisualizer: React.FC<DoorbellVisualizerProps> = ({
  lastEvent,
  loading,
  onRunDemoPreset
}) => {
  const [clockTime, setClockTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setClockTime(now.toTimeString().split(' ')[0] + ' UTC')
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const decision = lastEvent?.decision
  const decisionTheme = decision ? DECISION_CONFIG[decision] : null

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between h-full space-y-4">
      {/* Top Feed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-bold text-white tracking-wider uppercase">Live Camera Feed</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
            CAM-01 • Front Porch
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{clockTime}</span>
        </div>
      </div>

      {/* Simulated Live Frame with Visualizer Rings */}
      <div className="relative min-h-[300px] rounded-xl bg-gradient-to-b from-[#090D14] to-[#040609] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Subtle Scanlines & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Ambient State Glow */}
        {decisionTheme && (
          <div
            className={`absolute inset-0 opacity-20 pointer-events-none blur-3xl ${
              decision === 'APPROVED_EXPECTED'
                ? 'bg-emerald-500'
                : decision === 'NEEDS_OWNER_CONFIRMATION'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />
        )}

        {/* Device Center Optics & Pulse Ring */}
        <div className="relative z-10 flex flex-col items-center py-6">
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center">
            {/* Outer Ring Pulse */}
            <div
              className={`absolute inset-0 rounded-full border transition-all duration-700 ${
                loading
                  ? 'border-blue-400/80 scale-125 animate-ping'
                  : decision === 'APPROVED_EXPECTED'
                  ? 'border-emerald-400/80 scale-110 glow-emerald'
                  : decision === 'NEEDS_OWNER_CONFIRMATION'
                  ? 'border-amber-400/80 scale-110 glow-amber'
                  : decision
                  ? 'border-red-400/80 scale-110 glow-red'
                  : 'border-blue-500/30 scale-105 animate-pulse'
              }`}
            />
            {/* Core Lens Body */}
            <div className="w-16 h-16 rounded-full bg-[#0D121B] border-2 border-white/20 flex items-center justify-center shadow-2xl relative">
              {loading ? (
                <Radio className="w-7 h-7 text-blue-400 animate-pulse" />
              ) : decision === 'APPROVED_EXPECTED' ? (
                <Unlock className="w-7 h-7 text-emerald-400" />
              ) : decision === 'NEEDS_OWNER_CONFIRMATION' ? (
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              ) : decision ? (
                <ShieldAlert className="w-7 h-7 text-red-400" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md animate-pulse" />
                  <Camera className="w-7 h-7 text-blue-400/80 relative z-10" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-2.5 text-center max-w-sm px-2">
            <span className="text-xs font-semibold text-white tracking-wide block">
              {loading
                ? 'ANALYZING AUDIO STREAM...'
                : decision
                ? decisionTheme?.label
                : 'WAITING FOR DOORBELL EVENT'}
            </span>
            {lastEvent ? (
              <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                {lastEvent.engine || 'Zero-Trust Gatekeeper Active'}
              </span>
            ) : (
              <div className="space-y-2 mt-1">
                <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  The simulated camera feed is ready. Run a scenario from the Event Simulator to begin the decision trace.
                </p>
                {onRunDemoPreset && (
                  <button
                    type="button"
                    onClick={onRunDemoPreset}
                    disabled={loading}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-blue-600/25 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span>Run Amazon Delivery Demo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Camera Metadata Overlays */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-mono text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>FHD 1080p • 60 FPS</span>
        </div>

        <div className="absolute bottom-2.5 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-mono text-zinc-400">
          <span>ZONE: FRONT_PORCH_ACTIVE</span>
        </div>

        <div className="absolute bottom-2.5 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-1.5">
          <Volume2 className="w-3 h-3 text-blue-400" />
          <span>2-Way Audio On</span>
        </div>
      </div>

      {/* Visitor Statement Preview Bubble */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span className="uppercase tracking-wider">Visitor Statement</span>
          {lastEvent?.visitor_analysis?.urgency_level && (
            <span
              className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                lastEvent.visitor_analysis.urgency_level === 'high'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Urgency: {lastEvent.visitor_analysis.urgency_level}
            </span>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-200 leading-relaxed font-sans min-h-[58px] flex items-center">
          {lastEvent ? (
            <span>"{lastEvent.transcript}"</span>
          ) : (
            <span className="text-zinc-500 italic">No event triggered yet. Click a scenario in the simulator to begin.</span>
          )}
        </div>
      </div>

      {/* Decision Status Callout Card */}
      {lastEvent && decisionTheme && (
        <div
          className={`p-3.5 rounded-xl border transition-all ${decisionTheme.cardBorder} ${decisionTheme.badgeClass}`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${decisionTheme.dotColor}`} />
              <span className="text-xs font-bold font-mono tracking-wider">
                {decisionTheme.label}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-300">
              Confidence: {(lastEvent.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-zinc-200 leading-normal mt-1">
            {lastEvent.reason}
          </p>
        </div>
      )}
    </div>
  )
}
