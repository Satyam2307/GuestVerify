import React from 'react'
import { Shield, ExternalLink, Sparkles } from 'lucide-react'
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
      <footer className="border-t border-black/[0.06] bg-gradient-to-b from-[#F3EFE8] to-[#EDE8E0] py-6 text-xs text-[#65625B]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#18170F]">GuestVerify</span>
            <span className="text-black/15">·</span>
            <span>Security decision-support prototype (Actions simulated)</span>
          </div>
          <div className="flex items-center gap-4 text-[#65625B] font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-[#18170F] transition-colors cursor-pointer">
              Overview
            </button>
            <button onClick={() => onNavigate('/schedules')} className="hover:text-[#18170F] transition-colors cursor-pointer">
              Schedules
            </button>
            <button onClick={() => onNavigate('/events')} className="hover:text-[#18170F] transition-colors cursor-pointer">
              Audit log
            </button>
            <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-[#18170F] transition-colors">
              API docs
            </a>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-black/[0.07] bg-gradient-to-b from-[#F3EFE8] to-[#E8E3DA] pt-16 pb-12 text-sm text-[#65625B]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#1A1918] to-[#2E2C28] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                <Shield className="w-[18px] h-[18px]" />
              </div>
              <span className="font-bold text-lg text-[#18170F] tracking-[-0.02em]">
                GuestVerify
              </span>
            </div>
            <p className="text-[13px] text-[#65625B] leading-relaxed max-w-xs">
              Zero-Trust AI Gatekeeper for smart-home visitors. AI-assisted visitor understanding with policy-controlled security decisions.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-sm text-[11px] text-[#18170F] font-medium glow-badge-green">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5DA87E] opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5DA87E]" />
              </span>
              <span>System operational</span>
            </div>
          </div>

          {/* Column 2: Product Navigation */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#18170F]">
              Product
            </h4>
            <ul className="space-y-3 text-[13px]">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-[#18170F] transition-colors cursor-pointer font-medium"
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/console')}
                  className="hover:text-[#18170F] transition-colors cursor-pointer font-medium"
                >
                  Live console
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/schedules')}
                  className="hover:text-[#18170F] transition-colors cursor-pointer font-medium"
                >
                  Schedules
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/events')}
                  className="hover:text-[#18170F] transition-colors cursor-pointer font-medium"
                >
                  Event history
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/settings')}
                  className="hover:text-[#18170F] transition-colors cursor-pointer font-medium"
                >
                  Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Technology Architecture */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#18170F]">
              Technology
            </h4>
            <ul className="space-y-3 text-[13px] text-[#65625B]">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#5DA87E]" />
                Ring Doorbell Ecosystem
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#E4A02F]" />
                Amazon Bedrock (Claude 3.5 Haiku)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#E5654F]" />
                Deterministic Policy Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#3D9986]" />
                Fail-Closed Security Model
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#918C84]" />
                Real-time Event Stream (SSE)
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Support */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#18170F]">
              Resources & Support
            </h4>
            <ul className="space-y-3 text-[13px]">
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-[#18170F] transition-colors font-medium text-left cursor-pointer flex items-center gap-1.5"
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
                  <ExternalLink className="w-3 h-3 text-[#918C84] group-hover:text-[#25D366] transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#18170F] transition-colors inline-flex items-center gap-1.5 font-medium group"
                >
                  <span>API documentation</span>
                  <ExternalLink className="w-3 h-3 text-[#918C84] group-hover:text-[#18170F] transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#18170F] transition-colors inline-flex items-center gap-1.5 text-xs text-[#918C84]"
                >
                  <span>Sitemap XML</span>
                </a>
              </li>
              <li>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#18170F] transition-colors inline-flex items-center gap-1.5 text-xs text-[#918C84]"
                >
                  <span>LLMs.txt</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Strict Simulation Disclaimer */}
        <div className="pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#918C84] text-center sm:text-left">
          <div className="space-y-1.5">
            <p className="font-medium">© 2025 GuestVerify • Open-source under MIT License.</p>
            <p className="text-[11px] text-[#65625B] leading-relaxed">
              <strong className="text-[#18170F]">Security Disclaimer:</strong> GuestVerify is a security decision-support prototype. All door and lock actions are simulated for demonstration purposes. No physical lock control enabled.
            </p>
          </div>

          <div className="text-[11px] text-[#918C84] whitespace-nowrap font-medium px-3 py-1.5 rounded-full bg-white/60 border border-black/[0.04]">
            Simulation only — No real physical lock control
          </div>
        </div>
      </div>
    </footer>
  )
}
