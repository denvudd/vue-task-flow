<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Dialog,
  Field,
  RichTextEditor,
  TicketStatusSelect,
  TicketPrioritySelect,
  TicketTypeSelect,
  Editable,
} from '@/components/ui'
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from '@/constants/tickets'
import { useUpdateTicket, useProjectTickets, useTicket } from '@/composables/useTickets'
import type { Tables } from '@/types/supabase'

interface Props {
  ticket?: Tables<'tickets'>
  ticketId?: string
  openOnMount?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const route = useRoute()
const router = useRouter()

const { mutateAsync: updateTicket } = useUpdateTicket()

const ticketIdFromUrl = computed(() => {
  const ticketParam = route.query.ticket
  return typeof ticketParam === 'string' ? ticketParam : undefined
})

const ticketId = computed(() => ticketIdFromUrl.value || props.ticketId || props.ticket?.id)

const { data: fetchedTicket, isLoading: isLoadingTicket } = useTicket(
  computed(() => (ticketIdFromUrl.value || props.ticketId ? ticketId.value : undefined)),
)

const currentTicket = computed(() => props.ticket || fetchedTicket.value)

const isOpen = ref(props.openOnMount || !!ticketIdFromUrl.value)

watch(
  () => ticketIdFromUrl.value,
  (ticketId) => {
    if (ticketId) {
      isOpen.value = true
    } else if (!props.openOnMount) {
      isOpen.value = false
    }
  },
  { immediate: true },
)

watch(isOpen, (newValue, oldValue) => {
  emit('update:open', newValue)

  if (!newValue && oldValue && ticketIdFromUrl.value) {
    const query = { ...route.query }
    delete query.ticket
    router.push({ query })
  }
})

const title = ref('')
const description = ref('')
const status = ref<TicketStatus>(TICKET_STATUSES.TODO)
const priority = ref<TicketPriority>(TICKET_PRIORITIES.MEDIUM)
const type = ref<TicketType>(TICKET_TYPES.TASK)

watch(
  () => currentTicket.value,
  (ticketValue) => {
    if (ticketValue) {
      title.value = ticketValue.title
      description.value = ticketValue.description || ''
      status.value = (ticketValue.status || TICKET_STATUSES.TODO) as TicketStatus
      priority.value = (ticketValue.priority || TICKET_PRIORITIES.MEDIUM) as TicketPriority
      type.value = (ticketValue.type || TICKET_TYPES.TASK) as TicketType
    }
  },
  { immediate: true },
)

watch(
  [() => props.openOnMount, () => currentTicket.value],
  ([openOnMount, ticket]) => {
    if (openOnMount && ticket && !ticketIdFromUrl.value) {
      isOpen.value = true
    }
  },
  { immediate: true },
)

const updateTicketField = async (updates: Partial<Tables<'tickets'>>) => {
  if (!currentTicket.value || !ticketId.value) return

  try {
    await updateTicket({
      ticketId: ticketId.value,
      updates: {
        ...updates,
      },
    })
    // Realtime will automatically update the tickets list
  } catch (err) {
    console.error('Error updating ticket:', err)
  }
}

const handleTitleCommit = async (details: { value: string }) => {
  await updateTicketField({ title: details.value })
}

const handleDescriptionChange = (value: string) => {
  description.value = value
}

const handleDescriptionBlur = async () => {
  await updateTicketField({ description: description.value || null })
}

const handleStatusChange = async (newStatus: TicketStatus | null) => {
  if (!newStatus) return
  status.value = newStatus
  await updateTicketField({ status: newStatus })
}

const handlePriorityChange = async (newPriority: TicketPriority | null) => {
  if (!newPriority) return
  priority.value = newPriority
  await updateTicketField({ priority: newPriority })
}

const handleTypeChange = async (newType: TicketType | null) => {
  if (!newType) return
  type.value = newType
  await updateTicketField({ type: newType })
}

const open = () => {
  isOpen.value = true
}
</script>

<template>
  <Dialog v-model:open="isOpen" size="7xl">
    <template #title>
      <Editable
        v-if="currentTicket"
        :value="title"
        placeholder="Enter ticket title"
        @value-commit="handleTitleCommit"
        preview-class="text-2xl font-semibold"
        input-class="text-2xl font-semibold"
      />
      <span v-else>Ticket Details</span>
    </template>

    <div v-if="isLoadingTicket" class="flex justify-center items-center py-8">
      <div class="text-neutral-600">Loading ticket...</div>
    </div>

    <div v-else-if="currentTicket" class="flex gap-6">
      <!-- Main content area (left) -->
      <div class="flex-1 min-w-0">
        <Field label="Description">
          <RichTextEditor
            :model-value="description"
            @update:model-value="handleDescriptionChange"
            @blur="handleDescriptionBlur"
            placeholder="Enter ticket description"
            min-height="200px"
          />
        </Field>
      </div>

      <!-- Sidebar (right) -->
      <aside class="w-94 shrink-0 border-l border-neutral-200 pl-6 space-y-4">
        <h2 class="text-lg font-semibold">Details</h2>
        <Field label="Status" root-class="flex items-center justify-between gap-2">
          <TicketStatusSelect :value="status" @change="handleStatusChange" />
        </Field>

        <Field label="Priority" root-class="flex items-center justify-between gap-2">
          <TicketPrioritySelect :value="priority" @change="handlePriorityChange" />
        </Field>

        <Field label="Type" root-class="flex items-center justify-between gap-2">
          <TicketTypeSelect :value="type" @change="handleTypeChange" />
        </Field>
      </aside>
    </div>

    <div v-else class="py-8 text-center text-neutral-600">Ticket not found</div>
  </Dialog>
</template>
