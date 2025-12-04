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
import TicketRowSelectableMenu from './TicketRowSelectableMenu.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const { createToast } = useToast()

interface Props {
  ticket: Tables<'tickets'>
  rowIndex?: number
  tickets?: Tables<'tickets'>[]
  bodyGroups?: string[]
  hoveredDragHandle?: boolean
  selected?: boolean
  selectedTickets?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  bodyGroups: () => ['tickets-table-body'],
  selectedTickets: () => [],
  hoveredDragHandle: false,
})

const emit = defineEmits<{
  (e: 'update:title', payload: { ticket: Tables<'tickets'>; value: string }): void
  (e: 'update:status', payload: { ticket: Tables<'tickets'>; value: TicketStatus | null }): void
  (e: 'update:priority', payload: { ticket: Tables<'tickets'>; value: TicketPriority | null }): void
  (e: 'update:type', payload: { ticket: Tables<'tickets'>; value: TicketType | null }): void
  (e: 'delete', payload: { ticket: Tables<'tickets'> }): void
  (e: 'update:hovered-drag-handle', payload: boolean): void
  (e: 'update:selected', payload: boolean): void
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
</script>

<template>
  <tr
    ref="elementRef"
    class="group border-b flex relative border-neutral-200 transform-all hover:bg-neutral-100 transition h-[37px]"
    :class="{
      'opacity-50': isDragging,
      'border-primary-500': isOvered,
      'bg-primary-50': selected,
    }"
    @click="showUnauthorizedMessage"
  >
    <TicketRowSelectableMenu
      :is-dragging="isDragging"
      :is-overed="isOvered"
      :hovered-drag-handle="hoveredDragHandle"
      :handle-drag-start="handleDragStart"
      :selected="selected"
      :selected-tickets="selectedTickets"
      @update:hovered-drag-handle="emit('update:hovered-drag-handle', $event)"
      @update:selected="(checked) => emit('update:selected', checked)"
    />

    <TableCell
      class="relative p-0! overflow-visible w-[421px] flex justify-center flex-col h-[37px]"
    >
      <Editable
        :value="ticket.title"
        placeholder="Enter title"
        :with-controls="false"
        :disabled="!isAuthenticated"
        @value-commit="(e) => emit('update:title', { ticket, value: e.value })"
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
        @change="(val) => emit('update:status', { ticket, value: val })"
        root-class="max-w-full"
        :disabled="!isAuthenticated"
      />
    </TableCell>
    <TableCell class="h-full w-[105px]">
      <TicketPrioritySelect
        :value="ticket.priority"
        @change="(val) => emit('update:priority', { ticket, value: val })"
        root-class="min-w-full"
        :disabled="!isAuthenticated"
      />
    </TableCell>
    <TableCell class="h-full w-[150px]">
      <TicketTypeSelect
        :value="ticket.type"
        @change="(val) => emit('update:type', { ticket, value: val })"
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
