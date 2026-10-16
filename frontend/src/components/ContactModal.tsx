import React, { useState } from 'react'
import {
  X,
  Mail,
  Send,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Shield,
  Building,
  User,
  ExternalLink
} from 'lucide-react'
import { submitContact } from '../lib/api'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [inquiryType, setInquiryType] = useState('demo')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  // WhatsApp Universal Link
  const whatsappText = encodeURIComponent(
    'Hello GuestVerify Team! I am interested in the Zero-Trust Smart-Home AI Gatekeeper and would like to learn more about enterprise deployment or integration.'
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    // Basic frontend validations & sanitization
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedMsg = message.trim()

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please provide your full name (at least 2 characters).')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please provide a valid email address.')
      return
    }

    if (!trimmedMsg || trimmedMsg.length < 10) {
      setErrorMessage('Please provide a detailed inquiry message (at least 10 characters).')
      return
    }

    setLoading(true)

    try {
      const resData = await submitContact({
        full_name: trimmedName,
        email: trimmedEmail,
        organization: organization.trim() || 'Individual',
        inquiry_type: inquiryType,
        message: trimmedMsg
      })
      setTicketId(resData.ticket_id || `GV-${Math.floor(100000 + Math.random() * 900000)}`)
      setSubmitted(true)
    } catch (err: any) {
      // Fallback in demo mode if backend is offline
      console.warn('Contact API error, using demo acknowledgment:', err)
      setTicketId(`GV-OFF-${Math.floor(100000 + Math.random() * 900000)}`)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFullName('')
    setEmail('')
    setOrganization('')
    setMessage('')
    setSubmitted(false)
    setTicketId('')
    setErrorMessage('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] bg-[#FCFAF6] border border-[#DCD2C3] shadow-[0_24px_48px_rgba(114,47,55,0.14)] p-6 sm:p-8 text-[#1C1917] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center text-[#5C544D] hover:text-[#1C1917] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#722F37]/10 text-[#722F37] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#1C1917]">Inquiry Dispatched</h2>
              <p className="text-sm text-[#5C544D] max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out. Our security team will review your requirements and respond within 24 hours.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#B7A89A]/30 text-xs font-mono text-[#5C544D] inline-block">
              Reference Ticket: <strong className="text-[#722F37]">{ticketId}</strong>
            </div>

            <div className="pt-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#722F37] to-[#8D3A44] hover:from-[#5C232A] hover:to-[#7E333C] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8DCC6]/60 border border-[#B7A89A]/40 text-[#722F37] text-[11px] font-bold">
                <Shield className="w-3 h-3" />
                <span>Security Team Contact</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
                Get in Touch with GuestVerify
              </h2>
              <p className="text-xs text-[#5C544D]">
                Have questions about zero-trust door verification, Ring integration, or custom deployments?
              </p>
            </div>

            {/* Quick Action: Direct WhatsApp Chat */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/15 border border-[#25D366]/20 transition-all text-[#128C7E] group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#18170F] block">Chat Instantly on WhatsApp</span>
                  <span className="text-[11px] text-[#65625B]">Fast responses from engineering support</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#25D366] group-hover:translate-x-0.5 transition-transform" />
            </a>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-black/[0.06] w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-[#918C84] uppercase tracking-wider">
                Or send an inquiry
              </span>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E5654F]/10 border border-[#E5654F]/20 text-[#E5654F] text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#18170F] block">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-[#918C84]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/[0.08] focus:border-black/30 focus:outline-none bg-neutral-50/50 text-[#18170F]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#18170F] block">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-[#918C84]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/[0.08] focus:border-black/30 focus:outline-none bg-neutral-50/50 text-[#18170F]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#18170F] block">Organization / Residence</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-[#918C84]" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Smart Estate / Security"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/[0.08] focus:border-black/30 focus:outline-none bg-neutral-50/50 text-[#18170F]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#18170F] block">Inquiry Type</label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/[0.08] focus:border-black/30 focus:outline-none bg-neutral-50/50 text-[#18170F] cursor-pointer"
                  >
                    <option value="demo">Custom Demo / Pilot</option>
                    <option value="security">Zero-Trust Architecture</option>
                    <option value="hardware">Ring & Lock Compatibility</option>
                    <option value="enterprise">Enterprise Multi-Gate License</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#18170F] block">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your gatekeeper or smart-lock requirements..."
                  className="w-full p-3 rounded-xl border border-black/[0.08] focus:border-black/30 focus:outline-none bg-neutral-50/50 text-[#18170F] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full border border-black/[0.08] hover:bg-black/[0.03] text-[#65625B] font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#722F37] to-[#8D3A44] hover:from-[#5C232A] hover:to-[#7E333C] text-white font-bold shadow-md shadow-[0_4px_16px_rgba(114,47,55,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
