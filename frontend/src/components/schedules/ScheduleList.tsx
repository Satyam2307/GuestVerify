import React, { useState } from 'react'
import { Plus, Trash2, Calendar, Package, Users, HeartPulse, Wrench, ShieldCheck } from 'lucide-react'
import { ScheduleEntry } from '../../types'

interface ScheduleListProps {
  schedules: ScheduleEntry[]
  onDelete: (id: string) => Promise<void>
  onOpenAddModal: () => void
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  onDelete,
  onOpenAddModal
}) => {
  const [filter, setFilter] = useState<'all' | 'delivery' | 'caretaker' | 'guest' | 'service'>('all')

  const filtered = schedules.filter((s) => {
    if (filter === 'all') return true
    return s.entry_type === filter
  })

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <Package className="w-4 h-4 text-[#18170F]" />
      case 'caretaker':
        return <HeartPulse className="w-4 h-4 text-[#18170F]" />
      case 'service':
        return <Wrench className="w-4 h-4 text-[#18170F]" />
      default:
        return <Users className="w-4 h-4 text-[#18170F]" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/[0.035] border border-black/[0.03] overflow-x-auto">
          {[
            { id: 'all', label: 'All manifests' },
            { id: 'delivery', label: 'Deliveries' },
            { id: 'caretaker', label: 'Caretakers' },
            { id: 'guest', label: 'Guests' },
            { id: 'service', label: 'Service' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-[7px] rounded-full text-[12px] font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#722F37] text-white shadow-[0_2px_10px_rgba(114,47,55,0.25)]'
                  : 'text-[#5C544D] hover:text-[#722F37] hover:bg-black/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#722F37] to-[#8D3A44] hover:from-[#5C232A] hover:to-[#7E333C] text-white text-[12px] font-bold shadow-[0_4px_16px_rgba(114,47,55,0.32)] hover:shadow-[0_6px_22px_rgba(114,47,55,0.45)] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add scheduled visitor</span>
        </button>
      </div>

      {/* Grid of Schedule Cards */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center product-card space-y-3">
          <Calendar className="w-12 h-12 text-[#918C84] mx-auto stroke-[1.5]" />
          <h3 className="text-base font-extrabold text-[#18170F] tracking-tight">No schedules found</h3>
          <p className="text-[13px] text-[#65625B] font-medium">There are no expected visitors matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="product-card product-card-hover p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    {getEntryIcon(item.entry_type)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#918C84] block">
                      {item.visitor_type || item.entry_type}
                    </span>
                    <h4 className="text-sm font-bold text-[#18170F] truncate max-w-[180px]">
                      {item.name || item.carrier || item.organization}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 rounded-full text-[#918C84] hover:text-[#922525] hover:bg-[#FDEAE9] transition-all cursor-pointer"
                  title="Remove schedule entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-[#65625B] bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] p-4 rounded-2xl border border-black/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-[#918C84] font-medium">Schedule type:</span>
                  <span className="text-[#18170F] font-semibold capitalize">{item.visitor_type || item.entry_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#918C84] font-medium">Window:</span>
                  <span className="text-[#18170F] font-medium truncate max-w-[160px]">{item.scheduled_start || 'Today'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#918C84] font-medium">Permitted action:</span>
                  <span className="text-[#186941] font-bold text-[11px]">
                    {item.allowed_action === 'SIMULATED_UNLOCK_MAIN_DOOR' || item.allowed_action === 'unlock_main_door'
                      ? 'Simulated main-door unlock'
                      : item.allowed_action}
                  </span>
                </div>
                {item.notes && (
                  <div className="pt-1.5 text-[11px] text-[#65625B] italic border-t border-black/[0.04] font-medium">
                    "{item.notes}"
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-[#918C84]">
                <span className={`flex items-center gap-1.5 font-bold ${item.auto_approve ? 'text-[#186941]' : 'text-[#7A4E00]'}`}>
                  <span className={`w-2 h-2 rounded-full ${item.auto_approve ? 'bg-[#5DA87E]' : 'bg-[#E4A02F]'}`} />
                  <span>{item.auto_approve ? 'Auto-approved' : 'Owner confirmation'}</span>
                </span>
                <span className="font-mono text-[10px] font-semibold">ID: {item.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
