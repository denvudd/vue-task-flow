import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { updateProfile as updateProfileApi, type ProfileUpdate } from '@/api/profiles'

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: ProfileUpdate }) => {
      const { data, error } = await updateProfileApi(userId, updates)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
    },
  })
}
