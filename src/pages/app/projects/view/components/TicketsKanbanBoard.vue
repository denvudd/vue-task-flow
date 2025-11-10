<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui'
import { reorderTickets, updateTicketStatus } from '@/api/tickets'
import { useProjectTickets } from '@/composables/useTickets'
import { Plus } from 'lucide-vue-next'
import KanbanColumn from './KanbanColumn.vue'

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
  creator?: {
    id: string
    full_name?: string | null
    username?: string | null
  } | null
  due_date?: string | null
  created_at?: string | null
  order_index?: number | null
}

interface Props {
  tickets: Ticket[]
  projectId: string
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  create: []
  'ticket-updated': []
}>()

const projectId = computed(() => props.projectId)
const { refetch: refetchTickets } = useProjectTickets(projectId)

const statusConfig = [
  { value: 'todo', label: 'Todo', color: 'bg-info-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-warning-500' },
  { value: 'review', label: 'Review', color: 'bg-primary-500' },
  { value: 'done', label: 'Done', color: 'bg-success-500' },
  { value: 'archived', label: 'Archived', color: 'bg-error-500' },
] as const

const ticketsByStatus = computed(() => {
  const grouped: Record<string, Ticket[]> = {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
    archived: [],
  }

  props.tickets?.forEach((ticket) => {
    const status = ticket.status || 'todo'
    if (grouped[status]) {
      grouped[status].push(ticket)
    } else {
      grouped.todo?.push(ticket)
    }
  })

  return grouped
})

const handleTicketMove = async (data: {
  ticketId: string
  newStatus: string
  newOrderIndex: number
}) => {
  try {
    console.log('Moving ticket:', data)
    const currentTicket = props.tickets?.find((t) => t.id === data.ticketId)
    if (!currentTicket) {
      console.warn('Ticket not found:', data.ticketId)
      return
    }

    const oldStatus = currentTicket.status || 'todo'
    const newStatus = data.newStatus

    console.log('Status change:', {
      oldStatus,
      newStatus,
    })

    // If status changed, update status first
    if (oldStatus !== newStatus) {
      const { error } = await updateTicketStatus(data.ticketId, newStatus)
      if (error) {
        console.error('Failed to update ticket status:', error)
        throw error
      }
      console.log('Ticket status updated successfully')
    }

    // Get all tickets for the new status (excluding the moved ticket)
    const targetStatusTickets = (ticketsByStatus.value[newStatus] || []).filter(
      (t) => t.id !== data.ticketId,
    )

    // Create a copy of current ticket with updated status
    const updatedTicket = { ...currentTicket, status: newStatus }

    // Insert the moved ticket at the new position
    targetStatusTickets.splice(data.newOrderIndex, 0, updatedTicket as any)

    // Recalculate order indices for all tickets in the new status
    const updates: Array<{ id: string; order_index: number }> = []
    targetStatusTickets.forEach((ticket, index) => {
      updates.push({ id: ticket.id, order_index: index })
    })

    // If ticket moved from another status, update order in old status too
    if (oldStatus !== newStatus) {
      const oldStatusTickets = (ticketsByStatus.value[oldStatus] || []).filter(
        (t) => t.id !== data.ticketId,
      )
      oldStatusTickets.forEach((ticket, index) => {
        updates.push({ id: ticket.id, order_index: index })
      })
    }

    if (updates.length > 0) {
      console.log('Updating order indices:', updates)
      const results = await reorderTickets(updates)
      const errors = results.filter((r) => r.error)
      if (errors.length > 0 && errors[0]?.error) {
        console.error('Failed to reorder tickets:', errors)
        throw errors[0].error
      }
    }

    // Refetch tickets to update the UI
    console.log('Refetching tickets...')
    await refetchTickets()
    console.log('Tickets refetched successfully')

    // Emit event to parent component
    emit('ticket-updated')
  } catch (error) {
    console.error('Failed to move ticket:', error)
  }
}

const handleTicketReorder = async (data: { ticketId: string; newOrderIndex: number }) => {
  try {
    const currentTicket = props.tickets?.find((t) => t.id === data.ticketId)
    if (!currentTicket || !currentTicket.status) return

    const status = currentTicket.status
    const statusTickets = [...(ticketsByStatus.value[status] || [])]

    // Find the ticket being moved
    const ticketIndex = statusTickets.findIndex((t) => t.id === data.ticketId)
    if (ticketIndex < 0) return

    // Remove the ticket from its current position
    const [movedTicket] = statusTickets.splice(ticketIndex, 1)
    if (!movedTicket) return

    // Insert it at the new position
    statusTickets.splice(data.newOrderIndex, 0, movedTicket)

    // Update order indices for all tickets
    const updates: Array<{ id: string; order_index: number }> = []
    statusTickets.forEach((ticket, index) => {
      updates.push({ id: ticket.id, order_index: index })
    })

    if (updates.length > 0) {
      await reorderTickets(updates)
    }

    // Refetch tickets to update the UI
    await refetchTickets()

    // Emit event to parent component
    emit('ticket-updated')
  } catch (error) {
    console.error('Failed to reorder ticket:', error)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-neutral-900">Tickets</h3>
      <Button size="sm" @click="emit('create')">
        <Plus class="w-4 h-4 mr-2" />
        Create Ticket
      </Button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center py-16 px-4">
      <div class="text-neutral-600">Loading tickets...</div>
    </div>

    <div v-else-if="!tickets || tickets.length === 0" class="text-center py-16 px-4">
      <p class="text-neutral-600 mb-2 font-medium">No tickets yet</p>
      <p class="text-neutral-500 text-sm">Create your first ticket to get started</p>
    </div>

    <div v-else class="flex gap-4 overflow-x-auto pb-4">
      <KanbanColumn
        v-for="status in statusConfig"
        :key="status.value"
        :status="status.value"
        :tickets="ticketsByStatus[status.value] || []"
        :status-label="status.label"
        :status-color="status.color"
        @ticket-move="handleTicketMove"
        @ticket-reorder="handleTicketReorder"
      />
    </div>
  </div>
</template>
