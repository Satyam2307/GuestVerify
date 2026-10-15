import React, { useState, useEffect } from 'react'
import {
  Settings,
  Shield,
  Cpu,
  Radio,
  Lock,
  CheckCircle2,
  Zap
} from 'lucide-react'
import { fetchHealth } from '../lib/api'
import { HealthResponse } from '../types'

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-16 space-y-10 text-[#18170F]">
      {/* Page Header */}
      <div className="space-y-1.5 pb-6 border-b border-black/[0.06] max-w-2xl">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#18170F] tracking-[-0.03em]">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-[#65625B] leading-relaxed font-medium">
          Hardware configuration, Bedrock LLM endpoints, and zero-trust verification rules.
        </p>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Connected Hardware Devices */}
        <div className="product-card p-8 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <Radio className="w-5 h-5 text-[#18170F]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#18170F] tracking-tight">Connected Ring devices</h2>
              <p className="text-xs text-[#65625B] font-medium">Live doorbell endpoints and virtual simulation nodes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] border border-black/[0.04] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#18170F] block">Front Doorbell Pro</span>
                <span className="text-[11px] text-[#918C84] font-medium">ID: front_door_doorbell</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#E1F3E7] to-[#D2EDDA] text-[#186941] border border-[#A8DFB8] glow-badge-green">
                Active
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] border border-black/[0.04] flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#18170F] block">Backyard Camera</span>
                <span className="text-[11px] text-[#918C84] font-medium">ID: backyard_camera</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F5F1EB] text-[#65625B] border border-black/[0.06]">
                Standby
              </span>
            </div>
          </div>
        </div>

        {/* Amazon Bedrock Configuration */}
        <div className="product-card p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <Cpu className="w-5 h-5 text-[#18170F]" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#18170F] tracking-tight">Amazon Bedrock intelligence layer</h2>
                <p className="text-xs text-[#65625B] font-medium">Natural language claim extraction and visitor speech understanding</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#E1F3E7] to-[#D2EDDA] text-[#186941] border border-[#A8DFB8] self-start sm:self-auto glow-badge-green">
              {health?.demo_mode ? 'Demo simulator active' : 'Connected to AWS Bedrock'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] border border-black/[0.04]">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#918C84] block mb-1.5">
                Active model
              </span>
              <span className="text-sm font-bold text-[#18170F] block">
                {health?.model_id || 'anthropic.claude-3-haiku-20240307-v1:0'}
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] border border-black/[0.04]">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#918C84] block mb-1.5">
                Target region
              </span>
              <span className="text-sm font-bold text-[#18170F] block">
                us-east-1 (N. Virginia)
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] border border-black/[0.05] text-[13px] text-[#65625B] leading-relaxed">
            <strong className="text-[#18170F] block font-bold mb-1">Security architectural contract</strong>
            Bedrock evaluates speech transcripts for factual claim extraction only. The AI model is never granted direct authority to execute hardware latch or unlock commands.
          </div>
        </div>

        {/* Webhook & Zero-Trust Security Guarantee */}
        <div className="product-card p-8 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5F1EB] to-[#EDE8E0] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <Lock className="w-5 h-5 text-[#18170F]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#18170F] tracking-tight">Security policies & webhook verification</h2>
              <p className="text-xs text-[#65625B] font-medium">Zero-trust validation and fail-closed guarantees</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] border border-black/[0.04]">
              <div>
                <span className="font-bold text-sm text-[#18170F] block">X-Ring-Token verification</span>
                <span className="text-[13px] text-[#65625B] font-medium">Protects incoming webhook endpoints against unauthorized spoofing</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#E1F3E7] to-[#D2EDDA] text-[#186941] border border-[#A8DFB8]">
                Enforced
              </span>
            </div>

            <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F3F0EA] border border-black/[0.04]">
              <div>
                <span className="font-bold text-sm text-[#18170F] block">Fail-closed guarantee</span>
                <span className="text-[13px] text-[#65625B] font-medium">If Bedrock or network is unreachable, policy automatically defaults to secure denial</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#E1F3E7] to-[#D2EDDA] text-[#186941] border border-[#A8DFB8]">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
