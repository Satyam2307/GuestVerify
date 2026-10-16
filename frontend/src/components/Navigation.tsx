import React, { useState, useEffect, useRef } from 'react'
import {
  Shield,
  Menu,
  X,
  ArrowRight,
  Play,
  Zap
} from 'lucide-react'
import { HealthResponse } from '../types'

interface NavigationProps {
  currentPath: string
  onNavigate: (path: string) => void
  onRunDemo?: () => void
  health?: HealthResponse | null
  sseConnected?: boolean
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onNavigate,
  onRunDemo,
  health,
  sseConnected = true
}) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Track scroll position for dynamic backdrop transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  const isConsole = currentPath === '/console'

  // Derive Bedrock & System Status
  const isDemo = health ? health.demo_mode : true
  const isBedrockReady = health ? health.bedrock_configured && health.bedrock_available : true

  const getBedrockLabel = () => {
    if (!isBedrockReady) return 'Bedrock offline'
    if (isDemo) return 'Bedrock demo mode'
    return 'Bedrock connected'
  }

  const getBedrockDotColor = () => {
    if (!isBedrockReady) return 'bg-[#C83C3C]'
    if (isDemo) return 'bg-[#E4A02F]'
    return 'bg-[#5DA87E]'
  }

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'Live Console', path: '/console' },
    { label: 'Schedules', path: '/schedules' },
    { label: 'Event History', path: '/events' },
    { label: 'Settings', path: '/settings' },
    { label: 'Contact', path: '/contact' }
  ]

  const handleLinkClick = (path: string) => {
    onNavigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-400 ${
        scrolled
          ? 'bg-[#14100E]/95 backdrop-blur-2xl border-b border-[#B7A89A]/20 shadow-[0_4px_30px_rgba(0,0,0,0.45)]'
          : 'bg-[#181310]/98 backdrop-blur-xl border-b border-[#B7A89A]/15'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[76px]">
          {/* Brand area */}
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8DCC6]/40 rounded-xl pr-2 -ml-1"
            aria-label="GuestVerify Home"
          >
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#722F37] via-[#5C232A] to-[#3D151B] border border-[#E8DCC6]/30 flex items-center justify-center text-white shadow-[0_4px_16px_rgba(114,47,55,0.4)] transition-all group-hover:shadow-[0_6px_22px_rgba(114,47,55,0.6)] group-hover:scale-[1.03]">
              <Shield className="w-5 h-5 text-[#E8DCC6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] sm:text-[17px] tracking-[-0.02em] text-[#FAF7F2]">
                  GuestVerify
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#722F37]/40 text-[#E8DCC6] border border-[#E8DCC6]/25">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-[#B7A89A] block -mt-0.5 font-medium tracking-wide">
                Zero-Trust AI Gatekeeper
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.05] border border-[#B7A89A]/20 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-[7px] text-[12px] font-semibold rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8DCC6]/30 ${
                    isActive
                      ? 'bg-[#E8DCC6] text-[#722F37] shadow-[0_2px_12px_rgba(232,220,198,0.35)] font-bold'
                      : 'text-[#B7A89A] hover:text-[#FAF7F2] hover:bg-white/[0.08]'
                  }`}
                >
                  {link.label}
                </button>
              )
            })}
          </div>

          {/* Right Status & Primary CTA */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Quiet status indicators */}
            <div className="flex items-center gap-3 text-[11.5px] text-[#B7A89A] font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-[#B7A89A]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5DA87E] opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5DA87E]" />
                </span>
                <span className="text-[#E8DCC6] font-medium">Online</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-[#B7A89A]/20">
                <span className={`w-2 h-2 rounded-full ${getBedrockDotColor()}`} />
                <span className="text-[#E8DCC6] font-medium">{getBedrockLabel()}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            {isConsole ? (
              <button
                onClick={onRunDemo}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#722F37] to-[#8D3A44] hover:from-[#8D3A44] hover:to-[#A3434E] text-white text-[12px] font-bold shadow-[0_4px_18px_rgba(114,47,55,0.45)] transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Demo</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/console')}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#722F37] to-[#8D3A44] hover:from-[#8D3A44] hover:to-[#9E424E] text-white text-[12px] font-bold shadow-[0_4px_20px_rgba(114,47,55,0.4)] hover:shadow-[0_6px_26px_rgba(114,47,55,0.55)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 group"
              >
                <span>Open Console</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full text-white/90 hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden border-t border-[#B7A89A]/20 bg-[#161210] px-6 py-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Status strip */}
          <div className="flex items-center justify-between pb-3 border-b border-[#B7A89A]/15 text-xs text-[#B7A89A] font-medium">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5DA87E] opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5DA87E]" />
              </span>
              <span className="text-[#E8DCC6]">System Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${getBedrockDotColor()}`} />
              <span className="text-[#E8DCC6]">{getBedrockLabel()}</span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E8DCC6] text-[#722F37] font-bold shadow-md'
                      : 'text-[#B7A89A] hover:text-[#FAF7F2] hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current text-[#722F37]" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Mobile CTA */}
          <div className="pt-2">
            {isConsole ? (
              <button
                onClick={() => {
                  onRunDemo?.()
                  setMobileMenuOpen(false)
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#722F37] to-[#8D3A44] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Demo</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/console')}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#722F37] to-[#8D3A44] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform"
              >
                <span>Open Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
