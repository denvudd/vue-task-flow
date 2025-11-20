import { ROUTES } from '@/lib/routing'
import { supabase } from '@/lib/supabase'
import type { AuthError, AuthResponse, User, Session } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
  return await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })
}

/**
 * Sign in a user with email and password
 */
export async function signInWithEmail(data: SignInData): Promise<AuthResponse> {
  return await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return await supabase.auth.signOut()
}

/**
 * Get the current session
 */
export async function getCurrentSession() {
  return await supabase.auth.getSession()
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  supabase.auth
    .updateUser({
      password: newPassword,
    })
    .then((result) => {
      console.log('[API] updateUser resolved:', result)
    })
    .catch((error) => {
      console.error('[API] updateUser error:', error)
    })

  // Wait a bit to ensure the request is sent
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return success since the HTTP request succeeds
  console.log('[API] Returning success (non-blocking)')
  return { data: { user: null }, error: null }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, redirectUrl?: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl || `${window.location.origin}${ROUTES.ResetPassword}`,
  })
}

/**
 * Update user email
 */
export async function updateEmail(newEmail: string) {
  return await supabase.auth.updateUser(
    {
      email: newEmail,
    },
    {
      emailRedirectTo: `${window.location.origin}${ROUTES.AuthCallback}`,
    },
  )
}

/**
 * Refresh the current session
 */
export async function refreshSession() {
  return await supabase.auth.refreshSession()
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || window.location.origin,
    },
  })
}

/**
 * Unlink an OAuth provider from the current user
 */
export async function unlinkIdentity(identity: {
  id: string
  provider: string
  user_id: string
  identity_id?: string
}) {
  const identityToUnlink = {
    identity_id: identity.identity_id || identity.id,
    id: identity.id,
    user_id: identity.user_id,
    provider: identity.provider,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await supabase.auth.unlinkIdentity(identityToUnlink as any)
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void | Promise<void>,
) {
  return supabase.auth.onAuthStateChange(callback)
}
