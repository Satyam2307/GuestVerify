import { useEffect } from 'react'

interface PageMetaConfig {
  title: string
  description: string
  canonicalPath: string
}

const META_MAP: Record<string, PageMetaConfig> = {
  '/': {
    title: 'GuestVerify — Smart-Home AI Gatekeeper | Zero-Trust Visitor Verification',
    description: 'AI-assisted smart-home visitor verification and zero-trust security gatekeeper powered by Amazon Bedrock and deterministic policy enforcement.',
    canonicalPath: '/'
  },
  '/console': {
    title: 'Live Gatekeeper Console — GuestVerify',
    description: 'Simulate Ring doorbell events, inspect Bedrock AI visitor intent extraction, and test deterministic access policy evaluation in real-time.',
    canonicalPath: '/console'
  },
  '/schedules': {
    title: 'Access Schedules & Deliveries — GuestVerify',
    description: 'Manage scheduled visitor access windows, expected delivery tracking codes, and recurring guest permissions.',
    canonicalPath: '/schedules'
  },
  '/events': {
    title: 'Security Audit Log & History — GuestVerify',
    description: 'Immutable historical record of visitor door interactions, AI extractions, risk scores, and enforced policy actions.',
    canonicalPath: '/events'
  },
  '/settings': {
    title: 'Zero-Trust Security Settings — GuestVerify',
    description: 'Configure Bedrock model parameters, fail-closed security guarantees, and inspect system telemetry status.',
    canonicalPath: '/settings'
  },
  '/contact': {
    title: 'Contact Security Team & Enterprise Support — GuestVerify',
    description: 'Connect with the GuestVerify engineering team for enterprise inquiries, architecture questions, or WhatsApp direct support.',
    canonicalPath: '/contact'
  },
  '/404': {
    title: '404 Page Not Found — GuestVerify',
    description: 'The requested security route or documentation page could not be located on GuestVerify.',
    canonicalPath: '/404'
  }
}

export function usePageMetadata(currentPath: string) {
  useEffect(() => {
    const meta = META_MAP[currentPath] || {
      title: '404 Page Not Found — GuestVerify',
      description: 'The requested security route or documentation page could not be located on GuestVerify.',
      canonicalPath: currentPath
    }

    // 1. Update Document Title
    document.title = meta.title

    // 2. Update Meta Description
    let descElem = document.querySelector('meta[name="description"]')
    if (!descElem) {
      descElem = document.createElement('meta')
      descElem.setAttribute('name', 'description')
      document.head.appendChild(descElem)
    }
    descElem.setAttribute('content', meta.description)

    // 3. Update Canonical Tag
    let canonicalElem = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonicalElem) {
      canonicalElem = document.createElement('link')
      canonicalElem.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalElem)
    }
    const baseUrl = 'https://guestverify.ai'
    canonicalElem.setAttribute('href', `${baseUrl}${meta.canonicalPath === '/' ? '' : meta.canonicalPath}`)

    // 4. Update OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', meta.title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', meta.description)
  }, [currentPath])
}
