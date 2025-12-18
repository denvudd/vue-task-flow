<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useDraggable } from '@vue-dnd-kit/core'
import {
  ContextMenu,
  TicketPrioritySelect,
  TicketTypeSelect,
  Avatar,
  Button,
} from '@/components/ui'
import type { Tables } from '@/types/supabase'
import type { StatusOption, TicketPriority, TicketType } from '@/constants/tickets'
import { Calendar, PanelsTopLeft, Trash2, Link, ArrowUpRight, GripVertical } from 'lucide-vue-next'
import { getUserDisplayName } from '@/lib/utils/get-user-display-name'
import { getAvatarUrl } from '@/lib/utils/get-avatar-url'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useUpdateTicket } from '@/composables/useTickets'
import { useProjectContext } from '@/composables/useProjectContext'
import { ROUTES } from '@/lib/routing'
import { cn } from '@/lib/utils'

const route = useRoute()
const router = useRouter()

const { isAuthenticated } = useAuth()
const { createToast } = useToast()
const { selectTicket, deselectTicket, selectedTicketIds, currentProjectId } = useProjectContext()
const { mutateAsync: updateTicket } = useUpdateTicket()
const { t } = useI18n()

interface Props {
  ticket: Tables<'tickets'>
  columnStatus: StatusOption
  tickets: Tables<'tickets'>[]
  ticketIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'delete', payload: { ticket: Tables<'tickets'> }): void
}>()

const draggableData = computed(() => ({
  source: props.tickets,
  index: props.ticketIndex,
  ticket: props.ticket,
  columnStatus: props.columnStatus,
}))

const { isDragging, elementRef, handleDragStart, isOvered } = useDraggable({
  groups: ['board-columns'],
  data: draggableData,
  disabled: computed(() => !isAuthenticated.value),
})

// Debug dragging state
watch(isDragging, (newValue, oldValue) => {
  console.log('[BoardTicketCard] isDragging changed:', {
    ticketId: props.ticket.id,
    ticketTitle: props.ticket.title,
    from: oldValue,
    to: newValue,
  })
})

watch(isOvered, (newValue, oldValue) => {
  console.log('[BoardTicketCard] isOvered changed:', {
    ticketId: props.ticket.id,
    ticketTitle: props.ticket.title,
    from: oldValue,
    to: newValue,
  })
})

const showUnauthorizedMessage = () => {
  if (isAuthenticated.value) {
    return
  }

  createToast({
    title: t('boardTicketCard.mustBeLoggedIn'),
    type: 'warning',
  })
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return t('boardTicketCard.na')
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

const ticketAssignee = computed(() => {
  const ticket = props.ticket as any
  return ticket.assignee || null
})

const creatorDisplayName = computed(() => {
  if (!ticketCreator.value) return t('boardTicketCard.unknownUser')
  return getUserDisplayName({
    full_name: ticketCreator.value.full_name,
    username: ticketCreator.value.username,
  })
})

const assigneeDisplayName = computed(() => {
  if (!ticketAssignee.value) return null
  return getUserDisplayName({
    full_name: ticketAssignee.value.full_name,
    username: ticketAssignee.value.username,
  })
})

const avatarUrl = computed(() => {
  if (!ticketAssignee.value?.avatar_url) return null
  return getAvatarUrl(ticketAssignee.value.avatar_url)
})

const openEditDialog = (ticket: Tables<'tickets'>) => {
  router.push({
    query: { ...route.query, ticket: ticket.id },
  })
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
      title: t('boardTicketCard.linkCopied'),
      type: 'success',
    })
    return
  }
}

const handleCardContextMenu = (event: MouseEvent, onContextMenu: (event: MouseEvent) => void) => {
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
        label: t('boardTicketCard.contextMenu.openIn'),
        value: 'open-in',
        icon: ArrowUpRight,
        submenu: [
          { label: t('boardTicketCard.contextMenu.newTab'), value: 'open-new-tab', icon: ArrowUpRight },
          { label: t('boardTicketCard.contextMenu.sidePeek'), value: 'open-side-peek', icon: PanelsTopLeft },
        ],
      },
      { type: 'separator' },
      { label: t('boardTicketCard.contextMenu.copyLink'), value: 'copy-link', icon: Link },
      { label: t('boardTicketCard.contextMenu.delete'), value: 'delete', danger: true, icon: Trash2 },
    ]"
    @select="handleContextMenuSelect"
    :class="cn('max-w-[260px]')"
  >
    <template #footer>
      <div class="px-2 py-1.5 text-xs text-neutral-500 space-y-0.5">
        <div v-if="ticket.updated_at">{{ t('boardTicketCard.lastEdited', { datetime: formatDateTime(ticket.updated_at) }) }}</div>
        <div>
          {{ t('boardTicketCard.createdAt', { datetime: formatDateTime(ticket.created_at) }) }}<span v-if="ticketCreator">{{ t('boardTicketCard.createdBy', { creator: creatorDisplayName }) }}</span>
        </div>
      </div>
    </template>
    <template #trigger="{ onContextMenu }">
      <div
        ref="elementRef"
        :class="
          cn(
            'group px-2.5 py-2 cursor-pointer hover:shadow-sm transition-all border border-neutral-200 bg-white relative rounded-lg',
            {
              'opacity-50 rotate-2': isDragging,
              'ring-2 ring-primary-500': isOvered || selectedTicketIds.includes(ticket.id),
              'bg-primary-50': selectedTicketIds.includes(ticket.id),
            },
            columnStatus.cardColor,
          )
        "
        @click="openEditDialog(ticket)"
        @contextmenu="(e) => handleCardContextMenu(e, onContextMenu)"
      >
        <div
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
        >
          <Button
            v-if="isAuthenticated"
            type="button"
            variant="ghost"
            size="icon"
            class="p-1!"
            @click="openEditDialog(ticket)"
            :tooltip="t('boardTicketCard.openInSidePeek')"
          >
            <PanelsTopLeft class="size-4" />
          </Button>
          <Button
            v-if="isAuthenticated"
            type="button"
            variant="ghost"
            size="icon"
            class="cursor-grab! active:cursor-grabbing p-1!"
            @pointerdown.prevent.stop="handleDragStart"
            @click.stop
            :tooltip="t('boardTicketCard.dragToMove')"
          >
            <GripVertical class="size-4" />
          </Button>
        </div>

        <!-- Title -->
        <h3 class="text-sm font-medium text-neutral-900 mb-2 pr-6 line-clamp-2">
          {{ ticket.title }}
        </h3>

        <!-- Metadata -->
        <div class="flex flex-wrap gap-2 mb-2">
          <TicketPrioritySelect
            :value="ticket.priority"
            @change="handlePriorityChange"
            root-class="w-fit"
            :disabled="!isAuthenticated"
            @click.stop
          />
          <TicketTypeSelect
            :value="ticket.type"
            @change="handleTypeChange"
            root-class="w-fit"
            :disabled="!isAuthenticated"
            @click.stop
          />
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between">
          <!-- Due Date -->
          <div v-if="ticket.due_date" class="flex items-center gap-1 text-xs text-neutral-600">
            {{
              Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              }).format(new Date(ticket.due_date))
            }}
          </div>
          <div v-else class="flex-1"></div>

          <!-- Assignee Avatar -->
          <Avatar
            v-if="ticketAssignee"
            :src="avatarUrl"
            :alt="assigneeDisplayName || t('boardTicketCard.assignee')"
            :title="assigneeDisplayName || undefined"
            class="size-6"
          />
        </div>
      </div>
    </template>
  </ContextMenu>
</template>
