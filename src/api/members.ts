import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { ProjectRole } from '@/constants/projects'

export type ProjectMember = Tables<'project_members'>
export type ProjectMemberInsert = TablesInsert<'project_members'>
export type ProjectMemberUpdate = TablesUpdate<'project_members'>

/**
 * Get all members of a project with their profile information
 */
export async function getProjectMembers(projectId: string) {
  return await supabase
    .from('project_members')
    .select('*, user:profiles(*)')
    .eq('project_id', projectId)
    .order('joined_at', { ascending: true })
}

/**
 * Add a member to a project
 */
export async function addProjectMember(projectId: string, userId: string, role: ProjectRole) {
  return await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      role,
    })
    .select('*, user:profiles(*)')
    .single()
}

/**
 * Update a project member's role
 */
export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: ProjectRole,
) {
  return await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .select('*, user:profiles(*)')
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
