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
  ContextMenu,
} from '@/components/ui'
import type { Tables } from '@/types/supabase'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'
import {
  Calendar,
  PanelsTopLeft,
  Trash2,
  CheckSquare,
  Link,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-vue-next'
import { getUserDisplayName } from '@/lib/utils/get-user-display-name'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useUpdateTicket } from '@/composables/useTickets'
import TicketRowSelectableMenu from './TicketRowSelectableMenu.vue'
import { useProjectContext } from '@/composables/useProjectContext'
import { ROUTES } from '@/lib/routing'

const route = useRoute()
const router = useRouter()

const { isAuthenticated } = useAuth()
const { createToast } = useToast()
const { selectedTicketIds, selectTicket, deselectTicket } = useProjectContext()
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

const { currentProjectId } = useProjectContext()

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

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const ticketCreator = computed(() => {
  const ticket = props.ticket as any
  return ticket.creator || null
})

const creatorDisplayName = computed(() => {
  if (!ticketCreator.value) return 'Unknown User'
  return getUserDisplayName({
    full_name: ticketCreator.value.full_name,
    username: ticketCreator.value.username,
  })
})

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

const handleContextMenuSelect = (value: string) => {
  if (!isAuthenticated.value) {
    showUnauthorizedMessage()
    return
  }

  if (value === 'delete') {
    emit('delete', { ticket: props.ticket })
    return
  }

  if (value === 'select') {
    const isSelected = selectedTicketIds.value?.includes(props.ticket.id)

    if (isSelected) {
      deselectTicket(props.ticket.id)
    } else {
      selectTicket(props.ticket.id)
    }
    return
  }

  const ticketUrl = window.location.origin + ROUTES.Ticket(currentProjectId.value!, props.ticket.id)

  if (value === 'open-side-peek') {
    openEditDialog(props.ticket)
    return
  }

  if (value === 'open-new-tab') {
    window.open(ticketUrl, '_blank')
    return
  }

  if (value === 'copy-link') {
    navigator.clipboard.writeText(ticketUrl)
    createToast({
      title: 'Link copied to clipboard',
      type: 'success',
    })
    return
  }
}

const handleRowContextMenu = (event: MouseEvent, onContextMenu: (event: MouseEvent) => void) => {
  if (!isAuthenticated.value) {
    showUnauthorizedMessage()
    return
  }

  if (!selectedTicketIds.value?.includes(props.ticket.id)) {
    selectTicket(props.ticket.id)
  }

  onContextMenu(event)
}
</script>

<template>
  <ContextMenu
    :items="[
      {
        label: 'Open in...',
        value: 'open-in',
        icon: ArrowUpRight,
        submenu: [
          { label: 'New tab', value: 'open-new-tab', icon: ArrowUpRight },
          { label: 'Side peek', value: 'open-side-peek', icon: PanelsTopLeft },
        ],
      },
      { type: 'separator' },
      { label: 'Copy link', value: 'copy-link', icon: Link },
      { label: 'Delete', value: 'delete', danger: true, icon: Trash2 },
    ]"
    @select="handleContextMenuSelect"
    class="max-w-[265px]"
  >
    <template #footer>
      <div class="px-2 py-1.5 text-xs text-neutral-500 space-y-0.5">
        <div v-if="ticket.updated_at">Last edited {{ formatDateTime(ticket.updated_at) }}</div>
        <div>
          Created at {{ formatDateTime(ticket.created_at) }}
          <span v-if="ticketCreator"> by {{ creatorDisplayName }}</span>
        </div>
      </div>
    </template>
    <template #trigger="{ onContextMenu }">
      <tr
        ref="elementRef"
        class="group border-b flex relative border-neutral-200 transform-all hover:bg-neutral-100 transition h-[37px]"
        :class="{
          'opacity-50': isDragging,
          'border-primary-500': isOvered,
          'bg-primary-50': selectedTicketIds.includes(ticket.id),
        }"
        @click="showUnauthorizedMessage"
        @contextmenu="(e) => handleRowContextMenu(e, onContextMenu)"
      >
        <TicketRowSelectableMenu
          :ticket-id="ticket.id"
          :is-dragging="isDragging"
          :is-overed="isOvered"
          :hovered-drag-handle="hoveredDragHandle"
          :handle-drag-start="handleDragStart"
          :tickets="tickets"
          :row-index="rowIndex"
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
            auto-resize
          />
          <div
            v-if="isAuthenticated"
            class="opacity-100 lg:opacity-0 z-10 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              class="flex gap-1 items-center uppercase px-2! py-1!"
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
  </ContextMenu>
</template>
