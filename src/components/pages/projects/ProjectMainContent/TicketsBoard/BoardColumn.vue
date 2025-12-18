<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDroppable, DnDOperations } from '@vue-dnd-kit/core'
import type { Tables } from '@/types/supabase'
import type { Component } from 'vue'
import { Badge } from '@/components/ui'
import BoardTicketCard from './BoardTicketCard.vue'
import { cn } from '@/lib/utils'
import type { StatusOption } from '@/constants/tickets'

interface Props {
  status: StatusOption
  tickets: Tables<'tickets'>[]
  allTickets: Tables<'tickets'>[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  (
    e: 'ticket-drop',
    payload: { ticket: Tables<'tickets'>; newStatus: string; newIndex: number },
  ): void
  (e: 'delete', payload: { ticket: Tables<'tickets'> }): void
}>()

const localTickets = computed(() => props.tickets)

const { elementRef } = useDroppable({
  groups: ['board-columns'],
  data: computed(() => ({
    source: localTickets.value,
    status: props.status.value,
  })),
  events: {
    onDrop: (store) => {
      console.log('[BoardColumn] onDrop triggered in column:', props.status.value)
      console.log('[BoardColumn] hovered.element:', store.hovered.element.value)
      console.log('[BoardColumn] hovered.zone:', store.hovered.zone.value)

      // Check if we have a zone (the column droppable area) even if no specific element
      if (!store.hovered.zone.value) {
        console.log('[BoardColumn] No hovered zone, returning')
        return
      }

      // Check draggingElements (it's a Map)
      const draggingElementsMap = store.draggingElements.value
      console.log('[BoardColumn] draggingElements Map size:', draggingElementsMap.size)

      // Get the first (and typically only) dragging element from the Map
      let draggableData: any = null

      for (const [element, elementData] of draggingElementsMap.entries()) {
        console.log('[BoardColumn] Element data from Map:', elementData)
        console.log('[BoardColumn] Element data.data (reactive):', elementData.data)

        // elementData.data is Reactive, not Ref, so no .value needed
        draggableData = elementData.data
        console.log('[BoardColumn] Draggable data (direct):', draggableData)
        break // Take first element
      }

      console.log('[BoardColumn] Final draggable data:', draggableData)

      if (!draggableData?.ticket) {
        console.log('[BoardColumn] No ticket in draggable data, returning')
        return
      }

      const ticket = draggableData.ticket as Tables<'tickets'>
      const oldStatus = draggableData.columnStatus as string
      const newStatus = props.status.value

      console.log('[BoardColumn] Ticket drop:', {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        oldStatus,
        newStatus,
        isDifferentColumn: oldStatus !== newStatus,
      })

      // For different columns, append to end
      // For same column, use applyTransfer to reorder
      if (oldStatus === newStatus) {
        console.log('[BoardColumn] Same column, applying transfer')
        DnDOperations.applyTransfer(store)

        // Find new index after transfer
        const newIndex = localTickets.value.findIndex((t) => t.id === ticket.id)
        console.log('[BoardColumn] New index after transfer:', newIndex)

        emit('ticket-drop', {
          ticket,
          newStatus,
          newIndex: newIndex >= 0 ? newIndex : props.tickets.length,
        })
      } else {
        // Different column - append to end
        const newIndex = props.tickets.length
        console.log('[BoardColumn] Different column, appending to end:', newIndex)

        emit('ticket-drop', {
          ticket,
          newStatus,
          newIndex,
        })
      }
    },
  },
})

const handleDelete = (payload: { ticket: Tables<'tickets'> }) => {
  emit('delete', payload)
}
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-col min-w-[280px] rounded-lg h-full border border-neutral-200 max-w-[260px]',
        status.bgColor,
      )
    "
  >
    <!-- Column Header -->
    <div class="px-3 flex items-center gap-1.5 bg-transparent z-10 shrink-0 h-10">
      <div :class="cn('flex items-center gap-2')">
        <component :is="status.icon" class="size-4" :class="status.color" />
        <h3 class="text-sm font-semibold text-neutral-900">
          {{ status.label }}
        </h3>
      </div>
      <div class="text-xs leading-tight font-medium px-1.5">
        {{ tickets.length }}
      </div>
    </div>

    <!-- Column Body - Droppable Area -->
    <div
      ref="elementRef"
      class="flex-1 px-2 pb-2 space-y-1 overflow-y-auto overflow-x-hidden min-h-0 pt-1"
      :class="{
        'bg-primary-50/50': false, // Can add drop indication here if needed
      }"
    >
      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <div class="text-sm text-neutral-600">{{ t('boardColumn.loading') }}</div>
      </div>

      <div v-else-if="tickets.length === 0" class="flex justify-center items-center py-8">
        <div class="text-sm text-neutral-500">{{ t('boardColumn.noTickets') }}</div>
      </div>

      <TransitionGroup
        v-else
        tag="div"
        name="ticket-card"
        mode="out-in"
        class="flex flex-col gap-1"
      >
        <BoardTicketCard
          v-for="(ticket, index) in tickets"
          :key="ticket.id"
          :ticket="ticket"
          :column-status="status"
          :tickets="tickets"
          :ticket-index="index"
          @delete="handleDelete"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.ticket-card-move {
  transition: transform 0.3s ease;
}

.ticket-card-enter-active,
.ticket-card-leave-active {
  transition: all 0.3s ease;
}

.ticket-card-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.ticket-card-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Custom scrollbar for columns */
:deep(.overflow-y-auto) {
  scrollbar-width: thin;
  scrollbar-color: #d4d4d8 #f5f5f5;
}

:deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 6px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: #f5f5f5;
  border-radius: 3px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background-color: #d4d4d8;
  border-radius: 3px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
  background-color: #a1a1aa;
}
</style>
