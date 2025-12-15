<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { DnDOperations, useDroppable } from '@vue-dnd-kit/core'
import { Table, TableHeader, TableRow, TableHeadCell, Checkbox } from '@/components/ui'
import TicketRow from './TicketRow.vue'
import QuickCreateTicketButton from './QuickCreateTicketButton.vue'
import { useDeleteTicket } from '@/composables/useTickets'
import type { Tables } from '@/types/supabase'
import { useAuth } from '@/composables/useAuth'
import { Calendar, CaseSensitive, CircleChevronDown, Flag, Loader } from 'lucide-vue-next'
import { useProjectContext } from '@/composables/useProjectContext'
import type { CheckboxCheckedState } from '@ark-ui/vue/checkbox'

interface Props {
  tickets: Tables<'tickets'>[] | null | undefined
  isLoading: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  loadMore?: () => Promise<void>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'reorder', payload: { tickets: Tables<'tickets'>[] }): void
}>()

const { isSidebarOpen, selectedTicketIds, selectAllTickets, clearSelection, cleanupSelection } =
  useProjectContext()
const { mutate: deleteTicket } = useDeleteTicket()
const { isAuthenticated } = useAuth()

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
      const ticketIds = newTickets.map((ticket) => ticket.id)
      cleanupSelection(ticketIds)
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

const handleSelectAllTickets = (checked: CheckboxCheckedState) => {
  if (checked) {
    const ticketIds = localTickets.value.map((ticket) => ticket.id)
    selectAllTickets(ticketIds)
  } else {
    clearSelection()
  }
}

const handleMouseEnter = () => {
  hoveredDragHandle.value = true
}

const handleMouseLeave = () => {
  hoveredDragHandle.value = false
}

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (!props.loadMore || !props.hasMore) return

  if (observer) {
    observer.disconnect()
    observer = null
  }

  if (!sentinelRef.value) return

  observer = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && props.hasMore && !props.isLoadingMore && props.loadMore) {
        await props.loadMore()
      }
    },
    {
      rootMargin: '200px', // Start loading 200px before reaching the sentinel
    },
  )

  observer.observe(sentinelRef.value)
}

watch(
  [() => props.hasMore, () => sentinelRef.value],
  async () => {
    await nextTick()
    if (sentinelRef.value && props.hasMore) {
      setupIntersectionObserver()
    } else if (observer) {
      observer.disconnect()
      observer = null
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div data-tickets-table>
    <div
      class="z-1 grow shrink-0 h-full"
      :style="{
        insetInlineStart: isSidebarOpen ? '0px' : 'auto',
        position: isSidebarOpen ? 'sticky' : 'relative',
        width: isSidebarOpen ? 'calc(100vw - 96px)' : '100%',
      }"
    >
      <div>
        <div v-if="isLoading" class="flex justify-center items-center py-16">
          <div class="text-neutral-600">Loading tickets...</div>
        </div>

        <div v-if="!isLoading && !hasTickets" class="py-16 text-center">
          <p class="text-neutral-600">No tickets yet. Create your first ticket!</p>
        </div>

        <div v-show="!isLoading && hasTickets" class="relative flex flex-col min-w-full">
          <Table class="mb-1 px-24" :class="{ 'pe-4': isSidebarOpen }">
            <TableHeader>
              <TableRow
                :hover="false"
                class="group border-b flex relative border-neutral-200 transform-all hover:bg-neutral-100 transition h-[37px]"
              >
                <div
                  v-if="isAuthenticated"
                  class="sticky z-85 flex"
                  :style="{ insetInlineStart: '36px' }"
                >
                  <div class="opacity-100 transition-opacity">
                    <div class="absolute top-0.5" :style="{ insetInlineStart: '-36px' }">
                      <div
                        class="h-full opacity-0 group-hover:opacity-100 transition-opacity border-b border-transparent"
                        :class="
                          hoveredDragHandle || !!selectedTicketIds?.length
                            ? 'opacity-100 bg-neutral-100 data-[part=control]:border-primary-600!'
                            : ''
                        "
                        @mouseenter="handleMouseEnter"
                        @mouseleave="handleMouseLeave"
                      >
                        <div class="h-full">
                          <div class="h-full flex items-center justify-center cursor-pointer z-1">
                            <div class="size-9 flex items-center justify-center">
                              <Checkbox
                                :checked="selectedTicketIds.length > 0"
                                @update:checked="handleSelectAllTickets"
                                :indeterminate="
                                  selectedTicketIds.length > 0 &&
                                  selectedTicketIds.length < localTickets.length
                                "
                                control-class="size-4 group-hover:border-primary-600!"
                                @click.stop
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <TableHeadCell class="w-[421px] px-2">
                  <div class="flex items-center gap-1.5">
                    <CaseSensitive class="size-3.5" />
                    Task name
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

            <tbody ref="tableBodyRef" class="divide-y divide-neutral-100 relative">
              <TransitionGroup name="ticket-row" mode="out-in" class="relative">
                <template v-for="(ticket, index) in localTickets" :key="ticket.id">
                  <TicketRow
                    :ticket="ticket"
                    :row-index="index"
                    :tickets="localTickets"
                    :hovered-drag-handle="hoveredDragHandle"
                    @update:hovered-drag-handle="hoveredDragHandle = $event"
                    @delete="handleDelete"
                  />
                </template>
              </TransitionGroup>
            </tbody>
          </Table>
        </div>
        <div v-if="!isLoading && hasTickets && hasMore" ref="sentinelRef" class="h-1"></div>
        <div
          v-if="!isLoading && hasTickets && isLoadingMore"
          class="flex justify-center items-center py-8"
        >
          <div class="text-neutral-600 flex items-center gap-2">
            <Loader class="size-4 animate-spin" />
            <span>Loading more tickets...</span>
          </div>
        </div>
        <QuickCreateTicketButton v-if="!isLoading && hasTickets" :tickets="localTickets" />
      </div>
    </div>
  </div>
</template>
