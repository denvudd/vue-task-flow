import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import {
  getUserProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  type ProjectInsert,
  type ProjectUpdate,
} from '@/api/projects'

/**
 * Query keys for projects
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (userId: string) => [...projectKeys.lists(), userId] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (projectId: string) => [...projectKeys.details(), projectId] as const,
}

/**
 * Hook to fetch user's projects
 */
export function useUserProjects(userId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ['projects', 'user', userId],
    queryFn: async () => {
      const id = unref(userId)
      if (!id) throw new Error('User ID is required')

      const { data, error } = await getUserProjects(id)
      if (error) throw error
      return data || []
    },
    enabled: () => !!unref(userId),
  })
}

/**
 * Hook to fetch a single project
 */
export function useProject(projectId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ['projects', 'detail', projectId],
    queryFn: async () => {
      const id = unref(projectId)
      if (!id) throw new Error('Project ID is required')

      const { data, error } = await getProject(id)
      if (error) throw error
      return data
    },
    enabled: () => !!unref(projectId),
  })
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const { data, error } = await createProject(project)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'user'] })
    },
  })
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: ProjectUpdate }) => {
      const { data, error } = await updateProject(projectId, updates)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'detail', data?.id] })
      queryClient.invalidateQueries({ queryKey: ['projects', 'user'] })
    },
  })
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await deleteProject(projectId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'user'] })
    },
  })
}
