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
 * Hook to fetch tickets for a project using Supabase Realtime
 */
export function useProjectTickets(projectId: MaybeRef<string | undefined>) {
  const tickets = ref<Tables<'tickets'>[]>([])
  const isLoading = ref(true)
  const error = ref<Error | null>(null)
  let channel: ReturnType<typeof supabase.channel> | null = null

  const loadInitialTickets = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      const { data, error: fetchError } = await getProjectTickets(id)
      if (fetchError) throw fetchError
      tickets.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to load tickets')
      console.error('Error loading tickets:', err)
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

          try {
            const { data: fullTicket } = await getProjectTickets(id)
            if (fullTicket) {
              const insertedTicket = fullTicket.find((t) => t.id === newTicket.id)
              if (insertedTicket) {
                tickets.value = [...tickets.value, insertedTicket].sort(
                  (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
                )
                console.log(`[Realtime] Added new ticket ${newTicket.id} to list`)
              } else {
                tickets.value = [...tickets.value, newTicket].sort(
                  (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
                )
                console.log(`[Realtime] Added new ticket ${newTicket.id} (without relations)`)
              }
            }
          } catch (err) {
            console.error('[Realtime] Error fetching full ticket data:', err)
            tickets.value = [...tickets.value, newTicket].sort(
              (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
            )
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
            console.log(`[Realtime] Ticket ${updatedTicket.id} not found in list, reloading...`)
            await loadInitialTickets(id)
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
    error: computed(() => error.value),
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
