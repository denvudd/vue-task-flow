import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref, computed } from 'vue'
import {
  getTicketComments,
  createComment,
  updateComment,
  deleteComment,
  type TicketCommentInsert,
} from '@/api/comments'
import type { Tables } from '@/types/supabase'
import { useAuth } from '@/composables/useAuth'
import { useProjectContext } from '@/composables/useProjectContext'
import { PROJECT_ROLES, PROJECT_VISIBILITIES } from '@/constants/projects'
import type { ProjectRole } from '@/constants/projects'

export type TicketCommentWithAuthor = Tables<'ticket_comments'> & {
  author: Tables<'profiles'>
}

/**
 * Query keys for ticket comments
 */
export const ticketCommentKeys = {
  all: ['ticket-comments'] as const,
  lists: () => [...ticketCommentKeys.all, 'list'] as const,
  list: (ticketId: string) => [...ticketCommentKeys.lists(), ticketId] as const,
}

/**
 * Hook to fetch comments for a ticket
 */
export function useTicketComments(ticketId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ticketCommentKeys.list(unref(ticketId) || ''),
    queryFn: async () => {
      const id = unref(ticketId)
      if (!id) throw new Error('Ticket ID is required')

      const { data, error } = await getTicketComments(id)
      if (error) throw error
      return (data || []) as TicketCommentWithAuthor[]
    },
    enabled: () => !!unref(ticketId),
  })
}

/**
 * Hook to create a new comment
 */
export function useCreateTicketComment() {
  const queryClient = useQueryClient()
  console.log('here')

  return useMutation({
    mutationFn: async ({
      ticketId,
      content,
      authorId,
    }: {
      ticketId: string
      content: string
      authorId: string
    }) => {
      console.log('here 2')
      const comment: TicketCommentInsert = {
        ticket_id: ticketId,
        author_id: authorId,
        content,
      }
      await createComment(comment)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketCommentKeys.list(variables.ticketId) })
    },
    onError: (error) => {
      console.error('Failed to create comment:', error)
    },
  })
}

/**
 * Hook to update a comment
 */
export function useUpdateTicketComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const { data, error } = await updateComment(commentId, content)
      if (error) throw error
      return data as TicketCommentWithAuthor
    },
    onSuccess: (data) => {
      // Invalidate comments for the ticket
      if (data?.ticket_id) {
        queryClient.invalidateQueries({ queryKey: ticketCommentKeys.list(data.ticket_id) })
      }
    },
  })
}

/**
 * Hook to delete a comment
 */
export function useDeleteTicketComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId, ticketId }: { commentId: string; ticketId: string }) => {
      const { error } = await deleteComment(commentId)
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketCommentKeys.list(variables.ticketId) })
    },
  })
}

/**
 * Hook to check if user can comment on tickets
 * User can comment if:
 * 1. They are a project member with "editor" role, OR
 * 2. They are a project member with "commenter" role, OR
 * 3. The project is public (visibility: "public")
 */
export function useCanComment() {
  const { user, isAuthenticated } = useAuth()
  const { project } = useProjectContext()

  const canComment = computed(() => {
    if (!isAuthenticated.value || !user.value) {
      return false
    }

    const projectData = project.value
    if (!projectData) {
      return false
    }

    // Check if project is public
    if (projectData.visibility === PROJECT_VISIBILITIES.PUBLIC) {
      return true
    }

    // Check if user is owner (owners can always comment)
    if (projectData.owner_id === user.value.id) {
      return true
    }

    // Check if user is a member with editor or commenter role
    const projectMembers = projectData.members as Array<{
      user_id: string
      role: ProjectRole | null
    }> | null

    if (!projectMembers) {
      return false
    }

    const userMember = projectMembers.find((member) => member.user_id === user.value?.id)

    if (!userMember) {
      return false
    }

    const userRole = userMember.role as ProjectRole | null

    return userRole === PROJECT_ROLES.EDITOR || userRole === PROJECT_ROLES.COMMENTER
  })

  return {
    canComment,
  }
}
