import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import {
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from '@/api/members'
import type { ProjectRole } from '@/constants/projects'
import { projectKeys } from './useProjects'

/**
 * Query keys for project members
 */
export const memberKeys = {
  all: ['members'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (projectId: string) => [...memberKeys.lists(), projectId] as const,
}

/**
 * Hook to fetch project members
 */
export function useProjectMembers(projectId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ['members', 'list', projectId],
    queryFn: async () => {
      const id = unref(projectId)
      if (!id) throw new Error('Project ID is required')
      return getProjectMembers(id)
    },
    enabled: () => !!unref(projectId),
  })
}

/**
 * Hook to add a project member
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      role,
    }: {
      projectId: string
      userId: string
      role: ProjectRole
    }) => addProjectMember(projectId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

/**
 * Hook to update a project member's role
 */
export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      role,
    }: {
      projectId: string
      userId: string
      role: ProjectRole
    }) => updateProjectMemberRole(projectId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}

/**
 * Hook to remove a project member
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      removeProjectMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.list(variables.projectId) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
    },
  })
}
