import { supabase } from '@/lib/supabase'
import type { TablesInsert } from '@/types/supabase'

export type TicketDocumentInsert = TablesInsert<'ticket_documents'>

export async function upsertTicketDocument(ticketDocument: TicketDocumentInsert) {
  return await supabase
    .from('ticket_documents')
    .upsert(ticketDocument, {
      onConflict: 'ticket_id',
    })
    .select()
    .single()
}
