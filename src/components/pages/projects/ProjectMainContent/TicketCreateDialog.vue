<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  Dialog,
  Field,
  FieldInput,
  FieldTextarea,
  TicketStatusSelect,
  TicketPrioritySelect,
  TicketTypeSelect,
  Button,
} from '@/components/ui'
import { createTicketSchema } from '@/validation/projects'
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from '@/constants/tickets'
import { useCreateTicket, useProjectTickets } from '@/composables/useTickets'
import { useAuth } from '@/composables/useAuth'
import { Plus } from 'lucide-vue-next'

interface Props {
  projectId?: string
}

const props = defineProps<Props>()
const route = useRoute()

const projectId = computed(() => {
  return props.projectId || (route.params.id as string)
})

const { user } = useAuth()
const { mutateAsync: createTicket, isPending: isSubmitting } = useCreateTicket()
const { refetch: refetchTickets } = useProjectTickets(projectId)

const isOpen = ref(false)

const { handleSubmit, errors, defineField, resetForm } = useForm({
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

const DEFAULT_PROJECT_DESCRIPTION = `<h2>Task description</h2><p>Provide an overview of the task and related details.</p><h2>Sub-tasks</h2><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Task 1</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Task 2</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Task 3</p></div></li></ul><p></p><p></p>`

const handleSubmitForm = handleSubmit(async (values) => {
  if (!user.value) {
    console.error('User not authenticated')
    return
  }

  try {
    await createTicket({
      title: values.title,
      description: values.description || DEFAULT_PROJECT_DESCRIPTION,
      status: values.status || TICKET_STATUSES.TODO,
      priority: values.priority || TICKET_PRIORITIES.MEDIUM,
      type: values.type || TICKET_TYPES.TASK,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      project_id: projectId.value,
      creator_id: user.value.id,
    })
    await refetchTickets()
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
}

const open = () => {
  isOpen.value = true
}
</script>

<template>
  <div>
    <slot name="trigger" :open="open">
      <Button size="sm" @click="open">
        <Plus class="w-4 h-4 mr-1" />
        New
      </Button>
    </slot>

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
            <TicketStatusSelect
              :value="createStatus"
              :invalid="!!errors.status"
              @update:value="(val) => (createStatus = val || undefined)"
            />
            <template #errorText>{{ errors.status }}</template>
          </Field>

          <Field label="Priority" :invalid="!!errors.priority">
            <TicketPrioritySelect
              :value="createPriority"
              :invalid="!!errors.priority"
              @update:value="(val) => (createPriority = val || undefined)"
            />
            <template #errorText>{{ errors.priority }}</template>
          </Field>

          <Field label="Type" :invalid="!!errors.type">
            <TicketTypeSelect
              :value="createType"
              :invalid="!!errors.type"
              @update:value="(val) => (createType = val || undefined)"
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
  </div>
</template>
