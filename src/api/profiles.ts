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
    // No rows returned, username is available
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
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('User must be authenticated to upload avatar')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  // Use user-specific folder structure for better RLS support
  const filePath = `${userId}/${fileName}`

  // Delete old avatar if exists (before uploading new one)
  // This helps with storage quotas and cleanup
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (user) {
    // Try to list and delete old files in user's folder
    const { data: oldFiles } = await supabase.storage
      .from('avatars')
      .list(userId, {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (oldFiles && oldFiles.length > 0) {
      // Delete old avatar files (keep only the newest)
      const filesToDelete = oldFiles.slice(1).map((f) => `${userId}/${f.name}`)
      if (filesToDelete.length > 0) {
        await supabase.storage.from('avatars').remove(filesToDelete)
      }
    }
  }

  // Upload file to avatars bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Allow overwriting if file exists
    })

  if (uploadError) {
    throw uploadError
  }

  // Get public URL
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


