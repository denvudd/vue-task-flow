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
import { Calendar, GripVertical, PanelsTopLeft } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const { createToast } = useToast()

interface Props {
  ticket: Tables<'tickets'>
  rowIndex?: number
  tickets?: Tables<'tickets'>[]
  bodyGroups?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  bodyGroups: () => ['tickets-table-body'],
})

const emit = defineEmits<{
  (e: 'update:title', payload: { ticket: Tables<'tickets'>; value: string }): void
  (e: 'update:status', payload: { ticket: Tables<'tickets'>; value: TicketStatus | null }): void
  (e: 'update:priority', payload: { ticket: Tables<'tickets'>; value: TicketPriority | null }): void
  (e: 'update:type', payload: { ticket: Tables<'tickets'>; value: TicketType | null }): void
  (e: 'delete', payload: { ticket: Tables<'tickets'> }): void
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
    class="group border-b border-neutral-100 transform-all hover:bg-neutral-50 transition"
    :class="{
      'opacity-50': isDragging,
      'border-primary-500': isOvered,
    }"
    @click="showUnauthorizedMessage"
  >
    <TableCell v-if="isAuthenticated" class="w-10">
      <GripVertical class="size-4 cursor-move" @pointerdown="handleDragStart" />
    </TableCell>
    <TableCell class="relative">
      <Editable
        :value="ticket.title"
        :placeholder="`Enter title (current: ${ticket.title || 'empty'})`"
        :with-controls="false"
        :disabled="!isAuthenticated"
        @value-commit="(e) => emit('update:title', { ticket, value: e.value })"
        preview-class="inline min-w-[200px] w-full"
        input-class="relative z-20"
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
        >
          <PanelsTopLeft class="size-3" />
          Open
        </Button>
      </div>
    </TableCell>
    <TableCell>
      <TicketStatusSelect
        :value="ticket.status"
        @change="(val) => emit('update:status', { ticket, value: val })"
        root-class="min-w-[120px]"
        :disabled="!isAuthenticated"
      />
    </TableCell>
    <TableCell>
      <TicketPrioritySelect
        :value="ticket.priority"
        @change="(val) => emit('update:priority', { ticket, value: val })"
        root-class="min-w-[120px]"
        :disabled="!isAuthenticated"
      />
    </TableCell>
    <TableCell>
      <TicketTypeSelect
        :value="ticket.type"
        @change="(val) => emit('update:type', { ticket, value: val })"
        root-class="min-w-[120px]"
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
