import { supabase } from '@/lib/supabase'
import type { TablesInsert, TablesUpdate } from '@/types/supabase'

export type CommentInsert = TablesInsert<'comments'>
export type CommentUpdate = TablesUpdate<'comments'>

/**
 * Get all comments for a ticket
 */
export async function getTicketComments(ticketId: string) {
  return await supabase
    .from('comments')
    .select('*, author:profiles!author_id(*)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
}

/**
 * Get a single comment by ID
 */
export async function getComment(commentId: string) {
  return await supabase
    .from('comments')
    .select('*, author:profiles!author_id(*)')
    .eq('id', commentId)
    .single()
}

/**
 * Create a new comment
 */
export async function createComment(comment: CommentInsert) {
  return await supabase.from('comments').insert(comment).select().single()
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string) {
  return await supabase
    .from('comments')
    .update({
      content,
      edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select()
    .single()
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  return await supabase.from('comments').delete().eq('id', commentId)
}

/**
 * Get comments by author
 */
export async function getCommentsByAuthor(authorId: string) {
  return await supabase
    .from('comments')
    .select('*, ticket:tickets(*)')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
}





