import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

/**
 * Composable for working with authentication
 * Provides reactive access to auth state and methods
 */
export function useAuth() {
  const authStore = useAuthStore()

  // Get reactive refs from store
  const { user, profile, session, loading, initialized, isAuthenticated, isAdmin } =
    storeToRefs(authStore)

  // Get actions from store
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
}
