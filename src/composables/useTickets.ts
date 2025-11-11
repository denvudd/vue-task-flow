import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import {
  getProjectTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  type TicketInsert,
  type TicketUpdate,
} from '@/api/tickets'

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
 * Hook to fetch tickets for a project
 */
export function useProjectTickets(projectId: MaybeRef<string | undefined>) {
  return useQuery({
    queryKey: ['tickets', 'project', projectId],
    queryFn: async () => {
      const id = unref(projectId)
      if (!id) throw new Error('Project ID is required')

      const { data, error } = await getProjectTickets(id)
      if (error) throw error
      return data || []
    },
    enabled: () => !!unref(projectId),
  })
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
 */
export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ticket: TicketInsert) => {
      const { data, error } = await createTicket(ticket)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidate tickets list for the project
      if (data?.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'project', data.project_id] })
      }
    },
  })
}

/**
 * Hook to update a ticket
 */
export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: TicketUpdate }) => {
      const { data, error } = await updateTicket(ticketId, updates)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidate specific ticket and project tickets list
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'detail', data.id] })
      }
      if (data?.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tickets', 'project', data.project_id] })
      }
    },
  })
}

/**
 * Hook to delete a ticket
 */
export function useDeleteTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ticketId, projectId }: { ticketId: string; projectId: string }) => {
      const { error } = await deleteTicket(ticketId)
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      // Invalidate tickets list for the project
      queryClient.invalidateQueries({ queryKey: ['tickets', 'project', variables.projectId] })
    },
  })
}

