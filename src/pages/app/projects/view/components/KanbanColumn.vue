<script setup lang="ts">
import { computed, ref } from 'vue'
import { Card } from '@/components/ui'
import KanbanCard from './KanbanCard.vue'

interface Ticket {
  id: string
  title: string
  description?: string | null
  status?: string | null
  priority?: string | null
  type?: string | null
  assignee?: {
    id: string
    full_name?: string | null
    username?: string | null
    email?: string | null
  } | null
  due_date?: string | null
  order_index?: number | null
}

interface Props {
  status: string
  tickets: Ticket[]
  statusLabel: string
  statusColor: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'ticket-move': [data: { ticketId: string; newStatus: string; newOrderIndex: number }]
  'ticket-reorder': [data: { ticketId: string; newOrderIndex: number }]
}>()

const sortedTickets = computed(() => {
  return [...props.tickets].sort((a, b) => {
    const aOrder = a.order_index ?? 0
    const bOrder = b.order_index ?? 0
    return aOrder - bOrder
  })
})

const isDraggingOver = ref(false)

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isDraggingOver.value = true
}

const handleDragLeave = () => {
  isDraggingOver.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDraggingOver.value = false

  const ticketId = event.dataTransfer?.getData('text/plain')
  if (!ticketId) {
    console.warn('No ticket ID in drag data')
    return
  }

  // Check if ticket is already in this column
  const existingTicket = sortedTickets.value.find((t) => t.id === ticketId)
  if (existingTicket) {
    // Ticket is already in this column, just reorder
    const currentIndex = sortedTickets.value.findIndex((t) => t.id === ticketId)
    emit('ticket-reorder', {
      ticketId,
      newOrderIndex: sortedTickets.value.length - 1,
    })
    return
  }

  // If dropped on empty column, add at the end
  const newOrderIndex = sortedTickets.value.length

  emit('ticket-move', {
    ticketId,
    newStatus: props.status,
    newOrderIndex,
  })
}

const handleCardDrop = (event: DragEvent, targetTicketId: string) => {
  event.preventDefault()
  event.stopPropagation()

  const draggedTicketId = event.dataTransfer?.getData('text/plain')
  if (!draggedTicketId || draggedTicketId === targetTicketId) return

  // Check if dragged ticket is already in this column
  const draggedTicket = sortedTickets.value.find((t) => t.id === draggedTicketId)
  const targetIndex = sortedTickets.value.findIndex((t) => t.id === targetTicketId)

  if (targetIndex < 0) return

  if (draggedTicket) {
    // Ticket is in the same column, just reorder
    emit('ticket-reorder', {
      ticketId: draggedTicketId,
      newOrderIndex: targetIndex,
    })
  } else {
    // Ticket is from another column, move it to this column at target position
    emit('ticket-move', {
      ticketId: draggedTicketId,
      newStatus: props.status,
      newOrderIndex: targetIndex,
    })
  }
}

const handleCardDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}
</script>

<template>
  <div class="flex-1 min-w-0 flex flex-col">
    <Card class="p-0!">
      <div class="p-3 border-b border-neutral-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div :class="['w-3 h-3 rounded-full', statusColor]"></div>
            <h3 class="font-semibold text-neutral-900">{{ statusLabel }}</h3>
            <span class="text-sm text-neutral-500">({{ tickets.length }})</span>
          </div>
        </div>
      </div>
      <div
        :class="[
          'flex-1 p-2 space-y-3 min-h-[400px] transition-colors',
          isDraggingOver ? 'bg-primary-50' : 'bg-neutral-50',
        ]"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div v-if="sortedTickets.length === 0" class="text-center py-8">
          <p class="text-sm text-neutral-400">No tickets</p>
        </div>
        <div
          v-for="(ticket, index) in sortedTickets"
          :key="ticket.id"
          @dragover="handleCardDragOver"
          @drop="(e) => handleCardDrop(e, ticket.id)"
        >
          <KanbanCard :ticket="ticket" />
        </div>
      </div>
    </Card>
  </div>
</template>
