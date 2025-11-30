import { upsertTicketDocument, type TicketDocumentInsert } from '@/api/ticket-documents'
import { useMutation } from '@tanstack/vue-query'

export function useUpsertTicketDocument() {
  return useMutation({
    mutationFn: async (ticketDocument: TicketDocumentInsert) => {
      const { data, error } = await upsertTicketDocument(ticketDocument)
      if (error) throw error
      return data
    },
  })
}
