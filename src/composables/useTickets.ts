import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref, ref, onUnmounted, watch, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import {
  getProjectTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  type TicketInsert,
  type TicketUpdate,
} from '@/api/tickets'
import type { Tables } from '@/types/supabase'
import { useAuth } from '@/composables/useAuth'

/**
 * Interface for connected user presence
 */
export interface ConnectedUser {
  userId: string
  email: string
  profile: {
    id: string
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

/**
 * Query keys for tickets
 */
export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (projectId: string) => [...ticketKeys.lists(), projectId] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (ticketId: string) => [...ticketKeys.details(), ticketId] as const,
}

/**
 * Hook to fetch tickets for a project using Supabase Realtime with pagination support
 */
export function useProjectTickets(
  projectId: MaybeRef<string | undefined>,
  options?: { pageSize?: number },
) {
  const pageSize = options?.pageSize ?? 50

  const tickets = ref<Tables<'tickets'>[]>([])
  const isLoading = ref(true)
  const isLoadingMore = ref(false)
  const error = ref<Error | null>(null)
  const totalCount = ref<number | null>(null)
  const loadedCount = ref(0)
  const hasMore = computed(() => {
    if (totalCount.value === null) return true
    return loadedCount.value < totalCount.value
  })

  let channel: ReturnType<typeof supabase.channel> | null = null

  const loadInitialTickets = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      loadedCount.value = 0

      const { data, error: fetchError, count } = await getProjectTickets(id, {
        from: 0,
        to: pageSize - 1,
      })
      if (fetchError) throw fetchError
      tickets.value = data || []
      totalCount.value = count ?? null
      loadedCount.value = data?.length ?? 0
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load tickets')
      console.error('Error loading tickets:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadMore = async () => {
    const id = unref(projectId)
    if (!id || isLoadingMore.value || !hasMore.value) return

    try {
      isLoadingMore.value = true
      const from = loadedCount.value
      const to = from + pageSize - 1

      const { data, error: fetchError } = await getProjectTickets(id, { from, to })
      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        // Merge new tickets while maintaining order
        const existingIds = new Set(tickets.value.map((t) => t.id))
        const newTickets = data.filter((t) => !existingIds.has(t.id))
        tickets.value = [...tickets.value, ...newTickets].sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
        )
        loadedCount.value += newTickets.length
      } else {
        // No more tickets
        totalCount.value = loadedCount.value
      }
    } catch (err) {
      console.error('Error loading more tickets:', err)
      error.value = err instanceof Error ? err : new Error('Failed to load more tickets')
    } finally {
      isLoadingMore.value = false
    }
  }

  const setupRealtimeSubscription = (id: string) => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }

    channel = supabase
      .channel(`tickets:project:${id}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
          filter: `project_id=eq.${id}`,
        },
        async (payload) => {
          const newTicket = payload.new as Tables<'tickets'>
          const ticketId = newTicket?.id

          console.log(`[Realtime] Received INSERT event for ticket:`, ticketId)

          // Check if ticket already exists
          const existingIndex = tickets.value.findIndex((t) => t.id === ticketId)
          if (existingIndex !== -1) {
            console.log(`[Realtime] Ticket ${ticketId} already exists, skipping`)
            return
          }

          try {
            // Try to fetch full ticket data with relations
            // Fetch a small range to get the ticket with relations
            const { data: fullTicket } = await getProjectTickets(id, {
              from: 0,
              to: 0,
            })
            // If pagination doesn't work, try to get single ticket
            // For now, just add the ticket with basic data
            const ticketToAdd = newTicket
            tickets.value = [...tickets.value, ticketToAdd].sort(
              (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
            )
            loadedCount.value += 1
            if (totalCount.value !== null) {
              totalCount.value += 1
            }
            console.log(`[Realtime] Added new ticket ${newTicket.id} to list`)
          } catch (err) {
            console.error('[Realtime] Error fetching full ticket data:', err)
            // Fallback: add ticket without relations
            tickets.value = [...tickets.value, newTicket].sort(
              (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
            )
            loadedCount.value += 1
            if (totalCount.value !== null) {
              totalCount.value += 1
            }
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `project_id=eq.${id}`,
        },
        async (payload) => {
          const updatedTicket = payload.new as Tables<'tickets'>
          const ticketId = updatedTicket?.id

          console.log(`[Realtime] Received UPDATE event for ticket:`, ticketId)

          const index = tickets.value.findIndex((t) => t.id === updatedTicket.id)
          if (index !== -1 && tickets.value[index]) {
            const existingTicket = tickets.value[index]
            const ticketWithRelations = {
              ...existingTicket,
              ...updatedTicket,
            }
            tickets.value[index] = ticketWithRelations
            tickets.value = [...tickets.value].sort(
              (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
            )
            console.log(`[Realtime] Updated ticket ${updatedTicket.id} in list`)
          } else {
            // Ticket not in current loaded list, but might be in unloaded pages
            // Don't reload everything, just log it
            console.log(
              `[Realtime] Ticket ${updatedTicket.id} not found in loaded list (might be in unloaded pages)`,
            )
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tickets',
        },
        async (payload) => {
          const deletedTicket = payload.old as Tables<'tickets'>
          const ticketId = deletedTicket?.id

          console.log(`[Realtime] Received DELETE event for ticket:`, ticketId)

          const ticketExists = tickets.value.some((t) => t.id === ticketId)

          if (ticketExists) {
            tickets.value = tickets.value.filter((t) => t.id !== ticketId)
          } else {
            console.log(
              `[Realtime] Ignoring DELETE event for ticket ${ticketId} (not in current project list)`,
            )
          }
        },
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Successfully subscribed to tickets for project ${id}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error:', err)
          error.value = new Error('Failed to subscribe to ticket updates')
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Subscription timed out')
          error.value = new Error('Realtime subscription timed out')
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Channel closed')
        }
      })
  }

  const currentProjectId = computed(() => unref(projectId))

  watch(
    currentProjectId,
    async (newId) => {
      if (!newId) {
        tickets.value = []
        isLoading.value = false
        if (channel) {
          supabase.removeChannel(channel)
          channel = null
        }
        return
      }

      await loadInitialTickets(newId)

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
    data: computed(() => tickets.value),
    isLoading: computed(() => isLoading.value),
    isLoadingMore: computed(() => isLoadingMore.value),
    error: computed(() => error.value),
    hasMore: computed(() => hasMore.value),
    totalCount: computed(() => totalCount.value),
    loadMore,
    refetch: async () => {
      const id = unref(projectId)
      if (id) {
        await loadInitialTickets(id)
      }
    },
  }
}

/**
 * Hook to fetch a single ticket
 */
export function useTicket(ticketId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ['tickets', 'detail', ticketId],
    queryFn: async () => {
      const id = unref(ticketId)
      if (!id) throw new Error('Ticket ID is required')

      const { data, error } = await getTicket(id)
      if (error) throw error
      return data
    },
    enabled: () => !!unref(ticketId),
  })
}

/**
 * Hook to create a new ticket
 * Note: Realtime will automatically update the tickets list, so no need to invalidate queries
 */
export function useCreateTicket() {
  return useMutation({
    mutationFn: async (ticket: TicketInsert) => {
      const { data, error } = await createTicket(ticket)
      if (error) throw error
      return data
    },
  })
}

/**
 * Hook to update a ticket
 * Note: Realtime will automatically update the tickets list, so no need to invalidate queries
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: TicketUpdate }) => {
      const { data, error } = await updateTicket(ticketId, updates)
      if (error) throw error
      return data
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) })
    },
  })
}

/**
 * Hook to delete a ticket
 * Note: Realtime will automatically update the tickets list, so no need to invalidate queries
 */
export function useDeleteTicket() {
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await deleteTicket(ticketId)
      if (error) throw error
    },
  })
}

/**
 * Hook to track connected users to a ticket using Supabase Realtime Presence
 */
export function useTicketPresence(ticketId: MaybeRef<string | undefined>) {
  const connectedUsers = ref<ConnectedUser[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  let channel: ReturnType<typeof supabase.channel> | null = null

  const { user, profile } = useAuth()

  const currentTicketId = computed(() => unref(ticketId))

  const setupPresence = async (id: string) => {
    if (!user.value || !profile.value) {
      console.warn('[Presence] User not authenticated, skipping presence setup')
      return
    }

    if (channel) {
      await channel.unsubscribe()
      supabase.removeChannel(channel)
      channel = null
    }

    isLoading.value = true
    error.value = null

    channel = supabase.channel(`ticket:${id}:presence`, {
      config: {
        presence: {
          key: user.value.id,
        },
      },
    })

    const presenceState = {
      user: {
        id: user.value.id,
        email: user.value.email,
        profile: {
          id: profile.value.id,
          full_name: profile.value.full_name,
          username: profile.value.username,
          avatar_url: profile.value.avatar_url,
        },
      },
    }

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel?.presenceState()
      if (!state) return

      const users: ConnectedUser[] = []
      Object.keys(state).forEach((userId) => {
        const presence = state[userId] as Array<{
          user?: { id: string; email: string; profile: ConnectedUser['profile'] }
        }>

        if (presence && presence.length > 0) {
          const userPresence = presence[0]
          if (userPresence?.user?.profile) {
            users.push({
              userId,
              email: userPresence.user.email,
              profile: userPresence.user.profile,
            })
          }
        }
      })

      connectedUsers.value = users
      isLoading.value = false
    })

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log(`[Presence] User ${key} joined ticket ${id}`)
      newPresences.forEach((presence) => {
        if (presence?.user?.profile) {
          const newUser: ConnectedUser = {
            userId: key,
            email: presence.user.email,
            profile: presence.user.profile,
          }

          if (!connectedUsers.value.find((u) => u.userId === newUser.userId)) {
            connectedUsers.value.push(newUser)
          }
        }
      })
    })

    channel.on('presence', { event: 'leave' }, ({ key }) => {
      console.log(`[Presence] User ${key} left ticket ${id}`)
      connectedUsers.value = connectedUsers.value.filter((u) => u.userId !== key)
    })

    // Subscribe to channel first, then track presence
    channel.subscribe(async (status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Presence] Successfully subscribed to ticket ${id} presence`)
        // Track presence only after successful subscription
        await channel?.track(presenceState)
        isLoading.value = false
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Presence] Channel error:', err)
        error.value = new Error('Failed to subscribe to ticket presence')
        isLoading.value = false
      } else if (status === 'TIMED_OUT') {
        console.error('[Presence] Subscription timed out')
        error.value = new Error('Presence subscription timed out')
        isLoading.value = false
      } else if (status === 'CLOSED') {
        console.log('[Presence] Channel closed')
      }
    })
  }

  watch(
    currentTicketId,
    async (newId) => {
      if (!newId) {
        connectedUsers.value = []
        isLoading.value = false
        if (channel) {
          await channel.unsubscribe()
          await channel.untrack()
          supabase.removeChannel(channel)
          channel = null
        }
        return
      }

      await setupPresence(newId)
    },
    { immediate: true },
  )

  onUnmounted(async () => {
    if (channel) {
      await channel.unsubscribe()
      await channel.untrack()
      supabase.removeChannel(channel)
      channel = null
    }
  })

  return {
    connectedUsers: computed(() => connectedUsers.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
  }
}
