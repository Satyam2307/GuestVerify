import React from 'react'
import { Shield, ExternalLink, Sparkles, MessageCircle } from 'lucide-react'
import { HealthResponse } from '../types'

interface FooterProps {
  onNavigate: (path: string) => void
  onOpenContact?: () => void
  health?: HealthResponse | null
  compact?: boolean
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenContact,
  health,
  compact = false
}) => {
  const isDemo = health ? health.demo_mode : true

  if (compact) {
    return (
      <footer className="border-t border-[#B7A89A]/20 bg-[#14100E] py-6 text-xs text-[#B7A89A]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#E8DCC6]">GuestVerify</span>
            <span className="text-[#B7A89A]/40">·</span>
            <span>Zero-Trust Security Prototype (Actions simulated)</span>
          </div>
          <div className="flex items-center gap-4 text-[#B7A89A] font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-[#E8DCC6] transition-colors cursor-pointer">
              Overview
            </button>
            <button onClick={() => onNavigate('/schedules')} className="hover:text-[#E8DCC6] transition-colors cursor-pointer">
              Schedules
            </button>
            <button onClick={() => onNavigate('/events')} className="hover:text-[#E8DCC6] transition-colors cursor-pointer">
              Audit log
            </button>
            <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-[#E8DCC6] transition-colors">
              API docs
            </a>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-[#B7A89A]/20 bg-[#14100E] pt-16 pb-12 text-sm text-[#B7A89A]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#722F37] via-[#5C232A] to-[#3D151B] border border-[#E8DCC6]/30 flex items-center justify-center text-white shadow-[0_4px_16px_rgba(114,47,55,0.4)]">
                <Shield className="w-[18px] h-[18px] text-[#E8DCC6]" />
              </div>
              <span className="font-bold text-lg text-[#FAF7F2] tracking-[-0.02em]">
                GuestVerify
              </span>
            </div>
            <p className="text-[13px] text-[#B7A89A] leading-relaxed max-w-xs">
              Zero-Trust AI Gatekeeper for smart-home visitors. AI-assisted visitor understanding with policy-controlled security decisions.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#722F37]/25 border border-[#722F37]/45 shadow-sm text-[11px] text-[#E8DCC6] font-medium glow-badge-burgundy">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5DA87E] opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5DA87E]" />
              </span>
              <span>System operational</span>
            </div>
          </div>

          {/* Column 2: Product Navigation */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#E8DCC6]">
              Product
            </h4>
            <ul className="space-y-3 text-[13px]">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer font-medium"
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/console')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer font-medium"
                >
                  Live console
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/schedules')}
                  className="hover:text-[#FAF7F2] transition-colors cursor-pointer font-medium"
                >
                  Schedules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/events')}
                  className="hover:text-white transition-colors cursor-pointer font-medium"
                >
                  Event history
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/settings')}
                  className="hover:text-white transition-colors cursor-pointer font-medium"
                >
                  Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Technology Architecture */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#E8DCC6]">
              Technology
            </h4>
            <ul className="space-y-3 text-[13px] text-[#B7A89A]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5DA87E]" />
                Ring Doorbell Ecosystem
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4A02F]" />
                Amazon Bedrock (Claude 3.5 Haiku)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#722F37]" />
                Deterministic Policy Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7A89A]" />
                Fail-Closed Zero-Trust Model
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8DCC6]" />
                Real-time Event Stream (SSE)
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Support */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#E8DCC6]">
              Resources & Support
            </h4>
            <ul className="space-y-3 text-[13px]">
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-[#FAF7F2] transition-colors font-medium text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>Contact security team</span>
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Hello GuestVerify Team! I am interested in the Zero-Trust Smart-Home Gatekeeper.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#25D366] transition-colors inline-flex items-center gap-1.5 font-medium group"
                >
                  <span>WhatsApp support</span>
                  <ExternalLink className="w-3 h-3 text-[#B7A89A] group-hover:text-[#25D366] transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#FAF7F2] transition-colors inline-flex items-center gap-1.5 font-medium group"
                >
                  <span>API documentation</span>
                  <ExternalLink className="w-3 h-3 text-[#B7A89A] group-hover:text-[#FAF7F2] transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#E8DCC6] transition-colors inline-flex items-center gap-1.5 text-xs text-[#B7A89A]"
                >
                  <span>Sitemap XML</span>
                </a>
              </li>
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#E8DCC6] transition-colors inline-flex items-center gap-1.5 text-xs text-[#B7A89A]"
                >
                  <span>LLMs.txt</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Strict Simulation Disclaimer */}
        <div className="pt-8 border-t border-[#B7A89A]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B7A89A] text-center sm:text-left">
          <div className="space-y-1.5">
            <p className="font-medium text-[#E8DCC6]">© 2025 GuestVerify • Open-source under MIT License.</p>
            <p className="text-[11px] text-[#B7A89A]/80 leading-relaxed">
              <strong className="text-[#FAF7F2]">Security Disclaimer:</strong> GuestVerify is a security decision-support prototype. All door and lock actions are simulated for demonstration purposes. No physical lock control enabled.
            </p>
          </div>

          <div className="text-[11px] text-[#E8DCC6] whitespace-nowrap font-medium px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#B7A89A]/20">
            Simulation only — No real physical lock control
          </div>
        </div>
      </div>
    </footer>
  )
}
