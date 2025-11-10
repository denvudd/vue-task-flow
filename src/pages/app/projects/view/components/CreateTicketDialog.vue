<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useCreateTicket } from '@/composables/useTickets'
import { Button, Dialog, Field, FieldInput, FieldTextarea, FieldSelect } from '@/components/ui'
import { createTicketSchema } from '@/validation/tickets'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { SelectItem } from '@/components/ui/FieldSelect.vue'

interface Props {
  open: boolean
  projectId: string
  projectMembers?: Array<{
    user?: {
      id: string
      full_name?: string | null
      username?: string | null
      email?: string | null
    } | null
  }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  'ticket-created': []
}>()

const { user } = useAuth()
const { mutateAsync: createTicket, isPending: isCreating } = useCreateTicket()

const error = ref<string | null>(null)

const { handleSubmit, errors, defineField, isFieldTouched, isFieldValid, resetForm } = useForm({
  validationSchema: toTypedSchema(createTicketSchema),
  validateOnMount: false,
})

const [title, titleAttrs] = defineField('title', {
  validateOnModelUpdate: true,
})
const [description, descriptionAttrs] = defineField('description', {
  validateOnModelUpdate: true,
})
const [status, statusAttrs] = defineField('status', {
  validateOnModelUpdate: true,
})
const [priority, priorityAttrs] = defineField('priority', {
  validateOnModelUpdate: true,
})
const [type, typeAttrs] = defineField('type', {
  validateOnModelUpdate: true,
})
const [assigneeId, assigneeIdAttrs] = defineField('assignee_id', {
  validateOnModelUpdate: true,
})
const [dueDate, dueDateAttrs] = defineField('due_date', {
  validateOnModelUpdate: true,
})

const titleValid = computed(() => isFieldValid('title') && isFieldTouched('title'))
const descriptionValid = computed(
  () => isFieldValid('description') && isFieldTouched('description'),
)

const statusOptions: SelectItem[] = [
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
  { label: 'Archived', value: 'archived' },
]

const priorityOptions: SelectItem[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const assigneeOptions = computed<SelectItem[]>(() => {
  const options: SelectItem[] = [{ label: 'Unassigned', value: '' }]
  if (props.projectMembers) {
    props.projectMembers.forEach((member) => {
      if (member.user) {
        options.push({
          label: member.user.full_name || member.user.username || member.user.email || 'Unknown',
          value: member.user.id,
        })
      }
    })
  }
  return options
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    emit('update:open', value)
    if (!value) {
      resetForm()
      error.value = null
    }
  },
})

const onSubmit = handleSubmit(async (formValues) => {
  error.value = null

  if (!user.value?.id) {
    error.value = 'You must be logged in to create a ticket'
    return
  }

  try {
    await createTicket({
      title: formValues.title,
      description: formValues.description || null,
      status: formValues.status || 'todo',
      priority: formValues.priority || null,
      type: formValues.type || null,
      assignee_id: formValues.assignee_id || null,
      due_date: formValues.due_date
        ? (formValues.due_date.includes('T')
            ? new Date(formValues.due_date).toISOString()
            : new Date(formValues.due_date + 'T00:00:00').toISOString())
        : null,
      project_id: props.projectId,
      creator_id: user.value.id,
    })

    isOpen.value = false
    emit('ticket-created')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create ticket'
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen" size="lg">
    <template #title>Create New Ticket</template>
    <template #description>Fill in the details below to create a new ticket for this project</template>

    <form id="create-ticket-form" @submit.prevent="onSubmit" class="space-y-4">
      <div v-if="error" class="p-3 rounded-lg bg-error-50 border border-error-200">
        <p class="text-sm text-error-600">{{ error }}</p>
      </div>

      <Field
        label="Title"
        :helper-text="errors.title || 'Enter a descriptive title for the ticket'"
        :error-text="errors.title"
        :invalid="!!errors.title"
        required
      >
        <FieldInput
          v-model="title"
          type="text"
          placeholder="Fix login button bug"
          :disabled="isCreating"
          :invalid="!!errors.title"
          :valid="titleValid"
          @blur="titleAttrs.onBlur"
        />
      </Field>

      <Field
        label="Description"
        :helper-text="errors.description || 'Describe the ticket in detail (optional)'"
        :error-text="errors.description"
        :invalid="!!errors.description"
      >
        <FieldTextarea
          v-model="description"
          placeholder="The login button is not working properly..."
          :disabled="isCreating"
          :invalid="!!errors.description"
          :valid="descriptionValid"
          @blur="descriptionAttrs.onBlur"
        />
      </Field>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Status"
          :helper-text="errors.status || 'Select ticket status'"
          :error-text="errors.status"
          :invalid="!!errors.status"
        >
          <FieldSelect
            :items="statusOptions"
            :value="status ? [status] : []"
            placeholder="Select status"
            :disabled="isCreating"
            :invalid="!!errors.status"
            @value-change="
              (details) => {
                status = details.value[0] || ''
                statusAttrs.onBlur()
              }
            "
          />
        </Field>

        <Field
          label="Priority"
          :helper-text="errors.priority || 'Select ticket priority'"
          :error-text="errors.priority"
          :invalid="!!errors.priority"
        >
          <FieldSelect
            :items="priorityOptions"
            :value="priority ? [priority] : []"
            placeholder="Select priority"
            :disabled="isCreating"
            :invalid="!!errors.priority"
            @value-change="
              (details) => {
                priority = details.value[0] || ''
                priorityAttrs.onBlur()
              }
            "
          />
        </Field>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Type"
          :helper-text="errors.type || 'Enter ticket type (optional)'"
          :error-text="errors.type"
          :invalid="!!errors.type"
        >
          <FieldInput
            v-model="type"
            type="text"
            placeholder="Bug, Feature, Task..."
            :disabled="isCreating"
            :invalid="!!errors.type"
            @blur="typeAttrs.onBlur"
          />
        </Field>

        <Field
          label="Assignee"
          :helper-text="errors.assignee_id || 'Assign ticket to a team member'"
          :error-text="errors.assignee_id"
          :invalid="!!errors.assignee_id"
        >
          <FieldSelect
            :items="assigneeOptions"
            :value="assigneeId ? [assigneeId] : []"
            placeholder="Select assignee"
            :disabled="isCreating"
            :invalid="!!errors.assignee_id"
            @value-change="
              (details) => {
                assigneeId = details.value[0] || null
                assigneeIdAttrs.onBlur()
              }
            "
          />
        </Field>
      </div>

      <Field
        label="Due Date"
        :helper-text="errors.due_date || 'Set a due date for this ticket (optional)'"
        :error-text="errors.due_date"
        :invalid="!!errors.due_date"
      >
        <FieldInput
          v-model="dueDate"
          type="datetime-local"
          :disabled="isCreating"
          :invalid="!!errors.due_date"
          @blur="dueDateAttrs.onBlur"
        />
      </Field>
    </form>

    <template #footer>
      <Button type="button" variant="outline" :disabled="isCreating" @click="isOpen = false">
        Cancel
      </Button>
      <Button type="submit" form="create-ticket-form" :disabled="isCreating">
        {{ isCreating ? 'Creating...' : 'Create Ticket' }}
      </Button>
    </template>
  </Dialog>
</template>

