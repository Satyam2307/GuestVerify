import React, { useState } from 'react'
import {
  History,
  Search,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  X,
  Clock
} from 'lucide-react'
import { EventRecord, DecisionType } from '../../types'

interface EventHistoryTableProps {
  events: EventRecord[]
  loading?: boolean
}

export const EventHistoryTable: React.FC<EventHistoryTableProps> = ({
  events,
  loading
}) => {
  const [search, setSearch] = useState('')
  const [filterDecision, setFilterDecision] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null)

  const filtered = events.filter((e) => {
    if (filterDecision !== 'all' && e.decision !== filterDecision) return false
    if (!search.trim()) return true
    const term = search.toLowerCase()
    return (
      e.transcript.toLowerCase().includes(term) ||
      e.reason.toLowerCase().includes(term) ||
      e.device_id.toLowerCase().includes(term) ||
      (e.ai_summary && e.ai_summary.toLowerCase().includes(term))
    )
  })

  const getDecisionBadge = (decision: string) => {
    if (decision === 'APPROVED_EXPECTED') {
      return 'bg-[#EAF7EF] text-[#1D6B42] border-[#B9E5C8]'
    }
    if (decision === 'NEEDS_OWNER_CONFIRMATION') {
      return 'bg-[#FFF4DF] text-[#8A5500] border-[#F1D49B]'
    }
    return 'bg-[#FDECEC] text-[#9F2929] border-[#F2BABA]'
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/[0.04] overflow-x-auto">
          {[
            { id: 'all', label: 'All events' },
            { id: 'APPROVED_EXPECTED', label: 'Approved' },
            { id: 'NEEDS_OWNER_CONFIRMATION', label: 'Needs review' },
            { id: 'DENIED_UNKNOWN', label: 'Denied' },
            { id: 'DENIED_SUSPICIOUS', label: 'Suspicious' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterDecision(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterDecision === tab.id
                  ? 'bg-[#1D1D1F] text-white shadow-sm'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcripts or reasons..."
            className="w-full bg-white border border-black/[0.08] rounded-full pl-9 pr-4 py-2 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
          />
        </div>
      </div>

      {/* Events Table Container */}
      <div className="product-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] text-[#86868B] text-[11px] font-semibold uppercase tracking-wider bg-[#F5F5F7]">
                <th className="py-3.5 px-5">Time</th>
                <th className="py-3.5 px-5">Device</th>
                <th className="py-3.5 px-5">Visitor statement</th>
                <th className="py-3.5 px-5">Verdict</th>
                <th className="py-3.5 px-5">Response</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#86868B] text-xs">
                    {loading ? 'Loading event audit records...' : 'No doorbell event records matching your filters.'}
                  </td>
                </tr>
              ) : (
                filtered.map((record) => {
                  const dateStr = record.processed_at ? new Date(record.processed_at).toLocaleTimeString() : 'Recent'

                  return (
                    <tr
                      key={record.event_id}
                      onClick={() => setSelectedEvent(record)}
                      className="hover:bg-black/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 text-[#86868B] whitespace-nowrap tabular-nums">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-5 text-[#1D1D1F]">
                        <span className="block truncate max-w-[120px] font-medium">{record.device_id}</span>
                        <span className="text-[10px] text-[#86868B] uppercase">{record.event_type}</span>
                      </td>
                      <td className="py-3.5 px-5 max-w-[300px]">
                        <p className="text-[#1D1D1F] font-medium truncate text-xs">“{record.transcript}”</p>
                        <p className="text-[11px] text-[#6E6E73] truncate mt-0.5">{record.reason}</p>
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getDecisionBadge(
                            record.decision
                          )}`}
                        >
                          {record.decision}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#1D1D1F] font-medium whitespace-nowrap">
                        {record.action}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button className="text-[#86868B] group-hover:text-[#1D1D1F] transition-colors p-1">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Event Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border border-black/[0.08] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-[#1D1D1F]">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">Event audit record</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Event Overview Card */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2">
                <div className="flex items-center justify-between text-[#86868B] text-[11px]">
                  <span>ID: {selectedEvent.event_id}</span>
                  <span className="tabular-nums">{new Date(selectedEvent.processed_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#86868B] uppercase block">Transcript</span>
                  <p className="text-sm font-semibold text-[#1D1D1F] mt-0.5">“{selectedEvent.transcript}”</p>
                </div>
              </div>

              {/* Decision Callout */}
              <div
                className={`p-4 rounded-2xl border ${getDecisionBadge(selectedEvent.decision)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{selectedEvent.decision}</span>
                  <span className="text-[11px] font-medium">Action: {selectedEvent.action}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{selectedEvent.reason}</p>
              </div>

              {/* Structured Analysis */}
              {selectedEvent.visitor_analysis && (
                <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] space-y-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] block">
                    Bedrock visitor understanding
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#86868B] block">Claimed identity:</span>
                      <span className="text-[#1D1D1F] font-medium">{selectedEvent.visitor_analysis.claimed_identity || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-[#86868B] block">Organization:</span>
                      <span className="text-[#1D1D1F] font-medium">{selectedEvent.visitor_analysis.organization || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-[#86868B] block">Recipient:</span>
                      <span className="text-[#1D1D1F] font-medium">{selectedEvent.visitor_analysis.recipient || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-[#86868B] block">Urgency level:</span>
                      <span className="text-[#1D1D1F] font-medium capitalize">{selectedEvent.visitor_analysis.urgency_level}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Execution Timeline */}
              {selectedEvent.timeline && selectedEvent.timeline.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] block">
                    Timeline steps
                  </span>
                  <div className="space-y-2 border-l-2 border-black/[0.06] ml-2 pl-3">
                    {selectedEvent.timeline.map((step, idx) => (
                      <div key={idx} className="relative text-xs">
                        <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-[#1D1D1F]" />
                        <div className="flex items-center justify-between text-[11px] text-[#86868B]">
                          <span className="font-semibold text-[#1D1D1F]">{step.stage}</span>
                          <span className="tabular-nums">{step.timestamp}</span>
                        </div>
                        <p className="text-[#6E6E73] text-[11px] mt-0.5">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
