import { onBeforeUnmount, ref } from 'vue'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'

const HOCUSPOCUS_SERVER_URL = 'wss://hocuspocus-supabase-server.onrender.com/'

export function useCollaboration(ticketId: string) {
  const ydoc = new Y.Doc()
  const isSynced = ref(false)

  const provider = new HocuspocusProvider({
    url: HOCUSPOCUS_SERVER_URL,
    name: ticketId, // documentName для сервера (відповідає ticket_id в БД)
    document: ydoc,
    onConnect: () => {
      console.log(`[Collaboration] Connected to document: ${ticketId}`)
    },
    onSynced: () => {
      console.log(`[Collaboration] Document synced: ${ticketId}`)
      isSynced.value = true
    },
    onDisconnect: () => {
      console.log(`[Collaboration] Disconnected from document: ${ticketId}`)
      isSynced.value = false
    },
    onStatus: ({ status }) => {
      console.log(`[Collaboration] Status changed for ${ticketId}:`, status)
    },
    onDestroy: () => {
      console.log(`[Collaboration] Provider destroyed for ${ticketId}`)
    },
  })

  onBeforeUnmount(() => {
    provider.destroy()
    ydoc.destroy()
  })

  return {
    ydoc,
    provider,
    isSynced,
  }
}
