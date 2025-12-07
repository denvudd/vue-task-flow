<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDraggable } from '@vue-dnd-kit/core'
import {
  Button,
  Editable,
  TicketStatusSelect,
  TicketPrioritySelect,
  TicketTypeSelect,
  TableCell,
} from '@/components/ui'
import type { Tables } from '@/types/supabase'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'
import { Calendar, PanelsTopLeft } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useUpdateTicket } from '@/composables/useTickets'
import TicketRowSelectableMenu from './TicketRowSelectableMenu.vue'
import { useProjectContext } from '@/composables/useProjectContext'

const route = useRoute()
const router = useRouter()

const { isAuthenticated } = useAuth()
const { createToast } = useToast()
const { selectedTicketIds } = useProjectContext()
const { mutateAsync: updateTicket } = useUpdateTicket()

interface Props {
  ticket: Tables<'tickets'>
  rowIndex?: number
  tickets?: Tables<'tickets'>[]
  bodyGroups?: string[]
  hoveredDragHandle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bodyGroups: () => ['tickets-table-body'],
  hoveredDragHandle: false,
})

const emit = defineEmits<{
  (e: 'delete', payload: { ticket: Tables<'tickets'> }): void
  (e: 'update:hovered-drag-handle', payload: boolean): void
}>()

const { isDragging, elementRef, handleDragStart, isOvered } = useDraggable({
  groups: props.bodyGroups,
  data: computed(() => ({
    source: props.tickets || [],
    index: props.rowIndex ?? 0,
  })),
  containerProps: {
    class:
      '[&>div]:grid [&>div]:grid-cols-6 [&>div]:items-center [&>div]:gap-8 border transition-border border-dashed border-primary-500',
  },
})

const showUnauthorizedMessage = () => {
  if (isAuthenticated.value) {
    return
  }

  createToast({
    title: 'You must be logged in to update a ticket',
    type: 'warning',
  })
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const openEditDialog = (ticket: Tables<'tickets'>) => {
  router.push({
    query: { ...route.query, ticket: ticket.id },
  })
}

const handleTitleUpdate = async (newValue: string) => {
  if (!isAuthenticated.value) {
    createToast({
      title: 'You must be logged in to update a ticket',
      type: 'warning',
    })
    return
  }
  if (!newValue.trim() || newValue === props.ticket.title) return

  try {
    await updateTicket({
      ticketId: props.ticket.id,
      updates: { title: newValue },
    })
  } catch (err) {
    console.error('Error updating ticket title:', err)
  }
}

const handleStatusChange = async (newStatus: TicketStatus | null) => {
  if (!newStatus || newStatus === props.ticket.status) return

  try {
    await updateTicket({
      ticketId: props.ticket.id,
      updates: { status: newStatus },
    })
  } catch (err) {
    console.error('Error updating ticket status:', err)
  }
}

const handlePriorityChange = async (newPriority: TicketPriority | null) => {
  if (!newPriority || newPriority === props.ticket.priority) return

  try {
    await updateTicket({
      ticketId: props.ticket.id,
      updates: { priority: newPriority },
    })
  } catch (err) {
    console.error('Error updating ticket priority:', err)
  }
}

const handleTypeChange = async (newType: TicketType | null) => {
  if (!newType || newType === props.ticket.type) return

  try {
    await updateTicket({
      ticketId: props.ticket.id,
      updates: { type: newType },
    })
  } catch (err) {
    console.error('Error updating ticket type:', err)
  }
}
</script>

<template>
  <tr
    ref="elementRef"
    class="group border-b flex relative border-neutral-200 transform-all hover:bg-neutral-100 transition h-[37px]"
    :class="{
      'opacity-50': isDragging,
      'border-primary-500': isOvered,
      'bg-primary-50': selectedTicketIds.includes(ticket.id),
    }"
    @click="showUnauthorizedMessage"
  >
    <TicketRowSelectableMenu
      :ticket-id="ticket.id"
      :is-dragging="isDragging"
      :is-overed="isOvered"
      :hovered-drag-handle="hoveredDragHandle"
      :handle-drag-start="handleDragStart"
      @update:hovered-drag-handle="emit('update:hovered-drag-handle', $event)"
    />

    <TableCell
      class="relative p-0! overflow-visible w-[421px] flex justify-center flex-col h-[37px]"
    >
      <Editable
        :value="ticket.title"
        placeholder="Enter title"
        :with-controls="false"
        :disabled="!isAuthenticated"
        @value-commit="(e) => handleTitleUpdate(e.value)"
        root-class=""
        preview-class="inline w-full h-full"
        input-class="relative z-20 h-full"
      />
      <div
        v-if="isAuthenticated"
        class="opacity-100 lg:opacity-0 z-10 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2"
      >
        <Button
          variant="ghost"
          size="sm"
          class="flex gap-1 items-center uppercase"
          @click="openEditDialog(ticket)"
          tooltip="Open in side peek"
          :tooltip-open-delay="500"
        >
          <PanelsTopLeft class="size-3" />
          Open
        </Button>
      </div>
    </TableCell>
    <TableCell class="h-full w-[130px]">
      <TicketStatusSelect
        :value="ticket.status"
        @change="handleStatusChange"
        root-class="max-w-full"
        :disabled="!isAuthenticated"
      />
    </TableCell>
    <TableCell class="h-full w-[105px]">
      <TicketPrioritySelect
        :value="ticket.priority"
        @change="handlePriorityChange"
        root-class="min-w-full"
        :disabled="!isAuthenticated"
      />
    </TableCell>
    <TableCell class="h-full w-[150px]">
      <TicketTypeSelect
        :value="ticket.type"
        @change="handleTypeChange"
        root-class="min-w-full"
        :disabled="!isAuthenticated"
      />
    </TableCell>
    <TableCell class="relative">
      <div class="flex items-center gap-1">
        <Calendar class="w-4 h-4" />
        {{ formatDate(ticket.due_date) }}
      </div>
    </TableCell>
  </tr>
</template>
