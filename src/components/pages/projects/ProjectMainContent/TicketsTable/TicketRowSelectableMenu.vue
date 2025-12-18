<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Button, Checkbox } from '@/components/ui'
import { GripVertical, Plus } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import type { CheckboxCheckedState } from '@ark-ui/vue/checkbox'
import { useProjectContext } from '@/composables/useProjectContext'
import { useCreateTicket } from '@/composables/useTickets'
import type { Tables } from '@/types/supabase'
import { TICKET_PRIORITIES, TICKET_STATUSES, TICKET_TYPES } from '@/constants/tickets'
import { useToast } from '@/composables/useToast'
import { reorderTickets } from '@/api/tickets'

interface Props {
  ticketId: string
  hoveredDragHandle: boolean
  isDragging: boolean
  isOvered: boolean
  handleDragStart: (event: PointerEvent | KeyboardEvent) => void
  tickets?: Tables<'tickets'>[]
  rowIndex?: number
}

const props = defineProps<Props>()

const { isAuthenticated, user } = useAuth()
const {
  selectedTicketIds,
  selectTicket,
  deselectTicket,
  selectAllTickets,
  clearSelection,
  cleanupSelection,
  currentProjectId,
} = useProjectContext()
const { mutateAsync: createTicket, isPending: isCreatingTicket } = useCreateTicket()
const { createToast } = useToast()
const { t } = useI18n()

const emit = defineEmits<{
  (e: 'update:hovered-drag-handle', payload: boolean): void
}>()

const handleMouseEnter = () => {
  emit('update:hovered-drag-handle', true)
}

const handleMouseLeave = () => {
  emit('update:hovered-drag-handle', false)
}

const handleSelectionChange = (checked: CheckboxCheckedState) => {
  if (checked) {
    selectTicket(props.ticketId)
  } else {
    deselectTicket(props.ticketId)
  }
}

const handleAddTicketBelow = async () => {
  if (!isAuthenticated.value || !user.value) {
    createToast({
      title: t('ticketRowMenu.mustBeLoggedInToCreate'),
      type: 'warning',
    })
    return
  }

  if (!currentProjectId.value) {
    createToast({
      title: t('ticketRowMenu.projectNotSelected'),
      type: 'error',
    })
    return
  }

  if (!props.tickets || props.rowIndex === undefined) {
    console.warn('[Tickets] Missing tickets or rowIndex for add-below operation')
    return
  }

  try {
    const baseIndex = props.rowIndex

    // Shift order_index for all tickets after the current one to make a space
    const ticketsToShift = props.tickets
      .map((ticket, index) => ({
        id: ticket.id,
        // Fallback to index if order_index is null to keep ordering consistent
        order_index: ticket.order_index ?? index,
        index,
      }))
      .filter((ticket) => ticket.index > baseIndex)
      .map((ticket) => ({
        id: ticket.id,
        order_index: ticket.order_index + 1,
      }))

    if (ticketsToShift.length > 0) {
      await reorderTickets(ticketsToShift)
    }

    const currentTicket = props.tickets[baseIndex]
    const currentOrderIndex =
      currentTicket?.order_index !== null && currentTicket?.order_index !== undefined
        ? currentTicket.order_index
        : baseIndex

    const today = new Date()

    const newTicket = {
      title: '',
      description: null,
      status: TICKET_STATUSES.TODO,
      priority: TICKET_PRIORITIES.LOW,
      type: TICKET_TYPES.TASK,
      due_date: today.toISOString(),
      project_id: currentProjectId.value,
      creator_id: user.value.id,
      order_index: currentOrderIndex + 1,
    }

    await createTicket(newTicket)
  } catch (err) {
    console.error('Error creating ticket below:', err)
    createToast({
      title: t('ticketRowMenu.createFailed'),
      type: 'error',
    })
  }
}
</script>

<template>
  <div v-if="isAuthenticated" class="sticky z-85 flex" :style="{ insetInlineStart: '36px' }">
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
                  :checked="selectedTicketIds.includes(ticketId)"
                  @update:checked="handleSelectionChange"
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

  <div v-if="isAuthenticated" class="absolute z-85 flex left-0">
    <div class="opacity-100 transition-opacity">
      <div class="absolute top-2" :style="{ insetInlineStart: '-56px' }">
        <div class="transition-opacity opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            @pointerdown.stop="handleDragStart"
            class="cursor-grab! p-1!"
            :tooltip="isDragging || isOvered ? undefined : t('ticketRowMenu.dragToMove')"
          >
            <GripVertical class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isAuthenticated" class="absolute z-85 flex left-0">
    <div class="opacity-100 transition-opacity">
      <div class="absolute top-2" :style="{ insetInlineStart: '-76px' }">
        <div class="transition-opacity opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            class="p-1!"
            :disabled="isCreatingTicket"
            @click.stop="handleAddTicketBelow"
            :tooltip="isDragging || isOvered ? undefined : t('ticketRowMenu.clickToAddBelow')"
          >
            <Plus class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
