import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import {
  getProjectInviteLinks,
  getInviteLinkByToken,
  createInviteLink,
  updateInviteLink,
  revokeInviteLink,
  regenerateInviteLinkToken,
  deleteInviteLink,
  joinProjectViaInvite,
  type InviteLinkUpdate,
} from '@/api/invites'
import type { ProjectRole } from '@/constants/projects'
import { projectKeys } from './useProjects'

/**
 * Query keys for invite links
 */
export const inviteKeys = {
  all: ['invites'] as const,
  lists: () => [...inviteKeys.all, 'list'] as const,
  list: (projectId: string) => [...inviteKeys.lists(), projectId] as const,
  details: () => [...inviteKeys.all, 'detail'] as const,
  detail: (token: string) => [...inviteKeys.details(), token] as const,
}

/**
 * Hook to fetch project invite links
 */
export function useProjectInviteLinks(projectId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ['invites', 'list', projectId],
    queryFn: async () => {
      const id = unref(projectId)
      if (!id) throw new Error('Project ID is required')
      return getProjectInviteLinks(id)
    },
    enabled: () => !!unref(projectId),
  })
}

/**
 * Hook to fetch invite link by token
 */
export function useInviteLinkByToken(token: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ['invites', 'detail', token],
    queryFn: async () => {
      const t = unref(token)
      if (!t) throw new Error('Token is required')
      return getInviteLinkByToken(t)
    },
    enabled: () => !!unref(token),
    retry: false,
  })
}

/**
 * Hook to create a new invite link
 */
export function useCreateInviteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, role }: { projectId: string; role: ProjectRole }) =>
      createInviteLink(projectId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.list(variables.projectId) })
    },
  })
}

/**
 * Hook to update an invite link
 */
export function useUpdateInviteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ linkId, updates }: { linkId: string; updates: InviteLinkUpdate }) =>
      updateInviteLink(linkId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() })
    },
  })
}

/**
 * Hook to revoke an invite link
 */
export function useRevokeInviteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: string) => revokeInviteLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() })
    },
  })
}

/**
 * Hook to regenerate invite link token
 */
export function useRegenerateInviteLinkToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: string) => regenerateInviteLinkToken(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() })
    },
  })
}

/**
 * Hook to delete an invite link
 */
export function useDeleteInviteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: string) => deleteInviteLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inviteKeys.lists() })
    },
  })
}

/**
 * Hook to join project via invite link
 */
export function useJoinProjectViaInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, userId }: { token: string; userId: string }) =>
      joinProjectViaInvite(token, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}
