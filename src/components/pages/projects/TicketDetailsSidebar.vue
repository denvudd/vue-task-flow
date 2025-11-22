<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Field,
  RichTextEditor,
  TicketStatusSelect,
  TicketPrioritySelect,
  TicketTypeSelect,
  Editable,
  Button,
} from '@/components/ui'
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from '@/constants/tickets'
import { useUpdateTicket, useTicket } from '@/composables/useTickets'
import { useProjectMembers } from '@/composables/useMembers'
import type { Tables } from '@/types/supabase'
import { ChevronsRight, CircleChevronDown, Flag, Loader, MoveDiagonal, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

interface Props {
  ticketId: string
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const { mutateAsync: updateTicket } = useUpdateTicket()
const { data: ticket, isLoading: isLoadingTicket } = useTicket(computed(() => props.ticketId))
const { data: membersResponse } = useProjectMembers(computed(() => props.projectId))

const title = ref('')
const description = ref('')
const status = ref<TicketStatus>(TICKET_STATUSES.TODO)
const priority = ref<TicketPriority>(TICKET_PRIORITIES.MEDIUM)
const type = ref<TicketType>(TICKET_TYPES.TASK)

// Prepare mention users from project members
const mentionUsers = computed(() => {
  const members = membersResponse.value?.data || []
  return members.map((member: any) => ({
    id: member.user_id,
    name: member.user?.full_name || member.user?.username || 'Unknown User',
    avatar: member.user?.avatar_url || null,
  }))
})

watch(
  () => ticket.value,
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

const updateTicketField = async (updates: Partial<Tables<'tickets'>>) => {
  if (!ticket.value || !props.ticketId) return

  try {
    await updateTicket({
      ticketId: props.ticketId,
      updates: {
        ...updates,
      },
    })
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

const handleOpenDetails = () => {
  if (!props.projectId || !props.ticketId) return

  router.push(ROUTES.Ticket(props.projectId, props.ticketId))
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 pt-2 gap-1">
      <div class="flex items-center">
        <Button variant="ghost" size="icon" @click="emit('close')" class="shrink-0">
          <ChevronsRight class="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          as="router-link"
          :to="ROUTES.Ticket(props.projectId, props.ticketId)"
          class="shrink-0"
        >
          <MoveDiagonal class="size-4" />
        </Button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-15 pt-3 pb-6">
      <Editable
        v-if="ticket"
        :value="title"
        placeholder="Enter ticket title"
        @value-commit="handleTitleCommit"
        preview-class="text-3xl font-semibold w-full flex-1"
        input-class="text-3xl font-semibold w-full flex-1"
        root-class="w-full flex-1"
      />
      <span v-else class="text-2xl font-semibold">Loading ticket...</span>

      <div v-if="isLoadingTicket" class="flex justify-center items-center py-8">
        <div class="text-neutral-600">Loading ticket...</div>
      </div>

      <div v-else-if="ticket" class="space-y-6 mt-2.5">
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

        <div>
          <Field>
            <RichTextEditor
              :model-value="description"
              @update:model-value="handleDescriptionChange"
              @blur="handleDescriptionBlur"
              placeholder="Enter ticket description"
              min-height="200px"
              :mention-users="mentionUsers"
            />
          </Field>
        </div>
      </div>

      <div v-else class="py-8 text-center text-neutral-600">Ticket not found</div>
    </div>
  </div>
</template>
