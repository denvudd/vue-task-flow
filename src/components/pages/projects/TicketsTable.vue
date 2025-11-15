<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DnDOperations, useDroppable } from '@vue-dnd-kit/core'
import { Table, TableHeader, TableRow, TableHeadCell } from '@/components/ui'
import TicketDetailsDialog from '@/components/pages/projects/TicketDetailsDialog.vue'
import TicketRow from '@/components/pages/projects/TicketRow.vue'
import { useDeleteTicket } from '@/composables/useTickets'
import type { Tables } from '@/types/supabase'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'

interface Props {
  tickets: Tables<'tickets'>[] | null | undefined
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:title', payload: { ticket: Tables<'tickets'>; value: string }): void
  (e: 'update:status', payload: { ticket: Tables<'tickets'>; value: TicketStatus | null }): void
  (e: 'update:priority', payload: { ticket: Tables<'tickets'>; value: TicketPriority | null }): void
  (e: 'update:type', payload: { ticket: Tables<'tickets'>; value: TicketType | null }): void
  (e: 'reorder', payload: { tickets: Tables<'tickets'>[] }): void
}>()

const { mutate: deleteTicket } = useDeleteTicket()

const handleDelete = (payload: { ticket: Tables<'tickets'> }) => {
  deleteTicket(payload.ticket.id)
}

const hasTickets = computed(() => (props.tickets?.length ?? 0) > 0)

// Local copy of tickets for drag & drop operations
const localTickets = ref<Tables<'tickets'>[]>([])

// Sync local tickets with props
watch(
  () => props.tickets,
  (newTickets) => {
    if (newTickets) {
      localTickets.value = [...newTickets]
    } else {
      localTickets.value = []
    }
  },
  { immediate: true, deep: true },
)

// Droppable area for table body - elementRef will be set via template ref
const { elementRef: tableBodyRef } = useDroppable({
  groups: ['tickets-table-body'],
  data: computed(() => ({
    source: localTickets,
  })),
  events: {
    onDrop: (store) => {
      if (store.hovered.element.value) {
        // Apply the transfer which reorders the array
        DnDOperations.applyTransfer(store)

        // Update order_index for all tickets based on new order after transfer
        const updatedTickets = localTickets.value.map((ticket, index) => ({
          ...ticket,
          order_index: index,
        }))

        // Update local tickets with new order_index values
        localTickets.value = updatedTickets

        // Emit the reorder event to parent
        emit('reorder', { tickets: updatedTickets })
      }
    },
  },
})
</script>

<template>
  <div>
    <TicketDetailsDialog />

    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="text-neutral-600">Loading tickets...</div>
    </div>

    <div v-if="!isLoading && !hasTickets" class="py-16 text-center">
      <p class="text-neutral-600">No tickets yet. Create your first ticket!</p>
    </div>

    <Table v-show="!isLoading && hasTickets" density="comfortable">
      <TableHeader>
        <TableRow :hover="false">
          <TableHeadCell></TableHeadCell>
          <TableHeadCell>Title</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>Priority</TableHeadCell>
          <TableHeadCell>Type</TableHeadCell>
          <TableHeadCell>Due Date</TableHeadCell>
        </TableRow>
      </TableHeader>

      <tbody ref="tableBodyRef" class="divide-y divide-neutral-100">
        <TransitionGroup>
          <TicketRow
            v-for="(ticket, index) in localTickets"
            :key="ticket.id"
            :ticket="ticket"
            :row-index="index"
            :tickets="localTickets"
            @update:title="(payload) => emit('update:title', payload)"
            @update:status="(payload) => emit('update:status', payload)"
            @update:priority="(payload) => emit('update:priority', payload)"
            @update:type="(payload) => emit('update:type', payload)"
            @delete="handleDelete"
          />
        </TransitionGroup>
      </tbody>
    </Table>
  </div>
</template>
