import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

/**
 * Composable for working with authentication
 * Provides reactive access to auth state and methods
 */
export function useAuth() {
  const authStore = useAuthStore()

  const { user, profile, session, loading, initialized, isAuthenticated, isAdmin } =
    storeToRefs(authStore)

  const {
    initialize,
    loadProfile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    updatePassword,
    resetPassword,
  } = authStore

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
}
