import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
import type { ProjectRole } from '@/constants/projects'

export type InviteLink = Tables<'project_invite_links'>
export type InviteLinkInsert = TablesInsert<'project_invite_links'>
export type InviteLinkUpdate = TablesUpdate<'project_invite_links'>

/**
 * Generate a unique token for invite link
 */
function generateInviteToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get all invite links for a project
 */
export async function getProjectInviteLinks(projectId: string) {
  return await supabase
    .from('project_invite_links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
}

/**
 * Get invite link by token
 */
export async function getInviteLinkByToken(token: string) {
  return await supabase
    .from('project_invite_links')
    .select('*, project:projects(*)')
    .eq('token', token)
    .single()
}

/**
 * Create a new invite link
 */
export async function createInviteLink(projectId: string, role: ProjectRole) {
  const token = generateInviteToken()

  return await supabase
    .from('project_invite_links')
    .insert({
      project_id: projectId,
      role,
      token,
      active: true,
    })
    .select()
    .single()
}

/**
 * Update an invite link
 */
export async function updateInviteLink(linkId: string, updates: InviteLinkUpdate) {
  return await supabase
    .from('project_invite_links')
    .update(updates)
    .eq('id', linkId)
    .select()
    .single()
}

/**
 * Deactivate (revoke) an invite link
 */
export async function revokeInviteLink(linkId: string) {
  return await updateInviteLink(linkId, { active: false })
}

/**
 * Regenerate token for an invite link
 */
export async function regenerateInviteLinkToken(linkId: string) {
  const newToken = generateInviteToken()
  return await updateInviteLink(linkId, { token: newToken })
}

/**
 * Delete an invite link
 */
export async function deleteInviteLink(linkId: string) {
  return await supabase.from('project_invite_links').delete().eq('id', linkId)
}

/**
 * Join project using invite link
 */
export async function joinProjectViaInvite(token: string, userId: string) {
  // First, get the invite link details
  const { data: inviteLink, error: inviteError } = await getInviteLinkByToken(token)

  if (inviteError || !inviteLink) {
    throw new Error('Invalid or expired invite link')
  }

  if (!inviteLink.active) {
    throw new Error('This invite link is no longer active')
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', inviteLink.project_id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingMember) {
    // User is already a member, check if we need to upgrade role
    const currentRole = existingMember.role as ProjectRole
    const inviteRole = inviteLink.role as ProjectRole

    // Import role comparison function
    const { getHigherRole } = await import('@/constants/projects')
    const higherRole = getHigherRole(currentRole, inviteRole)

    if (higherRole !== currentRole) {
      // Upgrade role
      const { error: updateError } = await supabase
        .from('project_members')
        .update({ role: higherRole })
        .eq('project_id', inviteLink.project_id)
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }

      return {
        success: true,
        status: 'role_upgraded' as const,
        role: higherRole,
        projectId: inviteLink.project_id,
      }
    }

    return {
      success: true,
      status: 'already_member' as const,
      role: currentRole,
      projectId: inviteLink.project_id,
    }
  }

  // Add user as new member
  const { error: insertError } = await supabase.from('project_members').insert({
    project_id: inviteLink.project_id,
    user_id: userId,
    role: inviteLink.role,
  })

  if (insertError) {
    throw insertError
  }

  return {
    success: true,
    status: 'joined' as const,
    role: inviteLink.role as ProjectRole,
    projectId: inviteLink.project_id,
  }
}



