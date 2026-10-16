import React, { useState, useEffect } from 'react'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { LandingPage } from './pages/LandingPage'
import { ConsolePage } from './pages/ConsolePage'
import { SchedulesPage } from './pages/SchedulesPage'
import { EventsPage } from './pages/EventsPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ContactModal } from './components/ContactModal'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { fetchHealth, subscribeToEventStream } from './lib/api'
import { HealthResponse, WebhookResponse } from './types'
import { usePageMetadata } from './lib/usePageMetadata'

const VALID_PATHS = ['/', '/console', '/schedules', '/events', '/settings', '/contact']

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [sseConnected, setSseConnected] = useState<boolean>(true)
  const [latestEvent, setLatestEvent] = useState<WebhookResponse | null>(null)
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false)

  // Dynamic document title, canonical link, and meta description management
  usePageMetadata(currentPath)

  // Sync initial URL path and browser back/forward buttons
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname
      if (VALID_PATHS.includes(path)) {
        setCurrentPath(path)
        if (path === '/contact') {
          setIsContactOpen(true)
        }
      } else {
        // Unknown route -> triggers 404 page
        setCurrentPath(path)
      }
    }

    handleUrlSync()
    window.addEventListener('popstate', handleUrlSync)
    return () => window.removeEventListener('popstate', handleUrlSync)
  }, [])

  // Fetch health telemetry periodically
  useEffect(() => {
    const checkHealth = () => {
      fetchHealth()
        .then((data) => setHealth(data))
        .catch((err) => console.warn('Could not fetch health:', err))
    }
    checkHealth()
    const timer = setInterval(checkHealth, 15000)
    return () => clearInterval(timer)
  }, [])

  // Monitor SSE connection status
  useEffect(() => {
    const unsubscribe = subscribeToEventStream(
      (eventType, data) => {
        setSseConnected(true)
        if (eventType === 'action_executed' && data) {
          try {
            setLatestEvent(data)
          } catch (_) {}
        }
      },
      () => {
        setSseConnected(false)
      }
    )
    return () => unsubscribe()
  }, [])

  const navigateTo = (path: string) => {
    setCurrentPath(path)
    window.history.pushState({}, '', path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (path === '/contact') {
      setIsContactOpen(true)
    }
  }

  const handleRunDemoNavbar = () => {
    if (currentPath !== '/console') {
      navigateTo('/console')
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('guestverify:run_demo'))
      }, 150)
    } else {
      window.dispatchEvent(new CustomEvent('guestverify:run_demo'))
    }
  }

  const renderActivePage = () => {
    switch (currentPath) {
      case '/console':
        return <ConsolePage />
      case '/schedules':
        return <SchedulesPage />
      case '/events':
        return <EventsPage />
      case '/settings':
        return <SettingsPage />
      case '/contact':
      case '/':
        return <LandingPage onNavigate={navigateTo} latestEvent={latestEvent} />
      default:
        // Any unrecognized URL slug shows the custom 404 page
        return <NotFoundPage onNavigate={navigateTo} onOpenContact={() => setIsContactOpen(true)} />
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#722F37]/15 selection:text-[#722F37] ${
        currentPath === '/console'
          ? 'bg-[var(--bg-page)] text-[#1C1917] overflow-hidden h-screen'
          : 'bg-[var(--bg-page)] text-[#1C1917]'
      }`}
    >
      {/* Navigation Navbar */}
      <Navigation
        currentPath={currentPath}
        onNavigate={navigateTo}
        onRunDemo={handleRunDemoNavbar}
        health={health}
        sseConnected={sseConnected}
      />

      {/* Main Content Area */}
      <main className={currentPath === '/console' ? 'w-full' : 'flex-1 w-full'}>
        {renderActivePage()}
      </main>

      {/* Footer — hidden on console to preserve single-screen viewport */}
      {currentPath !== '/console' && (
        <Footer
          onNavigate={navigateTo}
          onOpenContact={() => setIsContactOpen(true)}
          compact={false}
        />
      )}

      {/* Floating WhatsApp Contact Button */}
      <FloatingWhatsApp />

      {/* Interactive Contact & Enterprise Inquiry Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => {
          setIsContactOpen(false)
          if (currentPath === '/contact') {
            navigateTo('/')
          }
        }}
      />
    </div>
  )
}

export default App
