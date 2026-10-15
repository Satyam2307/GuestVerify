import React, { useState } from 'react'
import { Play, Sparkles, Sliders, Bell, Activity, Mic, AlertTriangle } from 'lucide-react'
import { SCENARIO_PRESETS, ScenarioPreset } from '../../lib/constants'

interface EventSimulatorProps {
  onTrigger: (params: {
    device_id: string
    event_type: 'ding' | 'motion' | 'two_way_audio'
    transcript: string
  }) => Promise<void>
  loading: boolean
}

export const EventSimulator: React.FC<EventSimulatorProps> = ({
  onTrigger,
  loading
}) => {
  const [deviceId, setDeviceId] = useState('front_door_doorbell')
  const [eventType, setEventType] = useState<'ding' | 'motion' | 'two_way_audio'>('ding')
  const [transcript, setTranscript] = useState(SCENARIO_PRESETS[0].transcript)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIO_PRESETS[0].id)

  const handleSelectScenario = (scenario: ScenarioPreset) => {
    setSelectedScenarioId(scenario.id)
    setTranscript(scenario.transcript)
    setEventType(scenario.eventType)
    setDeviceId(scenario.deviceId)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!transcript.trim() || loading) return
    onTrigger({
      device_id: deviceId,
      event_type: eventType,
      transcript: transcript.trim()
    })
  }

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-5 border border-white/[0.08] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Event Simulator</h2>
            <p className="text-[11px] text-zinc-400">Simulate incoming Ring doorbell events</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
          Source: Virtual Rig
        </span>
      </div>

      {/* Preset Benchmarks */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>Preset Scenarios</span>
          <span className="text-[10px] text-blue-400 font-normal">Click to load</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SCENARIO_PRESETS.map((preset) => {
            const isSelected = selectedScenarioId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectScenario(preset)}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-white truncate">{preset.title}</span>
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded font-medium ${
                        preset.expectedDecision === 'APPROVED_EXPECTED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : preset.expectedDecision === 'NEEDS_OWNER_CONFIRMATION'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">{preset.subtitle}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Device & Event Type Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-zinc-400 text-[11px] font-mono mb-1.5 uppercase">Device Source</label>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-zinc-200 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="front_door_doorbell">Front Door Doorbell Pro</option>
            <option value="backyard_camera">Backyard Camera</option>
            <option value="side_gate_sensor">Side Gate Access Sensor</option>
          </select>
        </div>

        <div>
          <label className="block text-zinc-400 text-[11px] font-mono mb-1.5 uppercase">Event Trigger</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setEventType('ding')}
              className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                eventType === 'ding'
                  ? 'bg-blue-600/20 border-blue-500/60 text-white'
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Chime</span>
            </button>
            <button
              type="button"
              onClick={() => setEventType('motion')}
              className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                eventType === 'motion'
                  ? 'bg-blue-600/20 border-blue-500/60 text-white'
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Motion</span>
            </button>
            <button
              type="button"
              onClick={() => setEventType('two_way_audio')}
              className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                eventType === 'two_way_audio'
                  ? 'bg-blue-600/20 border-blue-500/60 text-white'
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>2-Way</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Transcript Input */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Visitor Speech Transcript
          </label>
          <span className="text-[10px] text-zinc-500 font-mono">Editable</span>
        </div>
        <textarea
          rows={3}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value)
            setSelectedScenarioId('')
          }}
          placeholder="Enter visitor statement or edit the scenario above..."
          className="w-full flex-1 bg-[#0D1117] border border-white/10 rounded-xl p-3 text-zinc-200 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
        />
      </div>

      {/* Submit Trigger Button */}
      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={loading || !transcript.trim()}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Analyzing Visitor Claims...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>Simulate Ring Event</span>
          </>
        )}
      </button>
    </div>
  )
}
