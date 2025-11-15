import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase client instance
 *
 * Authentication tokens are automatically stored in localStorage
 * and persisted across page reloads. The client handles:
 * - Access token storage and refresh
 * - Automatic token renewal
 * - Session persistence
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store tokens in localStorage (default behavior)
    storage: window.localStorage,
    // Automatically detect session from URL fragments (for email confirmations, password resets, etc.)
    autoRefreshToken: true,
    // Automatically refresh token before expiry
    persistSession: true,
    // Detect session from URL on initialization
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
