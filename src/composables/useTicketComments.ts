import { useMutation } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref, computed, ref, watch, onUnmounted } from 'vue'
import {
  getTicketComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  type TicketCommentInsert,
} from '@/api/comments'
import type { Tables } from '@/types/supabase'
import { supabase } from '@/lib/supabase'

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
 * Hook to fetch comments for a ticket using Supabase Realtime
 */
export function useTicketComments(ticketId: MaybeRef<string | undefined>) {
  const comments = ref<TicketCommentWithAuthor[]>([])
  const isLoading = ref(true)
  const error = ref<Error | null>(null)

  let channel: ReturnType<typeof supabase.channel> | null = null

  const loadInitialComments = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await getTicketComments(id)
      if (fetchError) throw fetchError
      comments.value = (data || []) as TicketCommentWithAuthor[]
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load comments')
      console.error('Error loading comments:', err)
    } finally {
      isLoading.value = false
    }
  }

  const setupRealtimeSubscription = (id: string) => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }

    channel = supabase
      .channel(`ticket-comments:${id}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${id}`,
        },
        async (payload) => {
          const newComment = payload.new as Tables<'ticket_comments'>
          const commentId = newComment?.id

          console.log(`[Realtime] Received INSERT event for comment:`, commentId)

          // Check if comment already exists
          const existingIndex = comments.value.findIndex((c) => c.id === commentId)
          if (existingIndex !== -1) {
            console.log(`[Realtime] Comment ${commentId} already exists, skipping`)
            return
          }

          try {
            // Fetch full comment with author relation
            const { data: fullComment, error: fetchError } = await getComment(commentId)
            if (fetchError) throw fetchError

            if (fullComment) {
              // Add comment maintaining chronological order
              comments.value = [...comments.value, fullComment as TicketCommentWithAuthor].sort(
                (a, b) =>
                  new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime(),
              )
              console.log(`[Realtime] Added new comment ${commentId} to list`)
            }
          } catch (err) {
            console.error('[Realtime] Error fetching full comment data:', err)
            // Fallback: skip adding comment if we can't fetch author data
            // This shouldn't happen in normal operation, but handle gracefully
            console.warn(`[Realtime] Skipping comment ${commentId} due to fetch error`)
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${id}`,
        },
        async (payload) => {
          const updatedComment = payload.new as Tables<'ticket_comments'>
          const commentId = updatedComment?.id

          console.log(`[Realtime] Received UPDATE event for comment:`, commentId)

          const index = comments.value.findIndex((c) => c.id === commentId)
          if (index !== -1 && comments.value[index]) {
            try {
              // Fetch full comment with author relation to ensure we have latest data
              const { data: fullComment, error: fetchError } = await getComment(commentId)
              if (fetchError) throw fetchError

              if (fullComment) {
                comments.value[index] = fullComment as TicketCommentWithAuthor
                console.log(`[Realtime] Updated comment ${commentId} in list`)
              } else {
                // Fallback: update with existing author data
                const existingComment = comments.value[index]
                comments.value[index] = {
                  ...existingComment,
                  ...updatedComment,
                }
              }
            } catch (err) {
              console.error('[Realtime] Error fetching updated comment data:', err)
              // Fallback: update with existing author data
              const existingComment = comments.value[index]
              comments.value[index] = {
                ...existingComment,
                ...updatedComment,
              }
            }
          } else {
            console.log(
              `[Realtime] Comment ${commentId} not found in loaded list (might be from different ticket)`,
            )
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'ticket_comments',
        },
        async (payload) => {
          const deletedComment = payload.old as Tables<'ticket_comments'>
          const commentId = deletedComment?.id

          console.log(`[Realtime] Received DELETE event for comment:`, commentId)

          const commentExists = comments.value.some((c) => c.id === commentId)

          if (commentExists) {
            comments.value = comments.value.filter((c) => c.id !== commentId)
            console.log(`[Realtime] Removed comment ${commentId} from list`)
          } else {
            console.log(
              `[Realtime] Ignoring DELETE event for comment ${commentId} (not in current ticket list)`,
            )
          }
        },
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Successfully subscribed to comments for ticket ${id}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error:', err)
          error.value = new Error('Failed to subscribe to comment updates')
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Subscription timed out')
          error.value = new Error('Realtime subscription timed out')
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Channel closed')
        }
      })
  }

  const currentTicketId = computed(() => unref(ticketId))

  watch(
    currentTicketId,
    async (newId) => {
      if (!newId) {
        comments.value = []
        isLoading.value = false
        if (channel) {
          supabase.removeChannel(channel)
          channel = null
        }
        return
      }

      await loadInitialComments(newId)
      setupRealtimeSubscription(newId)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  })

  return {
    data: computed(() => comments.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    refetch: async () => {
      const id = unref(ticketId)
      if (id) {
        await loadInitialComments(id)
      }
    },
  }
}

/**
 * Hook to create a new comment
 * Note: Realtime will automatically update the comments list, so no need to invalidate queries
 */
export function useCreateTicketComment() {
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
      const comment: TicketCommentInsert = {
        ticket_id: ticketId,
        author_id: authorId,
        content,
      }
      await createComment(comment)
    },
    onError: (error) => {
      console.error('Failed to create comment:', error)
    },
  })
}

/**
 * Hook to update a comment
 * Note: Realtime will automatically update the comments list, so no need to invalidate queries
 */
export function useUpdateTicketComment() {
  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const { data, error } = await updateComment(commentId, content)
      if (error) throw error
      return data as TicketCommentWithAuthor
    },
  })
}

/**
 * Hook to delete a comment
 * Note: Realtime will automatically update the comments list, so no need to invalidate queries
 */
export function useDeleteTicketComment() {
  return useMutation({
    mutationFn: async ({
      commentId,
      ticketId: _ticketId, // eslint-disable-line @typescript-eslint/no-unused-vars
    }: {
      commentId: string
      ticketId: string
    }) => {
      // ticketId is kept for API compatibility but not used since Realtime handles updates
      const { error } = await deleteComment(commentId)
      if (error) throw error
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
// export function useCanComment() {
//   const { user, isAuthenticated } = useAuth()
//   const { project } = useProjectContext()

//   const canComment = computed(() => {
//     if (!isAuthenticated.value || !user.value) {
//       return false
//     }

//     const projectData = project.value
//     if (!projectData) {
//       return false
//     }

//     // Check if project is public
//     if (projectData.visibility === PROJECT_VISIBILITIES.PUBLIC) {
//       return true
//     }

//     // Check if user is owner (owners can always comment)
//     if (projectData.owner_id === user.value.id) {
//       return true
//     }

//     // Check if user is a member with editor or commenter role
//     const projectMembers = projectData.members as Array<{
//       user_id: string
//       role: ProjectRole | null
//     }> | null

//     if (!projectMembers) {
//       return false
//     }

//     const userMember = projectMembers.find((member) => member.user_id === user.value?.id)

//     if (!userMember) {
//       return false
//     }

//     const userRole = userMember.role as ProjectRole | null

//     return userRole === PROJECT_ROLES.EDITOR || userRole === PROJECT_ROLES.COMMENTER
//   })

//   return {
//     canComment,
//   }
// }
