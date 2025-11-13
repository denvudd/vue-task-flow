<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  Dialog,
  Field,
  FieldInput,
  FieldTextarea,
  FieldSelect,
  Button,
  type SelectItem,
} from '@/components/ui'
import {
  updateTicketSchema,
} from '@/validation/projects'
import {
  TICKET_STATUS_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_TYPE_OPTIONS,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from '@/constants/tickets'
import { useUpdateTicket } from '@/composables/useTickets'
import type { Tables } from '@/types/supabase'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const { mutateAsync: updateTicket, isPending: isSubmitting } = useUpdateTicket()

const isOpen = ref(false)
const ticket = ref<Tables<'tickets'> | null>(null)

const {
  handleSubmit,
  errors,
  defineField,
  resetForm,
  setValues,
} = useForm({
  validationSchema: toTypedSchema(updateTicketSchema),
  validateOnMount: false,
})

const [editTitle, editTitleAttrs] = defineField('title')
const [editDescription, editDescriptionAttrs] = defineField('description')
const [editStatus, editStatusAttrs] = defineField('status')
const [editPriority, editPriorityAttrs] = defineField('priority')
const [editType, editTypeAttrs] = defineField('type')
const [editDueDate, editDueDateAttrs] = defineField('due_date') as [
  Ref<string | undefined>,
  any,
]

watch(
  () => ticket.value,
  (ticketValue) => {
    if (ticketValue) {
      setValues({
        title: ticketValue.title,
        description: ticketValue.description || '',
        status: (ticketValue.status || TICKET_STATUSES.TODO) as TicketStatus,
        priority: (ticketValue.priority || TICKET_PRIORITIES.MEDIUM) as TicketPriority,
        type: (ticketValue.type || TICKET_TYPES.TASK) as TicketType,
        due_date: ticketValue.due_date ? ticketValue.due_date.split('T')[0] : '',
      })
    }
  },
  { immediate: true },
)

const handleSubmitForm = handleSubmit(async (values) => {
  if (!ticket.value) return

  try {
    await updateTicket({
      ticketId: ticket.value.id,
      updates: {
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        type: values.type,
        due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      },
    })
    handleSuccess()
  } catch (err) {
    console.error('Error updating ticket:', err)
  }
})

const handleCancel = () => {
  isOpen.value = false
  ticket.value = null
  resetForm()
}

const handleSuccess = () => {
  isOpen.value = false
  ticket.value = null
  resetForm()
  emit('success')
}

const open = (ticketToEdit: Tables<'tickets'>) => {
  ticket.value = ticketToEdit
  isOpen.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <Dialog v-model:open="isOpen" size="lg">
    <template #title>Edit Ticket</template>
    <template #description>Update ticket details</template>

    <form @submit.prevent="handleSubmitForm" class="space-y-4">
      <Field label="Title" required :invalid="!!errors.title">
        <FieldInput
          v-model="editTitle"
          v-bind="editTitleAttrs"
          placeholder="Enter ticket title"
          :invalid="!!errors.title"
        />
        <template #errorText>{{ errors.title }}</template>
      </Field>

      <Field label="Description" :invalid="!!errors.description">
        <FieldTextarea
          v-model="editDescription"
          v-bind="editDescriptionAttrs"
          placeholder="Enter ticket description"
          :invalid="!!errors.description"
          autoresize
        />
        <template #errorText>{{ errors.description }}</template>
      </Field>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Status" :invalid="!!errors.status">
          <FieldSelect
            :items="TICKET_STATUS_OPTIONS"
            :value="editStatus ? [editStatus] : []"
            @on-value-change="
              (details: { items: SelectItem[]; value: string[] }) =>
                (editStatus = (details.value[0] as TicketStatus) || '')
            "
            placeholder="Select status"
          />
          <template #errorText>{{ errors.status }}</template>
        </Field>

        <Field label="Priority" :invalid="!!errors.priority">
          <FieldSelect
            :items="TICKET_PRIORITY_OPTIONS"
            :value="editPriority ? [editPriority] : []"
            @on-value-change="
              (details: { items: SelectItem[]; value: string[] }) =>
                (editPriority = (details.value[0] as TicketPriority) || '')
            "
            placeholder="Select priority"
          />
          <template #errorText>{{ errors.priority }}</template>
        </Field>

        <Field label="Type" :invalid="!!errors.type">
          <FieldSelect
            :items="TICKET_TYPE_OPTIONS"
            :value="editType ? [editType] : []"
            @on-value-change="
              (details: { items: SelectItem[]; value: string[] }) =>
                (editType = (details.value[0] as TicketType) || '')
            "
            placeholder="Select type"
          />
          <template #errorText>{{ errors.type }}</template>
        </Field>
      </div>

      <Field label="Due Date" :invalid="!!errors.due_date">
        <FieldInput
          v-model="editDueDate"
          v-bind="editDueDateAttrs"
          type="date"
          :invalid="!!errors.due_date"
        />
        <template #errorText>{{ errors.due_date }}</template>
      </Field>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button variant="outline" @click="handleCancel"> Cancel </Button>
        <Button type="submit" @click="handleSubmitForm" :disabled="isSubmitting">
          {{ isSubmitting ? 'Updating...' : 'Update Ticket' }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
