'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes
const WARNING_THRESHOLD = 2 * 60 * 1000 // 2 minutes
const ABSOLUTE_LIMIT = 8 * 60 * 60 * 1000 // 8 hours

export function useInactivityTimeout() {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(WARNING_THRESHOLD)
  const timer = useRef<NodeJS.Timeout>(null)
  const absoluteTimer = useRef<NodeJS.Timeout>(null)
  const warningInterval = useRef<NodeJS.Timeout>(null)
  
  // Create Supabase client with persistSession: false for forge security
  const supabase = createClient(false)

  const logout = async (reason: 'inactivity' | 'expired') => {
    await supabase.auth.signOut()
    sessionStorage.removeItem('session_start')
    router.push(`/login?reason=${reason}`)
    router.refresh()
  }

  const resetTimer = () => {
    setShowWarning(false)
    setTimeLeft(WARNING_THRESHOLD)
    if (timer.current) clearTimeout(timer.current)
    if (warningInterval.current) clearInterval(warningInterval.current)

    // Set timer for the warning threshold
    timer.current = setTimeout(() => {
      setShowWarning(true)
      
      // Countdown for the last 2 minutes
      warningInterval.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            clearInterval(warningInterval.current!)
            logout('inactivity')
            return 0
          }
          return prev - 1000
        })
      }, 1000)

    }, INACTIVITY_LIMIT - WARNING_THRESHOLD)
  }

  const staySignedIn = () => {
    resetTimer()
  }

  useEffect(() => {
    // 1. Inactivity Logic
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    const handleEvent = () => {
      if (!showWarning) resetTimer()
    }

    events.forEach(e => window.addEventListener(e, handleEvent))
    resetTimer()

    // 2. Absolute Session Limit Logic
    const sessionStart = sessionStorage.getItem('session_start')
    if (sessionStart) {
      const startTime = parseInt(sessionStart)
      const elapsed = Date.now() - startTime
      
      if (elapsed >= ABSOLUTE_LIMIT) {
        logout('expired')
      } else {
        absoluteTimer.current = setTimeout(() => {
          logout('expired')
        }, ABSOLUTE_LIMIT - elapsed)
      }
    }

    return () => {
      events.forEach(e => window.removeEventListener(e, handleEvent))
      if (timer.current) clearTimeout(timer.current)
      if (absoluteTimer.current) clearTimeout(absoluteTimer.current)
      if (warningInterval.current) clearInterval(warningInterval.current)
    }
  }, [showWarning])

  return { showWarning, timeLeft, staySignedIn, logout: () => logout('inactivity') }
}
