import React from 'react'
import {
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Play,
  Sparkles,
  Zap
} from 'lucide-react'
import { Doorbell3DScene } from '../components/3d/Doorbell3DScene'
import { InteractiveArchitecture } from '../components/architecture/InteractiveArchitecture'
import { WebhookResponse } from '../types'

interface LandingPageProps {
  onNavigate: (path: string) => void
  latestEvent?: WebhookResponse | null
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, latestEvent }) => {
  return (
    <div className="space-y-24 sm:space-y-36 pb-24 text-[#18170F]">
      {/* ─── 1. HERO SECTION ─── */}
      <section className="pt-12 pb-6 sm:pt-20 sm:pb-12 max-w-[1280px] mx-auto px-5 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16">
        {/* Left: Editorial Headline & Copy */}
        <div className="max-w-xl space-y-6 text-left">
          {/* Subtle Track Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 border border-black/[0.07] text-[#18170F] text-[12px] font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm font-editorial">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5DA87E] opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5DA87E]" />
            </span>
            <span>Ring Ecosystem + AWS Bedrock Challenge</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-[-0.035em] text-[#18170F] leading-[1.05]">
            Your front door, <br />
            <span className="text-[#8C877E] font-medium">with better judgment.</span>
          </h1>

          <p className="font-editorial text-lg sm:text-xl text-[#58554F] leading-relaxed font-normal">
            Smart doorbells tell you someone is there. <strong className="font-bold text-[#18170F]">GuestVerify</strong> understands who they are, cross-references your active schedules, and applies deterministic security policies so an AI model never blindly unlocks your door.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 font-display">
            <button
              onClick={() => onNavigate('/console')}
              className="px-7 py-4 rounded-full bg-gradient-to-r from-[#18170F] to-[#2A2825] hover:from-[#18170F] hover:to-[#3A3835] text-white font-bold text-[14px] shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.2)] transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer group active:scale-95"
            >
              <span>Open live console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#how-it-works"
              className="px-6 py-4 rounded-full bg-white/80 hover:bg-white border border-black/[0.07] text-[#18170F] font-bold text-[14px] transition-all text-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm"
            >
              See how it works
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-5 pt-8 border-t border-black/[0.06] text-xs">
            <div>
              <span className="font-display text-[#18170F] font-bold block text-[16px] tracking-tight">Deterministic</span>
              <span className="font-editorial text-[#65625B] font-medium text-[13px]">Zero-trust policy</span>
            </div>
            <div>
              <span className="font-display text-[#18170F] font-bold block text-[16px] tracking-tight">Claude 3.5</span>
              <span className="font-editorial text-[#65625B] font-medium text-[13px]">Structured claims</span>
            </div>
            <div>
              <span className="font-display text-[#18170F] font-bold block text-[16px] tracking-tight">Fail-closed</span>
              <span className="font-editorial text-[#65625B] font-medium text-[13px]">Safe hardware state</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive 3D Doorbell Experience */}
        <div className="w-full lg:w-auto flex justify-center">
          <Doorbell3DScene />
        </div>
      </section>

      {/* ─── 2. HOW IT WORKS ─── */}
      <section id="how-it-works" className="max-w-[1280px] mx-auto px-5 sm:px-8 space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#918C84]">
            <Zap className="w-3.5 h-3.5" />
            Architectural safeguard
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#18170F] tracking-[-0.03em]">
            How GuestVerify decides who enters
          </h2>
          <p className="text-base sm:text-lg text-[#65625B] leading-relaxed">
            AI explains natural language claims, but the final authorization is strictly governed by rules. Here is how standard scenarios behave:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {/* Card 1: Expected Delivery */}
          <div className="product-card product-card-hover p-8 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E1F3E7] to-[#CEEBD7] flex items-center justify-center text-[#186941] shadow-[0_4px_12px_rgba(93,168,126,0.1)] group-hover:shadow-[0_6px_20px_rgba(93,168,126,0.15)] transition-shadow">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#186941]">
                  Scenario 01 • Auto-approved
                </span>
                <h3 className="text-xl font-extrabold text-[#18170F] mt-1.5 tracking-tight">Expected delivery driver</h3>
              </div>
              <p className="text-[13px] text-[#18170F] bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] p-4 rounded-2xl border border-black/[0.04] leading-relaxed italic">
                "Hi, I have an Amazon package for John. Can you open the porch box?"
              </p>
              <ul className="text-[13px] text-[#65625B] space-y-2.5 pt-1">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#5DA87E]" />
                  <span>Bedrock extracts carrier & recipient</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#5DA87E]" />
                  <span>Matched active manifest <strong className="text-[#18170F]">delivery_001</strong></span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between text-[13px] font-semibold">
              <span className="text-[#186941]">Approved expected</span>
              <span className="text-[#918C84]">Unlock porch box</span>
            </div>
          </div>

          {/* Card 2: Scheduled Caretaker */}
          <div className="product-card product-card-hover p-8 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF1D2] to-[#FDE8B6] flex items-center justify-center text-[#7A4E00] shadow-[0_4px_12px_rgba(228,160,47,0.1)] group-hover:shadow-[0_6px_20px_rgba(228,160,47,0.15)] transition-shadow">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#7A4E00]">
                  Scenario 02 • Owner confirmation
                </span>
                <h3 className="text-xl font-extrabold text-[#18170F] mt-1.5 tracking-tight">Scheduled caretaker</h3>
              </div>
              <p className="text-[13px] text-[#18170F] bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] p-4 rounded-2xl border border-black/[0.04] leading-relaxed italic">
                "Hi, I am David, here for the scheduled afternoon caretaker visit."
              </p>
              <ul className="text-[13px] text-[#65625B] space-y-2.5 pt-1">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#E4A02F]" />
                  <span>Verified identity matches guest list</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#E4A02F]" />
                  <span>Requires homeowner confirmation PIN</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between text-[13px] font-semibold">
              <span className="text-[#7A4E00]">Owner review required</span>
              <span className="text-[#918C84]">Prompt homeowner</span>
            </div>
          </div>

          {/* Card 3: Unannounced Inspector */}
          <div className="product-card product-card-hover p-8 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FDEAE9] to-[#F9D1CF] flex items-center justify-center text-[#922525] shadow-[0_4px_12px_rgba(229,101,79,0.1)] group-hover:shadow-[0_6px_20px_rgba(229,101,79,0.15)] transition-shadow">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#922525]">
                  Scenario 03 • Security escalation
                </span>
                <h3 className="text-xl font-extrabold text-[#18170F] mt-1.5 tracking-tight">Unannounced inspector</h3>
              </div>
              <p className="text-[13px] text-[#18170F] bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] p-4 rounded-2xl border border-black/[0.04] leading-relaxed italic">
                "I am here for a mandatory water inspection. Open the gate quickly."
              </p>
              <ul className="text-[13px] text-[#65625B] space-y-2.5 pt-1">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#E5654F]" />
                  <span>Detected urgency & impersonation flags</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#E5654F]" />
                  <span>Zero matching appointments in manifest</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between text-[13px] font-semibold">
              <span className="text-[#922525]">Access denied</span>
              <span className="text-[#918C84]">Security alert</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. TECHNICAL ARCHITECTURE SECTION ─── */}
      <section id="architecture" className="max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="product-card p-8 sm:p-14">
          <InteractiveArchitecture
            latestEvent={latestEvent}
            onRunDemoConsole={() => onNavigate('/console')}
          />
        </div>
      </section>
    </div>
  )
}
