import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '@/types/supabase'
import * as authApi from '@/api/auth'
import * as profilesApi from '@/api/profiles'

export type Profile = Tables<'profiles'>

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  // Initialize auth state
  async function initialize() {
    if (initialized.value) return

    try {
      loading.value = true

      // Get current session
      const {
        data: { session: currentSession },
      } = await authApi.getCurrentSession()

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        await loadProfile(currentSession.user.id)
      }

      // Listen for auth changes
      authApi.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null

        if (newSession?.user) {
          await loadProfile(newSession.user.id)
        } else {
          profile.value = null
        }
      })

      initialized.value = true
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // Load user profile
  async function loadProfile(userId: string) {
    try {
      const { data, error } = await profilesApi.getProfile(userId)

      if (error) {
        // If profile doesn't exist (e.g., OAuth user), create one
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
          console.log('Profile not found, creating new profile for OAuth user')
          const currentUser = user.value
          if (currentUser?.email) {
            await createProfile(userId, currentUser.email, {
              username: currentUser.email.split('@')[0],
              full_name: currentUser.user_metadata?.full_name || null,
              avatar_url: currentUser.user_metadata?.avatar_url || null,
            })
            return
          }
        }
        throw error
      }
      profile.value = data
    } catch (error) {
      console.error('Error loading profile:', error)
      profile.value = null
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string, userData?: Partial<Profile>) {
    try {
      const { data, error } = await authApi.signUpWithEmail({ email, password })

      if (error) throw error

      // Create profile if user was created
      if (data.user) {
        await createProfile(data.user.id, email, userData)
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  // Create user profile
  async function createProfile(userId: string, email: string, userData?: Partial<Profile>) {
    try {
      // Extract username from email (part before @)
      const defaultUsername = email.split('@')[0]

      const { error } = await profilesApi.createProfile({
        id: userId,
        username: userData?.username || defaultUsername,
        full_name: userData?.full_name || null,
        avatar_url: userData?.avatar_url || null,
        role: 'user', // Default role
      })

      if (error) throw error

      // Reload profile
      await loadProfile(userId)
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await authApi.signInWithEmail({ email, password })

      if (error) throw error

      // Session and user are automatically set via onAuthStateChange
      // But we can set them here immediately for faster UI updates
      session.value = data.session
      user.value = data.user

      if (data.user) {
        await loadProfile(data.user.id)
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  // Sign in with Google OAuth
  async function signInWithGoogle(redirectTo?: string) {
    try {
      const { data, error } = await authApi.signInWithGoogle(redirectTo)

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      return { data: null, error }
    }
  }

  // Sign out
  async function signOut() {
    try {
      const { error } = await authApi.signOut()
      if (error) throw error

      // Clear local state
      user.value = null
      profile.value = null
      session.value = null

      return { error: null }
    } catch (error: any) {
      console.error('Error signing out:', error)
      return { error }
    }
  }

  // Update profile
  async function updateProfile(updates: Partial<Profile>) {
    if (!user.value) throw new Error('No user logged in')

    try {
      const { error } = await profilesApi.updateProfile(user.value.id, updates)

      if (error) throw error

      // Reload profile
      await loadProfile(user.value.id)

      return { error: null }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      return { error }
    }
  }

  // Update password
  async function updatePassword(newPassword: string) {
    try {
      console.log('[Store] Calling authApi.updatePassword...')
      const result = await authApi.updatePassword(newPassword)
      console.log('[Store] authApi.updatePassword result:', result)

      if (result.error) throw result.error
      return { error: null }
    } catch (error: any) {
      console.error('[Store] Error updating password:', error)
      return { error }
    }
  }

  // Request password reset
  async function resetPassword(email: string) {
    try {
      const { error } = await authApi.sendPasswordResetEmail(email)

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error('Error resetting password:', error)
      return { error }
    }
  }

  return {
    // State
    user,
    profile,
    session,
    loading,
    initialized,

    // Computed
    isAuthenticated,
    isAdmin,

    // Actions
    initialize,
    loadProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    updatePassword,
    resetPassword,
  }
})
