/* eslint-disable @typescript-eslint/no-explicit-any */
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

  async function initialize() {
    try {
      loading.value = true

      const {
        data: { session: currentSession },
      } = await authApi.getCurrentSession()

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        await loadProfile(currentSession.user.id)
      }

      if (!initialized.value) {
        authApi.onAuthStateChange(async (_event, newSession) => {
          // https://github.com/supabase/supabase-js/issues/1441
          setTimeout(async () => {
            console.log('fired')
            session.value = newSession
            user.value = newSession?.user ?? null

            if (newSession?.user) {
              await loadProfile(newSession.user.id)
            } else {
              profile.value = null
            }
          }, 0)
        })
        initialized.value = true
      }
    } catch (error) {
      console.error('[AuthStore] Error initializing:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await profilesApi.getProfile(userId)

      if (error) {
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

  async function signUp(email: string, password: string, userData?: Partial<Profile>) {
    try {
      const { data, error } = await authApi.signUpWithEmail({ email, password })

      if (error) throw error

      if (data.user) {
        await createProfile(data.user.id, email, userData)
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  async function createProfile(userId: string, email: string, userData?: Partial<Profile>) {
    try {
      const defaultUsername = email.split('@')[0]

      const { error } = await profilesApi.createProfile({
        id: userId,
        username: userData?.username || defaultUsername,
        full_name: userData?.full_name || null,
        avatar_url: userData?.avatar_url || null,
        role: 'user',
      })

      if (error) throw error

      await loadProfile(userId)
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await authApi.signInWithEmail({ email, password })

      if (error) throw error

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

  async function signOut() {
    try {
      const { error } = await authApi.signOut()
      if (error) throw error

      user.value = null
      profile.value = null
      session.value = null

      return { error: null }
    } catch (error: any) {
      console.error('Error signing out:', error)
      return { error }
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user.value) throw new Error('No user logged in')

    try {
      const { error } = await profilesApi.updateProfile(user.value.id, updates)

      if (error) throw error

      await loadProfile(user.value.id)

      return { error: null }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      return { error }
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      const result = await authApi.updatePassword(newPassword)

      if (result.error) throw result.error
      return { error: null }
    } catch (error: any) {
      console.error('[Store] Error updating password:', error)
      return { error }
    }
  }

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
    user,
    profile,
    session,
    loading,
    initialized,

    isAuthenticated,
    isAdmin,

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
