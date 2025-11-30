import { supabase } from '../supabase'

export const getAvatarUrl = (avatarUrl: string | null) => {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('http')) return avatarUrl

  return supabase.storage.from('avatars').getPublicUrl(avatarUrl).data.publicUrl
}
