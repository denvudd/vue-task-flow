<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Tables } from '@/types/supabase'
import { TICKET_STATUS_OPTIONS } from '@/constants/tickets'
import BoardColumn from './BoardColumn.vue'
import QuickCreateTicketButton from './QuickCreateTicketButton.vue'
import { useDeleteTicket, useUpdateTicket } from '@/composables/useTickets'
import { useProjectContext } from '@/composables/useProjectContext'
import { useAuth } from '@/composables/useAuth'
import { Loader } from 'lucide-vue-next'
import { reorderTickets } from '@/api/tickets'

interface Props {
  tickets: Tables<'tickets'>[] | null | undefined
  isLoading: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  loadMore?: () => Promise<void>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'reorder', payload: { tickets: Tables<'tickets'>[] }): void
}>()

const { isAuthenticated } = useAuth()
const { isSidebarOpen, cleanupSelection } = useProjectContext()
const { mutate: deleteTicket } = useDeleteTicket()
const { mutateAsync: updateTicket } = useUpdateTicket()
const { t } = useI18n()

const localTickets = ref<Tables<'tickets'>[]>([])

watch(
  () => props.tickets,
  (newTickets) => {
    if (newTickets) {
      localTickets.value = [...newTickets]
      const ticketIds = newTickets.map((ticket) => ticket.id)
      cleanupSelection(ticketIds)
    } else {
      localTickets.value = []
    }
  },
  { immediate: true, deep: true },
)

// Group tickets by status
const ticketsByStatus = computed(() => {
  const grouped = TICKET_STATUS_OPTIONS.reduce(
    (acc, status) => {
      acc[status.value] = []
      return acc
    },
    {} as Record<string, Tables<'tickets'>[]>,
  )

  localTickets.value.forEach((ticket) => {
    const status = ticket.status || 'todo'
    if (grouped[status]) {
      grouped[status].push(ticket)
    }
  })

  // Sort tickets within each status by order_index
  Object.keys(grouped).forEach((status) => {
    const tickets = grouped[status]
    if (tickets) {
      tickets.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    }
  })

  return grouped
})

const hasTickets = computed(() => (props.tickets?.length ?? 0) > 0)

const handleDelete = (payload: { ticket: Tables<'tickets'> }) => {
  deleteTicket(payload.ticket.id)
}

const handleTicketDrop = async (payload: {
  ticket: Tables<'tickets'>
  newStatus: string
  newIndex: number
}) => {
  const { ticket, newStatus, newIndex } = payload

  console.log('[TicketsBoard] handleTicketDrop called', {
    ticketId: ticket.id,
    ticketTitle: ticket.title,
    currentStatus: ticket.status,
    newStatus,
    newIndex,
  })

  try {
    // Get all tickets in the target status column
    const ticketsInColumn = [...(ticketsByStatus.value[newStatus] || [])]

    console.log('[TicketsBoard] Tickets in column before drop:', ticketsInColumn.length)

    // If changing status, add ticket to new column
    if (ticket.status !== newStatus) {
      console.log('[TicketsBoard] Status change detected:', ticket.status, '->', newStatus)

      // Update ticket status first
      await updateTicket({
        ticketId: ticket.id,
        updates: { status: newStatus },
      })

      // Wait a bit for realtime to update
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Re-fetch tickets in column after status change
      const updatedTicketsInColumn = [...(ticketsByStatus.value[newStatus] || [])]

      // Reorder all tickets in the column
      const ticketUpdates = updatedTicketsInColumn.map((t, index) => ({
        id: t.id,
        order_index: index,
      }))

      console.log('[TicketsBoard] Reordering all tickets in column:', ticketUpdates)
      await reorderTickets(ticketUpdates)
    } else {
      // Same column - reorder based on new position
      // Create new array with ticket at new position
      const movedTicket = ticketsInColumn.find((t) => t.id === ticket.id)
      const otherTickets = ticketsInColumn.filter((t) => t.id !== ticket.id)

      if (movedTicket) {
        // Insert at new index
        otherTickets.splice(newIndex, 0, movedTicket)

        // Update order_index for all tickets
        const ticketUpdates = otherTickets.map((t, index) => ({
          id: t.id,
          order_index: index,
        }))

        console.log('[TicketsBoard] Reordering tickets in same column:', ticketUpdates)
        await reorderTickets(ticketUpdates)
      }
    }

    console.log('[TicketsBoard] Reorder completed successfully')
  } catch (err) {
    console.error('[TicketsBoard] Error updating ticket:', err)
  }
}
</script>

<template>
  <div data-tickets-board class="h-full">
    <div
      class="z-1 grow shrink-0 h-full"
      :style="{
        insetInlineStart: isSidebarOpen ? '0px' : 'auto',
        position: isSidebarOpen ? 'sticky' : 'relative',
        width: isSidebarOpen ? 'calc(100vw - 96px)' : '100%',
      }"
    >
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="text-neutral-600">{{ t('ticketsBoard.loading') }}</div>
      </div>

      <div v-if="!isLoading && !hasTickets" class="py-16 text-center">
        <p class="text-neutral-600">{{ t('ticketsBoard.noTickets') }}</p>
      </div>

      <div
        v-show="!isLoading && hasTickets"
        class="flex gap-2 px-4 sm:px-8 lg:px-24 pb-4 overflow-x-auto overflow-y-hidden"
        :class="{ 'pe-4': isSidebarOpen }"
        :style="{
          height: 'calc(100vh - 280px)',
        }"
      >
        <BoardColumn
          v-for="status in TICKET_STATUS_OPTIONS"
          :key="status.value"
          :status="status"
          :tickets="ticketsByStatus[status.value] || []"
          :all-tickets="localTickets"
          :is-loading="isLoading"
          @ticket-drop="handleTicketDrop"
          @delete="handleDelete"
        />
      </div>

      <div
        v-if="!isLoading && hasTickets && isLoadingMore"
        class="flex justify-center items-center py-8"
      >
        <div class="text-neutral-600 flex items-center gap-2">
          <Loader class="size-4 animate-spin" />
          <span>{{ t('ticketsBoard.loadingMore') }}</span>
        </div>
      </div>

      <QuickCreateTicketButton v-if="!isLoading && hasTickets" :tickets="localTickets" />
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for board */
[data-tickets-board] {
  scrollbar-width: thin;
  scrollbar-color: #d4d4d8 #f5f5f5;
}

[data-tickets-board]::-webkit-scrollbar {
  height: 8px;
}

[data-tickets-board]::-webkit-scrollbar-track {
  background: #f5f5f5;
}

[data-tickets-board]::-webkit-scrollbar-thumb {
  background-color: #d4d4d8;
  border-radius: 4px;
}

[data-tickets-board]::-webkit-scrollbar-thumb:hover {
  background-color: #a1a1aa;
}
</style>
