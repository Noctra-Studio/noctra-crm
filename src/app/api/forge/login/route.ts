import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { assertSameOrigin } from '@/lib/request-security'

// Simple in-memory rate limiting
const ATTEMPTS_LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>()

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  
  // Rate limit check
  const attempts = loginAttempts.get(ip)
  if (attempts) {
    if (now - attempts.lastAttempt > WINDOW_MS) {
      // Reset after window
      loginAttempts.delete(ip)
    } else if (attempts.count >= ATTEMPTS_LIMIT) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 15 minutes.' },
        { status: 429 }
      )
    }
  }

  try {
    const { email, password } = await req.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Record failed attempt
      const current = loginAttempts.get(ip) ?? { count: 0, lastAttempt: now }
      loginAttempts.set(ip, { count: current.count + 1, lastAttempt: now })
      
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Success - clear attempts
    loginAttempts.delete(ip)
    
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
