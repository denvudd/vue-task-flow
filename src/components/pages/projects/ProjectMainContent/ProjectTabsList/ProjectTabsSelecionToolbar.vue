<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectContext } from '@/composables/useProjectContext'
import { Button, TicketStatusSelect, TicketPrioritySelect, TicketTypeSelect } from '@/components/ui'
import { Transition } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUpdateTicket, useDeleteTicket } from '@/composables/useTickets'
import { useToast } from '@/composables/useToast'
import { CircleChevronDown, Flag, Loader, Trash2 } from 'lucide-vue-next'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'

const { isAuthenticated } = useAuth()
const { selectedTicketIds, clearSelection } = useProjectContext()
const { mutateAsync: updateTicket } = useUpdateTicket()
const { mutateAsync: deleteTicket } = useDeleteTicket()
const { createToast } = useToast()
const { t } = useI18n()

const isUpdating = ref(false)
const isDeleting = ref(false)

const handleBulkStatusChange = async (status: TicketStatus | null) => {
  if (!status || selectedTicketIds.value.length === 0) return

  try {
    isUpdating.value = true
    const promises = selectedTicketIds.value.map((ticketId) =>
      updateTicket({ ticketId, updates: { status } }),
    )
    await Promise.all(promises)

    clearSelection()
  } catch (error) {
    console.error('Error updating ticket status:', error)
    createToast({
      title: t('projectSelection.errors.updateStatusFailed'),
      type: 'error',
    })
  } finally {
    isUpdating.value = false
  }
}

const handleBulkPriorityChange = async (priority: TicketPriority | null) => {
  if (!priority || selectedTicketIds.value.length === 0) return

  try {
    isUpdating.value = true
    const promises = selectedTicketIds.value.map((ticketId) =>
      updateTicket({ ticketId, updates: { priority } }),
    )
    await Promise.all(promises)

    clearSelection()
  } catch (error) {
    console.error('Error updating ticket priority:', error)
    createToast({
      title: t('projectSelection.errors.updatePriorityFailed'),
      type: 'error',
    })
  } finally {
    isUpdating.value = false
  }
}

const handleBulkTypeChange = async (type: TicketType | null) => {
  if (!type || selectedTicketIds.value.length === 0) return

  try {
    isUpdating.value = true
    const promises = selectedTicketIds.value.map((ticketId) =>
      updateTicket({ ticketId, updates: { type } }),
    )
    await Promise.all(promises)

    clearSelection()
  } catch (error) {
    console.error('Error updating ticket priority:', error)
    createToast({
      title: t('projectSelection.errors.updateTypeFailed'),
      type: 'error',
    })
  } finally {
    isUpdating.value = false
  }
}

const handleBulkDelete = async () => {
  if (selectedTicketIds.value.length === 0) return

  if (!confirm(t('projectSelection.confirmDelete', { count: selectedTicketIds.value.length }))) {
    return
  }

  try {
    isDeleting.value = true
    const promises = selectedTicketIds.value.map((ticketId) => deleteTicket(ticketId))
    await Promise.all(promises)

    createToast({
      title: t('projectSelection.success.movedToTrash'),
      type: 'success',
    })

    clearSelection()
  } catch (error) {
    console.error('Error deleting tickets:', error)
    createToast({
      title: t('projectSelection.errors.deleteFailed'),
      type: 'error',
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isAuthenticated && selectedTicketIds.length > 0"
      class="sticky z-999 top-0 visible w-fit"
      :style="{ insetInlineStart: '94px' }"
    >
      <div class="select-none w-fit absolute top-0 h-8">
        <div
          class="inline-flex justify-center divide-x divide-neutral-300 px-1 border border-neutral-300 items-center rounded-md shadow-md h-8 bg-neutral-50 overflow-hidden"
        >
          <Button
            variant="ghost"
            size="sm"
            class="h-full shrink-0 px-[10px] text-primary-700 rounded-none"
            @click="clearSelection"
          >
            {{ t('projectSelection.selected', { count: selectedTicketIds.length }) }}
          </Button>

          <div class="flex items-center gap-1 h-full shrink-0 divide-x divide-neutral-300 pl-1">
            <div class="flex items-center fit-content w-[70px] overflow-x-auto scroll-hidden">
              <Loader class="size-3.5 shrink-0" />
              <TicketStatusSelect
                :placeholder="t('projectSelection.status')"
                root-class="!space-y-0 h-full"
                :disabled="isUpdating || isDeleting"
                @change="handleBulkStatusChange"
              />
            </div>

            <div class="flex items-center fit-content w-[70px] overflow-x-auto scroll-hidden">
              <CircleChevronDown class="size-3.5 shrink-0" />
              <TicketPrioritySelect
                :placeholder="t('projectSelection.priority')"
                root-class="!space-y-0 h-full"
                :disabled="isUpdating || isDeleting"
                @change="handleBulkPriorityChange"
              />
            </div>

            <div class="flex items-center fit-content w-[70px] overflow-x-auto scroll-hidden">
              <Flag class="size-3.5 shrink-0" />
              <TicketTypeSelect
                :placeholder="t('projectSelection.type')"
                root-class="!space-y-0 h-full"
                :disabled="isUpdating || isDeleting"
                @change="handleBulkTypeChange"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            :disabled="isUpdating || isDeleting"
            @click="handleBulkDelete"
            :tooltip="t('projectSelection.deleteTooltip')"
            class="shrink-0 h-full rounded-none hover:text-error-500"
          >
            <Trash2 class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>
