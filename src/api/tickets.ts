import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export type TicketInsert = TablesInsert<'tickets'>
export type TicketUpdate = TablesUpdate<'tickets'>

/**
 * Get all tickets for a project
 */
export async function getProjectTickets(projectId: string) {
  return await supabase
    .from('tickets')
    .select('*, creator:profiles!creator_id(*), assignee:profiles!assignee_id(*)')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(ticketId: string) {
  return await supabase
    .from('tickets')
    .select(
      '*, creator:profiles!creator_id(*), assignee:profiles!assignee_id(*), project:projects(*)',
    )
    .eq('id', ticketId)
    .single()
}

/**
 * Get tickets assigned to a user
 */
export async function getUserAssignedTickets(userId: string) {
  return await supabase
    .from('tickets')
    .select('*, creator:profiles!creator_id(*), project:projects(*)')
    .eq('assignee_id', userId)
    .order('created_at', { ascending: false })
}

/**
 * Get tickets created by a user
 */
export async function getUserCreatedTickets(userId: string) {
  return await supabase
    .from('tickets')
    .select('*, assignee:profiles!assignee_id(*), project:projects(*)')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
}

/**
 * Create a new ticket
 */
export async function createTicket(ticket: TicketInsert) {
  return await supabase.from('tickets').insert(ticket).select().single()
}

/**
 * Update a ticket
 */
export async function updateTicket(ticketId: string, updates: TicketUpdate) {
  return await supabase
    .from('tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .select()
    .single()
}

/**
 * Delete a ticket
 */
export async function deleteTicket(ticketId: string) {
  return await supabase.from('tickets').delete().eq('id', ticketId)
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(ticketId: string, status: string) {
  return await updateTicket(ticketId, { status })
}

/**
 * Assign ticket to a user
 */
export async function assignTicket(ticketId: string, userId: string | null) {
  return await updateTicket(ticketId, { assignee_id: userId })
}

/**
 * Update ticket order
 */
export async function reorderTickets(ticketUpdates: Array<{ id: string; order_index: number }>) {
  const promises = ticketUpdates.map(({ id, order_index }) =>
    supabase.from('tickets').update({ order_index }).eq('id', id),
  )

  return await Promise.all(promises)
}



