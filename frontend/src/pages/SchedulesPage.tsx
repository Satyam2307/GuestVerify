import React, { useState, useEffect } from 'react'
import { Calendar, RefreshCw } from 'lucide-react'
import { ScheduleList } from '../components/schedules/ScheduleList'
import { AddScheduleModal } from '../components/schedules/AddScheduleModal'
import { fetchSchedules, createSchedule, deleteSchedule } from '../lib/api'
import { ScheduleEntry } from '../types'

export const SchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  const loadSchedules = async () => {
    setLoading(true)
    try {
      const data = await fetchSchedules()
      setSchedules(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedules()
  }, [])

  const handleAddSchedule = async (entry: any) => {
    await createSchedule(entry)
    await loadSchedules()
    window.dispatchEvent(new CustomEvent('guestverify:schedules_updated'))
    setSuccessBanner("Guest added. GuestVerify will now check this visitor during the active time window.")
    setTimeout(() => setSuccessBanner(null), 6000)
  }

  const handleDeleteSchedule = async (id: string) => {
    await deleteSchedule(id)
    await loadSchedules()
    window.dispatchEvent(new CustomEvent('guestverify:schedules_updated'))
  }

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-8 text-[#18170F]">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E1F3E7] to-[#D2EDDA] border border-[#A8DFB8] text-[#186941] text-sm font-semibold flex items-center justify-between shadow-[0_4px_16px_rgba(93,168,126,0.12)] fade-up-in">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#186941] opacity-40" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#186941]" />
            </span>
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs font-bold px-3 py-1 rounded-full hover:bg-black/5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
        <div className="space-y-1.5 max-w-xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#18170F] tracking-[-0.03em]">
            Schedules
          </h1>
          <p className="text-sm sm:text-base text-[#65625B] leading-relaxed font-medium">
            Registered deliveries, caretakers, and service providers verified by the deterministic policy engine.
          </p>
        </div>

        <button
          onClick={loadSchedules}
          disabled={loading}
          className="p-2.5 rounded-full bg-white hover:bg-black/5 text-[#18170F] border border-black/[0.07] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer self-start sm:self-auto active:scale-95"
          title="Refresh manifests"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Schedule list component */}
      <ScheduleList
        schedules={schedules}
        onDelete={handleDeleteSchedule}
        onOpenAddModal={() => setIsModalOpen(true)}
      />

      {/* Add Modal */}
      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSchedule}
      />
    </div>
  )
}
