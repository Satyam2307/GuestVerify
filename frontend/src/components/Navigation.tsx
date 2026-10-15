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
          ? 'bg-[#12110D]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.35)]'
          : 'bg-[#181712]/98 backdrop-blur-xl border-b border-white/[0.07]'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[76px]">
          {/* Brand area */}
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-xl pr-2 -ml-1"
            aria-label="GuestVerify Home"
          >
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#25231C] to-[#3A372E] border border-white/15 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all group-hover:shadow-[0_6px_20px_rgba(93,168,126,0.3)] group-hover:scale-[1.03]">
              <Shield className="w-5 h-5 text-[#5DA87E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] sm:text-[17px] tracking-[-0.02em] text-white">
                  GuestVerify
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] text-[#A5A096] block -mt-0.5 font-medium tracking-wide">
                Zero-Trust AI Gatekeeper
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.07] border border-white/[0.08] backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-[7px] text-[12px] font-semibold rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                    isActive
                      ? 'bg-white text-[#14130D] shadow-[0_2px_10px_rgba(255,255,255,0.25)] font-bold'
                      : 'text-[#B8B3A8] hover:text-white hover:bg-white/[0.08]'
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
            <div className="flex items-center gap-3 text-[11.5px] text-[#A5A096] font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5DA87E] opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5DA87E]" />
                </span>
                <span className="text-white/90 font-medium">Online</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
                <span className={`w-2 h-2 rounded-full ${getBedrockDotColor()}`} />
                <span className="text-white/90 font-medium">{getBedrockLabel()}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            {isConsole ? (
              <button
                onClick={onRunDemo}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E5654F] to-[#F2815E] hover:from-[#F0715C] hover:to-[#FFA080] text-white text-[12px] font-bold shadow-[0_4px_16px_rgba(229,101,79,0.35)] transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Demo</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/console')}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-[#14130D] text-[12px] font-bold shadow-[0_4px_16px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_22px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center gap-1.5 cursor-pointer active:scale-95 group"
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
          className="lg:hidden border-t border-white/[0.08] bg-[#14130D] px-6 py-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Status strip */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs text-[#A5A096] font-medium">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5DA87E] opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5DA87E]" />
              </span>
              <span className="text-white/90">System Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${getBedrockDotColor()}`} />
              <span className="text-white/90">{getBedrockLabel()}</span>
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
                      ? 'bg-white text-[#14130D] font-bold shadow-md'
                      : 'text-[#B8B3A8] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current text-[#14130D]" />
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
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#E5654F] to-[#F2815E] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Demo</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/console')}
                className="w-full py-3.5 rounded-full bg-white text-[#14130D] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform"
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
