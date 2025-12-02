<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DnDOperations, useDroppable } from '@vue-dnd-kit/core'
import { Table, TableHeader, TableRow, TableHeadCell } from '@/components/ui'
import TicketRow from './TicketRow.vue'
import QuickCreateTicketButton from './QuickCreateTicketButton.vue'
import { useDeleteTicket } from '@/composables/useTickets'
import type { Tables } from '@/types/supabase'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'
import { useAuth } from '@/composables/useAuth'
import { Calendar, CaseSensitive, CircleChevronDown, Flag, Loader } from 'lucide-vue-next'
import { useProjectContext } from '@/composables/useProjectContext'

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

const { isSidebarOpen } = useProjectContext()
const { mutate: deleteTicket } = useDeleteTicket()

const handleDelete = (payload: { ticket: Tables<'tickets'> }) => {
  deleteTicket(payload.ticket.id)
}

const hasTickets = computed(() => (props.tickets?.length ?? 0) > 0)

const localTickets = ref<Tables<'tickets'>[]>([])
const hoveredDragHandle = ref<boolean>(false)

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

        localTickets.value = updatedTickets

        emit('reorder', { tickets: updatedTickets })
      }
    },
  },
})
</script>

<template>
  <div>
    <div
      class="z-1 grow shrink-0 h-full"
      :style="{
        position: isSidebarOpen ? 'sticky' : 'relative',
        insetInlineStart: isSidebarOpen ? '0px' : 'auto',
        width: isSidebarOpen ? 'calc(100vw - 96px)' : '100%',
      }"
    >
      <div class="relative flex flex-col min-w-full pb-[180px] mt-1">
        <div v-if="isLoading" class="flex justify-center items-center py-16">
          <div class="text-neutral-600">Loading tickets...</div>
        </div>

        <div v-if="!isLoading && !hasTickets" class="py-16 text-center">
          <p class="text-neutral-600">No tickets yet. Create your first ticket!</p>
        </div>

        <Table v-show="!isLoading && hasTickets" class="mb-1 ps-24">
          <TableHeader>
            <TableRow :hover="false" class="flex">
              <TableHeadCell class="w-[421px] px-2">
                <div class="flex items-center gap-1.5">
                  <CaseSensitive class="size-3.5" />
                  Title
                </div>
              </TableHeadCell>
              <TableHeadCell class="w-[130px] px-2">
                <div class="flex items-center gap-1.5">
                  <Loader class="size-3.5" />
                  Status
                </div>
              </TableHeadCell>
              <TableHeadCell class="w-[105px] px-2">
                <div class="flex items-center gap-1.5">
                  <CircleChevronDown class="size-3.5" />
                  Priority
                </div>
              </TableHeadCell>
              <TableHeadCell class="w-[150px] px-2">
                <div class="flex items-center gap-1.5">
                  <Flag class="size-3.5" />
                  Type
                </div>
              </TableHeadCell>
              <TableHeadCell>
                <div class="flex items-center gap-1.5">
                  <Calendar class="size-3.5" />
                  Due Date
                </div>
              </TableHeadCell>
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
                :hovered-drag-handle="hoveredDragHandle"
                @update:hovered-drag-handle="hoveredDragHandle = $event"
                @update:title="(payload) => emit('update:title', payload)"
                @update:status="(payload) => emit('update:status', payload)"
                @update:priority="(payload) => emit('update:priority', payload)"
                @update:type="(payload) => emit('update:type', payload)"
                @delete="handleDelete"
              />
            </TransitionGroup>
          </tbody>
        </Table>
        <QuickCreateTicketButton v-if="!isLoading && hasTickets" :tickets="localTickets" />
      </div>
    </div>
  </div>
</template>
