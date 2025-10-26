// hooks/usePixelTracker.js
import { useEffect, useRef } from 'react'

export const usePixelTracker = (apiEndpoint = 'http://127.0.0.1:8000/api/v1/pixels') => {
  const sessionIdRef = useRef(null)

  // Generate session ID once
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }, [])

  const trackEvent = async (eventType, eventData = {}) => {
    const payload = {
      pixel_id: 'px_123456789', // Your pixel ID
      session_id: sessionIdRef.current,
      event_type: eventType,
      event_data: eventData,
      browser_info: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      referrer_info: {
        referrer: document.referrer || 'direct',
        currentUrl: window.location.href
      },
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch(`${apiEndpoint}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })


      if (!response.ok) {
        console.error('Tracking failed:', response.status)
      }
    } catch (error) {
      console.error('Tracking error:', error)
    }
  }

  return { trackEvent }
}