import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

/**
 * Get all projects for the current user
 */
export async function getUserProjects(userId: string) {
  return await supabase
    .from('projects')
    .select('*, owner:profiles!owner_id(*)')
    .or(`owner_id.eq.${userId}`)
    .order('created_at', { ascending: false })
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
  return await supabase
    .from('projects')
    .select('*, owner:profiles!owner_id(*), members:project_members(*, user:profiles(*))')
    .eq('id', projectId)
    .single()
}

/**
 * Create a new project
 */
export async function createProject(project: ProjectInsert) {
  return await supabase.from('projects').insert(project).select().single()
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: ProjectUpdate) {
  return await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single()
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  return await supabase.from('projects').delete().eq('id', projectId)
}

/**
 * Add a member to a project
 */
export async function addProjectMember(projectId: string, userId: string, role?: string) {
  return await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      role: role || 'member',
    })
    .select()
    .single()
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(projectId: string, userId: string) {
  return await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)
}

/**
 * Get project members
 */
export async function getProjectMembers(projectId: string) {
  return await supabase
    .from('project_members')
    .select('*, user:profiles(*)')
    .eq('project_id', projectId)
}





