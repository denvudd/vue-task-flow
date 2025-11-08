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


