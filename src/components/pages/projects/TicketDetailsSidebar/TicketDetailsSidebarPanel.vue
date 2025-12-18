<script setup lang="ts">
import { Field, TicketStatusSelect, TicketPrioritySelect, TicketTypeSelect } from '@/components/ui'
import { useI18n } from 'vue-i18n'
import { Loader, CircleChevronDown, Flag } from 'lucide-vue-next'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'
import { useTicketDetails } from '@/composables/useTicketDetails'

const { t } = useI18n()

const {
  status,
  priority,
  type,
  canEdit,
  setLocalStatus,
  setLocalPriority,
  setLocalType,
  updateTicketField,
} = useTicketDetails()

const handleStatusChange = async (newStatus: TicketStatus | null) => {
  if (!newStatus) return
  setLocalStatus(newStatus)
  await updateTicketField({ status: newStatus })
}

const handlePriorityChange = async (newPriority: TicketPriority | null) => {
  if (!newPriority) return
  setLocalPriority(newPriority)
  await updateTicketField({ priority: newPriority })
}

const handleTypeChange = async (newType: TicketType | null) => {
  if (!newType) return
  setLocalType(newType)
  await updateTicketField({ type: newType })
}
</script>

<template>
  <div class="flex items-center flex-wrap gap-2 sm:gap-4">
    <Field root-class="flex flex-col items-start">
      <template #label>
        <div class="flex items-center gap-1">
          <Loader class="size-3.5" />
          {{ t('ticketDetails.panel.status') }}
        </div>
      </template>
      <TicketStatusSelect :disabled="!canEdit" :value="status" @change="handleStatusChange" />
    </Field>

    <Field :label="t('ticketDetails.panel.priority')" root-class="flex flex-col items-start">
      <template #label>
        <div class="flex items-center gap-1">
          <CircleChevronDown class="size-3.5" />
          {{ t('ticketDetails.panel.priority') }}
        </div>
      </template>
      <TicketPrioritySelect :disabled="!canEdit" :value="priority" @change="handlePriorityChange" />
    </Field>

    <Field :label="t('ticketDetails.panel.type')" root-class="flex flex-col items-start">
      <template #label>
        <div class="flex items-center gap-1">
          <Flag class="size-3.5" />
          {{ t('ticketDetails.panel.type') }}
        </div>
      </template>
      <TicketTypeSelect :disabled="!canEdit" :value="type" @change="handleTypeChange" />
    </Field>
  </div>
</template>
