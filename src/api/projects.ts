import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export type ProjectInsert = TablesInsert<'projects'>
export type ProjectUpdate = TablesUpdate<'projects'>

/**
 * Get all projects for the current user
 * Returns projects where user is owner or member
 */
export async function getUserProjects(userId: string) {
  // Get projects where user is owner
  const { data: ownedProjects, error: ownedError } = await supabase
    .from('projects')
    .select('*, owner:profiles!owner_id(*), members:project_members(user_id, role)')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (ownedError) {
    return { data: null, error: ownedError }
  }

  // Get projects where user is a member
  const { data: memberProjects, error: memberError } = await supabase
    .from('project_members')
    .select('project_id, role, project:projects(*, owner:profiles!owner_id(*), members:project_members(user_id, role))')
    .eq('user_id', userId)

  if (memberError) {
    return { data: null, error: memberError }
  }

  // Combine and deduplicate projects
  const ownedProjectsList = ownedProjects || []
  const memberProjectsList = (memberProjects || [])
    .map((member) => member.project)
    .filter((project): project is NonNullable<typeof project> => project !== null)

  // Create a map to avoid duplicates (in case user is both owner and member)
  const projectsMap = new Map<string, typeof ownedProjectsList[0]>()

  // Add owned projects
  ownedProjectsList.forEach((project) => {
    if (project) {
      projectsMap.set(project.id, project)
    }
  })

  // Add member projects (only if not already added as owner)
  memberProjectsList.forEach((project) => {
    if (project && !projectsMap.has(project.id)) {
      projectsMap.set(project.id, project)
    }
  })

  // Convert map to array and sort by created_at
  const allProjects = Array.from(projectsMap.values()).sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
    return dateB - dateA
  })

  return { data: allProjects, error: null }
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








