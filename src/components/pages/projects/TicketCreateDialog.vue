<script setup lang="ts">
import { ref, type Ref } from 'vue'
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
  createTicketSchema,
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
import { useCreateTicket } from '@/composables/useTickets'
import { useAuth } from '@/composables/useAuth'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const { user } = useAuth()
const { mutateAsync: createTicket, isPending: isSubmitting } = useCreateTicket()

const isOpen = ref(false)

const {
  handleSubmit,
  errors,
  defineField,
  resetForm,
} = useForm({
  validationSchema: toTypedSchema(createTicketSchema),
  validateOnMount: false,
})

const [createTitle, createTitleAttrs] = defineField('title')
const [createDescription, createDescriptionAttrs] = defineField('description')
const [createStatus, createStatusAttrs] = defineField('status')
const [createPriority, createPriorityAttrs] = defineField('priority')
const [createType, createTypeAttrs] = defineField('type')
const [createDueDate, createDueDateAttrs] = defineField('due_date') as [
  Ref<string | undefined>,
  any,
]

const handleSubmitForm = handleSubmit(async (values) => {
  if (!user.value) {
    console.error('User not authenticated')
    return
  }

  try {
    await createTicket({
      title: values.title,
      description: values.description || null,
      status: values.status || TICKET_STATUSES.TODO,
      priority: values.priority || TICKET_PRIORITIES.MEDIUM,
      type: values.type || TICKET_TYPES.TASK,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      project_id: props.projectId,
      creator_id: user.value.id,
    })
    handleSuccess()
  } catch (err) {
    console.error('Error creating ticket:', err)
  }
})

const handleCancel = () => {
  isOpen.value = false
  resetForm()
}

const handleSuccess = () => {
  isOpen.value = false
  resetForm()
  emit('success')
}

const open = () => {
  isOpen.value = true
}

defineExpose({
  open,
})
</script>

<template>
  <Dialog v-model:open="isOpen" size="lg">
    <template #title>Create New Ticket</template>
    <template #description>Fill in the details to create a new ticket</template>

    <form @submit.prevent="handleSubmitForm" class="space-y-4">
      <Field label="Title" required :invalid="!!errors.title">
        <FieldInput
          v-model="createTitle"
          v-bind="createTitleAttrs"
          placeholder="Enter ticket title"
          :invalid="!!errors.title"
        />
        <template #errorText>{{ errors.title }}</template>
      </Field>

      <Field label="Description" :invalid="!!errors.description">
        <FieldTextarea
          v-model="createDescription"
          v-bind="createDescriptionAttrs"
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
            :value="createStatus ? [createStatus] : []"
            @on-value-change="
              (details: { items: SelectItem[]; value: string[] }) =>
                (createStatus = (details.value[0] as TicketStatus) || '')
            "
            placeholder="Select status"
          />
          <template #errorText>{{ errors.status }}</template>
        </Field>

        <Field label="Priority" :invalid="!!errors.priority">
          <FieldSelect
            :items="TICKET_PRIORITY_OPTIONS"
            :value="createPriority ? [createPriority] : []"
            @on-value-change="
              (details: { items: SelectItem[]; value: string[] }) =>
                (createPriority = (details.value[0] as TicketPriority) || '')
            "
            placeholder="Select priority"
          />
          <template #errorText>{{ errors.priority }}</template>
        </Field>

        <Field label="Type" :invalid="!!errors.type">
          <FieldSelect
            :items="TICKET_TYPE_OPTIONS"
            :value="createType ? [createType] : []"
            @on-value-change="
              (details: { items: SelectItem[]; value: string[] }) =>
                (createType = (details.value[0] as TicketType) || '')
            "
            placeholder="Select type"
          />
          <template #errorText>{{ errors.type }}</template>
        </Field>
      </div>

      <Field label="Due Date" :invalid="!!errors.due_date">
        <FieldInput
          v-model="createDueDate"
          v-bind="createDueDateAttrs"
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
          {{ isSubmitting ? 'Creating...' : 'Create Ticket' }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
