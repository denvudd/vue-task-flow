import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export type TicketInsert = TablesInsert<'tickets'>
export type TicketUpdate = TablesUpdate<'tickets'>

export interface TicketFilters {
  status?: string[]
  priority?: string[]
  type?: string[]
  taskName?: string
  dueDate?: string
}

export interface TicketSortRule {
  field: string
  order: 'asc' | 'desc'
}

export interface TicketSort {
  rules?: TicketSortRule[]
}

/**
 * Get paginated tickets for a project
 */
export async function getProjectTickets(
  projectId: string,
  options?: { from?: number; to?: number; filters?: TicketFilters; sort?: TicketSort },
) {
  let query = supabase
    .from('tickets')
    .select('*, creator:profiles!creator_id(*), assignee:profiles!assignee_id(*), ticket_comments(count)', {
      count: 'exact',
    })
    .eq('project_id', projectId)

  // Apply filters
  if (options?.filters) {
    const filters = options.filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }
    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority)
    }
    if (filters.type && filters.type.length > 0) {
      query = query.in('type', filters.type)
    }
    if (filters.taskName) {
      query = query.ilike('title', `%${filters.taskName}%`)
    }
    if (filters.dueDate) {
      // Filter by exact date (assuming due_date is stored as date string)
      query = query.eq('due_date', filters.dueDate)
    }
  }

  // Apply sorting
  if (options?.sort?.rules && options.sort.rules.length > 0) {
    // Apply multiple sorting rules
    options.sort.rules.forEach((rule, index) => {
      if (index === 0) {
        // First rule
        query = query.order(rule.field, { ascending: rule.order === 'asc' })
      } else {
        // Additional rules (Supabase supports chaining)
        query = query.order(rule.field, { ascending: rule.order === 'asc', nullsFirst: false })
      }
    })
  } else {
    // Default sorting by order_index
    query = query.order('order_index', { ascending: true })
  }

  if (options?.from !== undefined && options?.to !== undefined) {
    query = query.range(options.from, options.to)
  }

  return await query
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(ticketId: string) {
  return await supabase
    .from('tickets')
    .select(
      '*, creator:profiles!creator_id(*), assignee:profiles!assignee_id(*), project:projects(*), ticket_comments(count)',
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






