import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export type TicketCommentInsert = TablesInsert<'ticket_comments'>
export type TicketCommentUpdate = TablesUpdate<'ticket_comments'>

export type TicketComment = TablesInsert<'ticket_comments'> & {
  author: TablesInsert<'profiles'>
}

/**
 * Get all comments for a ticket
 */
export async function getTicketComments(ticketId: string) {
  return await supabase
    .from('ticket_comments')
    .select('*, author:profiles!author_id(*)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
}

/**
 * Get a single comment by ID
 */
export async function getComment(commentId: string) {
  return await supabase
    .from('ticket_comments')
    .select('*, author:profiles!author_id(*)')
    .eq('id', commentId)
    .single()
}

/**
 * Create a new comment
 */
export async function createComment(comment: TicketCommentInsert) {
  const { data, error } = await supabase
    .from('ticket_comments')
    .insert(comment)
    .select('*, author:profiles!author_id(*)')
    .single()
  if (error) throw error
  return data
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string) {
  return await supabase
    .from('ticket_comments')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select('*, author:profiles!author_id(*)')
    .single()
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  return await supabase.from('ticket_comments').delete().eq('id', commentId)
}

/**
 * Get comments by author
 */
export async function getCommentsByAuthor(authorId: string) {
  return await supabase
    .from('ticket_comments')
    .select('*, ticket:tickets(*)')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
}
