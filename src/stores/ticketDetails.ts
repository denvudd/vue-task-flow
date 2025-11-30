import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Store for managing ticket details sidebar state
 * Contains only the minimal state needed for coordination
 * Actual data fetching is handled in useTicketDetails composable
 */
export const useTicketDetailsStore = defineStore('ticketDetails', () => {
  const currentTicketId = ref<string | undefined>(undefined)
  const currentProjectId = ref<string | undefined>(undefined)

  function openTicket(ticketId: string, projectId: string) {
    currentTicketId.value = ticketId
    currentProjectId.value = projectId
  }

  function closeTicket() {
    currentTicketId.value = undefined
    currentProjectId.value = undefined
  }

  return {
    // State
    currentTicketId,
    currentProjectId,

    // Methods
    openTicket,
    closeTicket,
  }
})
