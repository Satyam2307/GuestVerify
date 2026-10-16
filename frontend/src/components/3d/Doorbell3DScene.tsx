import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle2, PackageCheck, Bell, Activity } from 'lucide-react'

export const Doorbell3DScene: React.FC = () => {
  const [rotateX, setRotateX] = useState(6)
  const [rotateY, setRotateY] = useState(-10)
  const [isHovered, setIsHovered] = useState(false)
  const [pulseActive, setPulseActive] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive((prev) => !prev)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotateY((x / rect.width) * 18)
    setRotateX(-(y / rect.height) * 16)
  }

  const handleMouseLeave = () => {
    setRotateX(6)
    setRotateY(-10)
    setIsHovered(false)
  }

  return (
    <div
      className="relative w-full max-w-[560px] aspect-[4/3] flex items-center justify-center perspective-container select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic 3D Scene Wrapper */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out preserve-3d"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Soft Ambient Depth Background Glow */}
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#722F37]/15 to-[#E8DCC6]/30 blur-3xl -z-10 pointer-events-none" />

        {/* ─── 3D SMART DOORBELL HARDWARE ─── */}
        <div
          className="relative w-36 h-80 rounded-[32px] bg-gradient-to-b from-[#241F1D] via-[#1A1615] to-[#120E0D] border border-[#B7A89A]/20 shadow-[0_30px_70px_-20px_rgba(114,47,55,0.25)] flex flex-col items-center justify-between p-4 z-20 transition-all duration-500"
          style={{
            transform: 'translateZ(40px)',
          }}
        >
          {/* Bezel Highlight */}
          <div className="absolute inset-0 rounded-[32px] border-t border-l border-white/20 pointer-events-none" />

          {/* Top Camera Lens Module */}
          <div className="relative w-20 h-20 rounded-full bg-[#0D0B0A] border border-white/10 flex items-center justify-center shadow-inner mt-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#151211] to-[#26201D] border border-white/10 flex items-center justify-center relative">
              <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white/25 blur-[0.5px]" />
              <div className="w-6 h-6 rounded-full bg-[#080809] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#722F37]/60" />
              </div>
            </div>
            {/* Status LED */}
            <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-[#5DA87E]" />
          </div>

          {/* Sensor Mesh */}
          <div className="w-12 h-1.5 rounded-full bg-white/10 flex items-center justify-center my-auto">
            <div className="w-8 h-0.5 rounded-full bg-[#E8DCC6]/40" />
          </div>

          {/* Doorbell Chime Ring Button */}
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center mb-2">
            <div
              className={`absolute inset-0 rounded-full border border-[#722F37]/40 transition-all duration-1000 ${
                pulseActive ? 'scale-120 opacity-0' : 'scale-100 opacity-60'
              }`}
            />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#722F37] to-[#451B21] border border-[#E8DCC6]/30 shadow-md flex items-center justify-center cursor-pointer group">
              <Bell className="w-6 h-6 text-[#FAF7F2] group-hover:scale-105 transition-transform stroke-[1.75]" />
            </div>
          </div>
        </div>

        {/* ─── FLOATING CARD 1: Motion Event (Left) ─── */}
        <div
          className="absolute -left-4 top-12 sm:left-2 sm:top-14 bg-[#FCFAF6] p-3.5 rounded-2xl border border-[#B7A89A]/35 shadow-[0_12px_32px_rgba(114,47,55,0.06)] flex items-center gap-3 w-56 z-30 transition-transform duration-300 pointer-events-none"
          style={{
            transform: 'translateZ(75px) rotateY(-8deg)',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#B7A89A]/20 flex items-center justify-center text-[#722F37] shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5DA87E]" />
              <span className="text-[11px] font-semibold text-[#1C1917] tracking-wide">Motion detected</span>
            </div>
            <div className="text-xs text-[#5C544D] font-medium truncate">Front porch doorbell</div>
            <div className="text-[10px] text-[#8C8074]">1080p sensor active</div>
          </div>
        </div>

        {/* ─── FLOATING CARD 2: Expected Schedule (Right) ─── */}
        <div
          className="absolute -right-4 top-8 sm:right-0 sm:top-10 bg-[#FCFAF6] p-3.5 rounded-2xl border border-[#B7A89A]/35 shadow-[0_12px_32px_rgba(114,47,55,0.06)] flex items-center gap-3 w-64 z-30 transition-transform duration-300 pointer-events-none"
          style={{
            transform: 'translateZ(90px) rotateY(10deg)',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#B7A89A]/20 flex items-center justify-center text-[#722F37] shrink-0">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#1C1917]">Schedule matched</div>
            <div className="text-xs text-[#5C544D] truncate">Amazon delivery for John</div>
            <div className="text-[10px] text-[#8C8074]">Active manifest • In time window</div>
          </div>
        </div>

        {/* ─── FLOATING CARD 3: Deterministic Decision (Bottom) ─── */}
        <div
          className="absolute -bottom-4 sm:bottom-0 bg-[#FCFAF6] px-4 py-3 rounded-2xl border border-[#B7A89A]/40 shadow-[0_14px_34px_rgba(114,47,55,0.09)] flex items-center gap-3 z-30 transition-transform duration-300 pointer-events-none"
          style={{
            transform: 'translateZ(105px) rotateX(4deg)',
          }}
        >
          <div className="w-8 h-8 rounded-full bg-[#EAF7EF] flex items-center justify-center text-[#186941] shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#186941]">Approved expected</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8DCC6]/60 text-[#722F37] font-semibold border border-[#B7A89A]/40">
                Policy v2
              </span>
            </div>
            <div className="text-[11px] text-[#5C544D]">Porch box unlocked for package drop-off</div>
          </div>
        </div>
      </div>
    </div>
  )
}
