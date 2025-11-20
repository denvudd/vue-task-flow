import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

/**
 * Get a user profile by ID
 */
export async function getProfile(userId: string) {
  return await supabase.from('profiles').select('*').eq('id', userId).single()
}

/**
 * Create a new user profile
 */
export async function createProfile(profile: ProfileInsert) {
  return await supabase.from('profiles').insert(profile).select().single()
}

/**
 * Update a user profile
 */
export async function updateProfile(userId: string, updates: ProfileUpdate) {
  return await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()
}

/**
 * Delete a user profile
 */
export async function deleteProfile(userId: string) {
  return await supabase.from('profiles').delete().eq('id', userId)
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string) {
  let query = supabase.from('profiles').select('id').eq('username', username)

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query.single()

  if (error && error.code === 'PGRST116') {
    return true
  }

  return !data
}

/**
 * Search profiles by username or full name
 */
export async function searchProfiles(searchTerm: string, limit: number = 10) {
  return await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
    .limit(limit)
}

/**
 * Get profiles by role
 */
export async function getProfilesByRole(role: string) {
  return await supabase.from('profiles').select('*').eq('role', role)
}

/**
 * Upload avatar to Supabase storage
 */
export async function uploadAvatar(userId: string, file: File) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('User must be authenticated to upload avatar')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: oldFiles } = await supabase.storage.from('avatars').list(userId, {
      limit: 10,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    if (oldFiles && oldFiles.length > 0) {
      const filesToDelete = oldFiles.slice(1).map((f) => `${userId}/${f.name}`)

      if (filesToDelete.length > 0) {
        await supabase.storage.from('avatars').remove(filesToDelete)
      }
    }
  }

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (uploadError) {
    throw uploadError
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath)

  return { path: filePath, url: publicUrl }
}

/**
 * Delete avatar from Supabase storage
 */
export async function deleteAvatar(filePath: string) {
  return await supabase.storage.from('avatars').remove([filePath])
}
