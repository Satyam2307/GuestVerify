import React from 'react'
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  Sliders,
  Calendar,
  History,
  LifeBuoy
} from 'lucide-react'

interface NotFoundPageProps {
  onNavigate: (path: string) => void
  onOpenContact?: () => void
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate, onOpenContact }) => {
  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5654F]/10 border border-[#E5654F]/20 text-[#E5654F] text-[12px] font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Error 404 · Route Not Found</span>
        </div>

        {/* Clear H1 Header */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#18170F] tracking-[-0.035em]">
            Page Not Found
          </h1>
          <p className="text-base sm:text-lg text-[#65625B] leading-relaxed">
            The security route, documentation slug, or resource you requested does not exist or has been relocated.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-[#18170F] to-[#2D2B26] hover:from-[#18170F] hover:to-[#3E3C36] text-white font-bold text-[14px] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Overview</span>
          </button>

          <button
            onClick={() => onNavigate('/console')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-neutral-50 border border-black/[0.08] text-[#18170F] font-bold text-[14px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Sliders className="w-4 h-4 text-[#5DA87E]" />
            <span>Open Live Console</span>
          </button>
        </div>

        {/* Helpful Destinations Card */}
        <div className="p-6 rounded-[24px] bg-white border border-black/[0.06] shadow-sm text-left space-y-4">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#918C84]">
            Popular Valid Routes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <button
              onClick={() => onNavigate('/schedules')}
              className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-black/[0.03] transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#5DA87E]/10 flex items-center justify-center text-[#5DA87E]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#18170F] block group-hover:text-black">Schedules</span>
                <span className="text-xs text-[#65625B]">Manage visitors & deliveries</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('/events')}
              className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-black/[0.03] transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#3D9986]/10 flex items-center justify-center text-[#3D9986]">
                <History className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#18170F] block group-hover:text-black">Audit Trail</span>
                <span className="text-xs text-[#65625B]">View past security events</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('/settings')}
              className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-black/[0.03] transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#E4A02F]/10 flex items-center justify-center text-[#E4A02F]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#18170F] block group-hover:text-black">Settings</span>
                <span className="text-xs text-[#65625B]">Zero-trust configurations</span>
              </div>
            </button>

            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-black/[0.03] transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#18170F]/10 flex items-center justify-center text-[#18170F]">
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#18170F] block group-hover:text-black">Contact Support</span>
                  <span className="text-xs text-[#65625B]">Direct team assistance</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
