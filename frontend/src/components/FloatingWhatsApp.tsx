import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false)

  const whatsappText = encodeURIComponent(
    'Hello GuestVerify Team! I am testing the Zero-Trust Smart-Home Gatekeeper and have a question.'
  )
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip / Hint on Hover */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18170F] text-white text-[12px] font-medium shadow-lg animate-in fade-in slide-in-from-right-2">
          <span>Chat with Security Team on WhatsApp</span>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Chat on WhatsApp"
        className="w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>
    </div>
  )
}
