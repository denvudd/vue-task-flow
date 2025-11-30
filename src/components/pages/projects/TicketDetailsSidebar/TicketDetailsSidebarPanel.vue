<script setup lang="ts">
import { Field, TicketStatusSelect, TicketPrioritySelect, TicketTypeSelect } from '@/components/ui'
import { Loader, CircleChevronDown, Flag } from 'lucide-vue-next'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'
import { useTicketDetails } from '@/composables/useTicketDetails'

const {
  status,
  priority,
  type,
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
  <div class="flex items-center gap-4">
    <Field root-class="flex flex-col items-start">
      <template #label>
        <div class="flex items-center gap-1">
          <Loader class="size-3.5" />
          Status
        </div>
      </template>
      <TicketStatusSelect :value="status" @change="handleStatusChange" />
    </Field>

    <Field label="Priority" root-class="flex flex-col items-start">
      <template #label>
        <div class="flex items-center gap-1">
          <CircleChevronDown class="size-3.5" />
          Priority
        </div>
      </template>
      <TicketPrioritySelect :value="priority" @change="handlePriorityChange" />
    </Field>

    <Field label="Type" root-class="flex flex-col items-start">
      <template #label>
        <div class="flex items-center gap-1">
          <Flag class="size-3.5" />
          Type
        </div>
      </template>
      <TicketTypeSelect :value="type" @change="handleTypeChange" />
    </Field>
  </div>
</template>
