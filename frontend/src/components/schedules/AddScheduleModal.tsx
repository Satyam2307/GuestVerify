import React, { useState, useEffect } from 'react'
import { X, Calendar, Plus, Clock, ShieldCheck, User, Truck, CheckCircle2 } from 'lucide-react'

interface AddScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: {
    entry_type: 'delivery' | 'guest' | 'caretaker' | 'service'
    name?: string
    visitor_type?: string
    organization?: string
    carrier?: string
    recipient?: string
    scheduled_start?: string
    scheduled_end?: string
    status?: string
    allowed_action?: string
    auto_approve?: boolean
    notes?: string
  }) => Promise<void>
}

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [scheduleCategory, setScheduleCategory] = useState<'guest' | 'delivery'>('guest')

  // Guest fields
  const [guestName, setGuestName] = useState('')
  const [guestType, setGuestType] = useState('Caretaker')
  const [notes, setNotes] = useState('Scheduled home visit')
  const [autoApprove, setAutoApprove] = useState(true)

  // Delivery fields
  const [carrierName, setCarrierName] = useState('UPS')
  const [deliveryRecipient, setDeliveryRecipient] = useState('Homeowner')

  // Date and Time fields (using local system date)
  const getLocalDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const [date, setDate] = useState(getLocalDateString())

  // Default arrival time: current hour, default end time: arrival + 60 min
  const now = new Date()
  const currentHourStr = String(now.getHours()).padStart(2, '0') + ':00'
  const nextHourStr = String((now.getHours() + 1) % 24).padStart(2, '0') + ':00'

  const [arrivalTime, setArrivalTime] = useState(currentHourStr)
  const [endTime, setEndTime] = useState(nextHourStr)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // When arrival time changes, default end time to 60 minutes later
  const handleArrivalTimeChange = (newArrival: string) => {
    setArrivalTime(newArrival)
    const [h, m] = newArrival.split(':').map(Number)
    if (!isNaN(h) && !isNaN(m)) {
      const nextH = (h + 1) % 24
      setEndTime(`${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)

    try {
      const startIso = `${date}T${arrivalTime}:00`
      const endIso = `${date}T${endTime}:00`

      if (scheduleCategory === 'guest') {
        const normEntryType = guestType.toLowerCase().includes('caretaker')
          ? 'caretaker'
          : guestType.toLowerCase().includes('service')
          ? 'service'
          : 'guest'

        await onSubmit({
          entry_type: normEntryType,
          name: guestName.trim(),
          visitor_type: guestType,
          organization: guestType !== 'Guest' ? guestType : undefined,
          recipient: 'Homeowner',
          scheduled_start: startIso,
          scheduled_end: endIso,
          status: 'active',
          allowed_action: autoApprove ? 'unlock_main_door' : 'REQUIRE_OWNER_APPROVAL',
          auto_approve: autoApprove,
          notes: notes.trim() || undefined
        })
      } else {
        await onSubmit({
          entry_type: 'delivery',
          name: `${carrierName.trim()} Delivery`,
          carrier: carrierName.trim(),
          organization: carrierName.trim(),
          recipient: deliveryRecipient.trim() || 'Homeowner',
          scheduled_start: startIso,
          scheduled_end: endIso,
          status: 'out_for_delivery',
          allowed_action: 'ALLOW_PACKAGE_DROP',
          auto_approve: true,
          notes: notes.trim() || undefined
        })
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save schedule.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFDFC] border border-[#E7E0D7] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 sm:p-7 space-y-5 text-[#1D1C1A]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F6F3EE] flex items-center justify-center text-[#1D1C1A]">
              <Calendar className="w-4 h-4 text-[#E76F61]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1D1C1A] tracking-tight">Add scheduled visitor</h3>
              <p className="text-[11px] text-[#706D68]">Create expected visitor manifests for zero-trust policy verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#706D68] hover:text-[#1D1C1A] hover:bg-black/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FBE8E7] border border-[#F2BABA] text-[#9F2929] text-xs">
            {errorMsg}
          </div>
        )}

        {/* Category Selector Tabs */}
        <div className="flex p-1 rounded-xl bg-[#F6F3EE] border border-[#E7E0D7]">
          <button
            type="button"
            onClick={() => setScheduleCategory('guest')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              scheduleCategory === 'guest'
                ? 'bg-white text-[#1D1C1A] shadow-sm'
                : 'text-[#706D68] hover:text-[#1D1C1A]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Scheduled guest / caretaker</span>
          </button>
          <button
            type="button"
            onClick={() => setScheduleCategory('delivery')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              scheduleCategory === 'delivery'
                ? 'bg-white text-[#1D1C1A] shadow-sm'
                : 'text-[#706D68] hover:text-[#1D1C1A]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery courier</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {scheduleCategory === 'guest' ? (
            /* Guest Form Fields */
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Guest name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-3 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Guest type</label>
                  <select
                    value={guestType}
                    onChange={(e) => setGuestType(e.target.value)}
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-3 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61] transition-all"
                  >
                    <option value="Caretaker">Caretaker / Health Nurse</option>
                    <option value="Family">Family Member</option>
                    <option value="Friend">Friend / Personal Guest</option>
                    <option value="Service">Service Provider (Cleaner, Plumber)</option>
                    <option value="Contractor">Contractor / Technician</option>
                  </select>
                </div>
              </div>

              {/* Date & Time Window */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-2.5 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>

                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Arrival time</label>
                  <input
                    type="time"
                    required
                    value={arrivalTime}
                    onChange={(e) => handleArrivalTimeChange(e.target.value)}
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-2.5 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>

                <div>
                  <label className="block text-[#706D68] font-medium mb-1">End time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-2.5 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>
              </div>

              {/* Automatic Approval Radio Section */}
              <div className="space-y-2 pt-1">
                <label className="block text-[#706D68] font-medium">Automatic approval</label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    onClick={() => setAutoApprove(true)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      autoApprove
                        ? 'bg-[#E7F3EA] border-[#B9E5C8] text-[#1D6B42]'
                        : 'bg-[#F6F3EE] border-[#E7E0D7] text-[#706D68] hover:bg-[#F0ECE5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="auto_approve_choice"
                      checked={autoApprove}
                      onChange={() => setAutoApprove(true)}
                      className="mt-0.5 accent-[#1D6B42]"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#1D1C1A]">Yes, simulate main-door unlock</div>
                      <div className="text-[11px] text-[#706D68] mt-0.5">
                        Permits automatic <code className="text-[10px] font-mono px-1 py-0.5 bg-black/5 rounded">SIMULATED_UNLOCK_MAIN_DOOR</code> when visitor name and active window match.
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setAutoApprove(false)}
                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      !autoApprove
                        ? 'bg-[#FFF2D8] border-[#F1D49B] text-[#8A5500]'
                        : 'bg-[#F6F3EE] border-[#E7E0D7] text-[#706D68] hover:bg-[#F0ECE5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="auto_approve_choice"
                      checked={!autoApprove}
                      onChange={() => setAutoApprove(false)}
                      className="mt-0.5 accent-[#8A5500]"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#1D1C1A]">No, require homeowner confirmation</div>
                      <div className="text-[11px] text-[#706D68] mt-0.5">
                        Holds door locked and prompts homeowner to confirm identity before entry.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#706D68] font-medium mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Regular afternoon caretaker appointment"
                  className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-3 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                />
              </div>
            </div>
          ) : (
            /* Delivery Form Fields */
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Carrier *</label>
                  <input
                    type="text"
                    required
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="e.g. Amazon, FedEx, UPS"
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-3 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>

                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Expected recipient</label>
                  <input
                    type="text"
                    value={deliveryRecipient}
                    onChange={(e) => setDeliveryRecipient(e.target.value)}
                    placeholder="e.g. John, Sarah"
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-3 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-2.5 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>
                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Window start</label>
                  <input
                    type="time"
                    required
                    value={arrivalTime}
                    onChange={(e) => handleArrivalTimeChange(e.target.value)}
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-2.5 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>
                <div>
                  <label className="block text-[#706D68] font-medium mb-1">Window end</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-2.5 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#706D68] font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave inside porch lockbox"
                  className="w-full bg-[#F6F3EE] border border-[#E7E0D7] rounded-xl px-3 py-2 text-[#1D1C1A] text-xs focus:outline-none focus:ring-2 focus:ring-[#E76F61]"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E7E0D7]">
            <span className="text-[10px] text-[#9A958E]">
              Simulation prototype · No physical lock is controlled
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-[#F6F3EE] hover:bg-[#EFEAE2] text-[#1D1C1A] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-[#1D1C1A] hover:bg-[#E76F61] text-white font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{submitting ? 'Saving…' : 'Save schedule'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
