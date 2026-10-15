import React, { useState, useEffect } from 'react'
import { History, RefreshCw } from 'lucide-react'
import { EventHistoryTable } from '../components/events/EventHistoryTable'
import { fetchEvents } from '../lib/api'
import { EventRecord } from '../types'

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await fetchEvents({ limit: 100 })
      setEvents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-8 text-[#18170F]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
        <div className="space-y-1.5 max-w-xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#18170F] tracking-[-0.03em]">
            Event history
          </h1>
          <p className="text-sm sm:text-base text-[#65625B] leading-relaxed font-medium">
            Complete auditable chronological record of visitor arrivals, Bedrock evaluations, and policy actions.
          </p>
        </div>

        <button
          onClick={loadEvents}
          disabled={loading}
          className="p-2.5 rounded-full bg-white hover:bg-black/5 text-[#18170F] border border-black/[0.07] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer self-start sm:self-auto active:scale-95"
          title="Refresh event history"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Events Table */}
      <EventHistoryTable events={events} loading={loading} />
    </div>
  )
}
