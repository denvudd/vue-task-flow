<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProject } from '@/composables/useProjects'
import { useProjectTickets, useCreateTicket, useUpdateTicket } from '@/composables/useTickets'
import { useAuth } from '@/composables/useAuth'
import {
  Button,
  Card,
  Dialog,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Field,
  FieldInput,
  FieldTextarea,
  FieldSelect,
  Editable,
  type SelectItem,
} from '@/components/ui'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft, Plus, Edit2, Calendar } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  createTicketSchema,
  updateTicketSchema,
  type CreateTicketForm,
  type UpdateTicketForm,
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
import type { Tables } from '@/types/supabase'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const projectId = computed(() => route.params.id as string)
const activeTab = ref('table')

const { data: project, isLoading, isError, error } = useProject(projectId)
const {
  data: tickets,
  isLoading: isLoadingTickets,
  refetch: refetchTickets,
} = useProjectTickets(projectId)

// Debug tickets
watch(
  tickets,
  (newTickets) => {
    console.log('[ProjectView] Tickets loaded:', newTickets)
    if (newTickets && newTickets.length > 0) {
      console.log('[ProjectView] First ticket:', newTickets[0])
      console.log('[ProjectView] First ticket title:', newTickets[0]?.title)
      console.log('[ProjectView] First ticket title type:', typeof newTickets[0]?.title)
    }
  },
  { immediate: true },
)

const { mutateAsync: createTicket, isPending: isCreating } = useCreateTicket()
const { mutateAsync: updateTicket, isPending: isUpdating } = useUpdateTicket()

// Dialog state
const isCreateDialogOpen = ref(false)
const isEditDialogOpen = ref(false)
const editingTicket = ref<Tables<'tickets'> | null>(null)
const hoveredRowId = ref<string | null>(null)

// Form for creating ticket
const {
  handleSubmit: handleCreateSubmit,
  errors: createErrors,
  defineField: defineCreateField,
  resetForm: resetCreateForm,
} = useForm({
  validationSchema: toTypedSchema(createTicketSchema),
  validateOnMount: false,
})

const [createTitle, createTitleAttrs] = defineCreateField('title')
const [createDescription, createDescriptionAttrs] = defineCreateField('description')
const [createStatus, createStatusAttrs] = defineCreateField('status')
const [createPriority, createPriorityAttrs] = defineCreateField('priority')
const [createType, createTypeAttrs] = defineCreateField('type')
const [createDueDate, createDueDateAttrs] = defineCreateField('due_date') as [
  Ref<string | undefined>,
  any,
]

// Form for editing ticket
const {
  handleSubmit: handleEditSubmit,
  errors: editErrors,
  defineField: defineEditField,
  resetForm: resetEditForm,
  setValues: setEditValues,
} = useForm({
  validationSchema: toTypedSchema(updateTicketSchema),
  validateOnMount: false,
})

const [editTitle, editTitleAttrs] = defineEditField('title')
const [editDescription, editDescriptionAttrs] = defineEditField('description')
const [editStatus, editStatusAttrs] = defineEditField('status')
const [editPriority, editPriorityAttrs] = defineEditField('priority')
const [editType, editTypeAttrs] = defineEditField('type')
const [editDueDate, editDueDateAttrs] = defineEditField('due_date') as [
  Ref<string | undefined>,
  any,
]

const errorMessage = computed(() => {
  if (!error.value) return null
  return error.value instanceof Error ? error.value.message : 'Failed to load project'
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}

const onCreateTicket = handleCreateSubmit(async (values) => {
  if (!user.value || !project.value) return

  try {
    await createTicket({
      title: values.title,
      description: values.description || null,
      status: values.status || TICKET_STATUSES.TODO,
      priority: values.priority || TICKET_PRIORITIES.MEDIUM,
      type: values.type || TICKET_TYPES.TASK,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      project_id: project.value.id,
      creator_id: user.value.id,
    })
    isCreateDialogOpen.value = false
    resetCreateForm()
    await refetchTickets()
  } catch (err) {
    console.error('Error creating ticket:', err)
  }
})

const onEditTicket = handleEditSubmit(async (values) => {
  if (!editingTicket.value) return

  try {
    await updateTicket({
      ticketId: editingTicket.value.id,
      updates: {
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        type: values.type,
        due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      },
    })
    isEditDialogOpen.value = false
    editingTicket.value = null
    resetEditForm()
    await refetchTickets()
  } catch (err) {
    console.error('Error updating ticket:', err)
  }
})

const openEditDialog = (ticket: Tables<'tickets'>) => {
  editingTicket.value = ticket
  setEditValues({
    title: ticket.title,
    description: ticket.description || '',
    status: (ticket.status || TICKET_STATUSES.TODO) as TicketStatus,
    priority: (ticket.priority || TICKET_PRIORITIES.MEDIUM) as TicketPriority,
    type: (ticket.type || TICKET_TYPES.TASK) as TicketType,
    due_date: ticket.due_date ? ticket.due_date.split('T')[0] : '',
  })
  isEditDialogOpen.value = true
}

const handleTitleUpdate = async (ticket: Tables<'tickets'>, newValue: string) => {
  if (!newValue.trim() || newValue === ticket.title) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { title: newValue },
    })
    await refetchTickets()
  } catch (err) {
    console.error('Error updating ticket title:', err)
  }
}

const handleStatusChange = async (
  ticket: Tables<'tickets'>,
  details: { items: SelectItem[]; value: string[] },
) => {
  const newStatus = details.value[0] as TicketStatus | undefined
  if (!newStatus || newStatus === ticket.status) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { status: newStatus },
    })
    await refetchTickets()
  } catch (err) {
    console.error('Error updating ticket status:', err)
  }
}

const handlePriorityChange = async (
  ticket: Tables<'tickets'>,
  details: { items: SelectItem[]; value: string[] },
) => {
  const newPriority = details.value[0] as TicketPriority | undefined
  if (!newPriority || newPriority === ticket.priority) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { priority: newPriority },
    })
    await refetchTickets()
  } catch (err) {
    console.error('Error updating ticket priority:', err)
  }
}

const handleTypeChange = async (
  ticket: Tables<'tickets'>,
  details: { items: SelectItem[]; value: string[] },
) => {
  const newType = details.value[0] as TicketType | undefined
  if (!newType || newType === ticket.type) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { type: newType },
    })
    await refetchTickets()
  } catch (err) {
    console.error('Error updating ticket type:', err)
  }
}

const getStatusLabel = (status: string | null) => {
  return TICKET_STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status || 'N/A'
}

const getPriorityLabel = (priority: string | null) => {
  return TICKET_PRIORITY_OPTIONS.find((opt) => opt.value === priority)?.label || priority || 'N/A'
}

const getTypeLabel = (type: string | null) => {
  return TICKET_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type || 'N/A'
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const handleCancelCreate = () => {
  isCreateDialogOpen.value = false
  resetCreateForm()
}

const handleCancelEdit = () => {
  isEditDialogOpen.value = false
  editingTicket.value = null
  resetEditForm()
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 p-4 md:p-8 pt-0 md:pt-0">
    <div class="mx-auto">
      <div>
        <Button variant="ghost" size="sm" @click="handleBack" class="mb-4">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="text-neutral-600">Loading project...</div>
      </div>

      <div v-else-if="isError" class="p-6 rounded-lg bg-error-50 border border-error-200">
        <div class="flex items-center flex-col gap-3">
          <span class="text-error-800 font-medium text-lg">Error loading project</span>
          <p class="text-error-600 text-sm text-center">{{ errorMessage }}</p>
          <Button variant="outline" @click="handleBack" class="mt-2"> Go to Dashboard </Button>
        </div>
      </div>

      <div v-else-if="project" class="space-y-6">
        <Card>
          <div class="space-y-6">
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <div class="flex items-center gap-3">
                  <h1 class="text-3xl font-bold text-neutral-900">{{ project.name }}</h1>
                  <span
                    v-if="project.key"
                    class="text-sm text-neutral-600 bg-primary-50 px-3 py-1 rounded font-medium"
                  >
                    {{ project.key }}
                  </span>
                </div>
                <p v-if="project.description" class="text-neutral-600 text-lg">
                  {{ project.description }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-neutral-900">Tickets</h2>
              <Button @click="isCreateDialogOpen = true">
                <Plus class="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>

            <Tabs v-model:value="activeTab" default-value="table">
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="board">Board</TabsTrigger>
              </TabsList>

              <TabsContent value="table">
                <div v-if="isLoadingTickets" class="flex justify-center items-center py-16">
                  <div class="text-neutral-600">Loading tickets...</div>
                </div>

                <div v-else-if="!tickets || tickets.length === 0" class="py-16 text-center">
                  <p class="text-neutral-600">No tickets yet. Create your first ticket!</p>
                </div>

                <div v-else class="overflow-x-auto">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="border-b border-neutral-200">
                        <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                          Title
                        </th>
                        <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                          Status
                        </th>
                        <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                          Priority
                        </th>
                        <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                          Type
                        </th>
                        <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="ticket in tickets"
                        :key="ticket.id"
                        class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors relative group"
                        @mouseenter="hoveredRowId = ticket.id"
                        @mouseleave="hoveredRowId = null"
                      >
                        <td class="py-3 px-4">
                          <div class="flex items-center gap-2">
                            <Button
                              v-if="hoveredRowId === ticket.id"
                              variant="ghost"
                              size="sm"
                              class="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              @click="openEditDialog(ticket)"
                            >
                              <Edit2 class="w-3 h-3" />
                            </Button>
                            <!-- Debug: ticket.title -->
                            <div v-if="!ticket.title" class="text-xs text-error-500">
                              DEBUG: No title (ID: {{ ticket.id }})
                            </div>
                            <Editable
                              :value="ticket.title"
                              :placeholder="`Enter title (current: ${ticket.title || 'empty'})`"
                              @value-commit="(e) => handleTitleUpdate(ticket, e.value)"
                            />
                          </div>
                        </td>
                        <td class="py-3 px-4">
                          <FieldSelect
                            :items="TICKET_STATUS_OPTIONS"
                            :value="ticket.status ? [ticket.status] : []"
                            @on-value-change="
                              (details: { items: SelectItem[]; value: string[] }) =>
                                handleStatusChange(ticket, details)
                            "
                            class="min-w-[120px]"
                          />
                        </td>
                        <td class="py-3 px-4">
                          <FieldSelect
                            :items="TICKET_PRIORITY_OPTIONS"
                            :value="ticket.priority ? [ticket.priority] : []"
                            @on-value-change="
                              (details: { items: SelectItem[]; value: string[] }) =>
                                handlePriorityChange(ticket, details)
                            "
                            class="min-w-[120px]"
                          />
                        </td>
                        <td class="py-3 px-4">
                          <FieldSelect
                            :items="TICKET_TYPE_OPTIONS"
                            :value="ticket.type ? [ticket.type] : []"
                            @on-value-change="
                              (details: { items: SelectItem[]; value: string[] }) =>
                                handleTypeChange(ticket, details)
                            "
                            class="min-w-[120px]"
                          />
                        </td>
                        <td class="py-3 px-4 text-sm text-neutral-600">
                          <div class="flex items-center gap-1">
                            <Calendar class="w-4 h-4" />
                            {{ formatDate(ticket.due_date) }}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="board">
                <div class="py-16 text-center">
                  <p class="text-neutral-600">Board view coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>

    <!-- Create Ticket Dialog -->
    <Dialog v-model:open="isCreateDialogOpen" size="lg">
      <template #title>Create New Ticket</template>
      <template #description>Fill in the details to create a new ticket</template>

      <form @submit.prevent="onCreateTicket" class="space-y-4">
        <Field label="Title" required :invalid="!!createErrors.title">
          <FieldInput
            v-model="createTitle"
            v-bind="createTitleAttrs"
            placeholder="Enter ticket title"
            :invalid="!!createErrors.title"
          />
          <template #errorText>{{ createErrors.title }}</template>
        </Field>

        <Field label="Description" :invalid="!!createErrors.description">
          <FieldTextarea
            v-model="createDescription"
            v-bind="createDescriptionAttrs"
            placeholder="Enter ticket description"
            :invalid="!!createErrors.description"
            autoresize
          />
          <template #errorText>{{ createErrors.description }}</template>
        </Field>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Status" :invalid="!!createErrors.status">
            <FieldSelect
              :items="TICKET_STATUS_OPTIONS"
              :value="createStatus ? [createStatus] : []"
              @on-value-change="
                (details: { items: SelectItem[]; value: string[] }) =>
                  (createStatus = (details.value[0] as TicketStatus) || '')
              "
              placeholder="Select status"
            />
            <template #errorText>{{ createErrors.status }}</template>
          </Field>

          <Field label="Priority" :invalid="!!createErrors.priority">
            <FieldSelect
              :items="TICKET_PRIORITY_OPTIONS"
              :value="createPriority ? [createPriority] : []"
              @on-value-change="
                (details: { items: SelectItem[]; value: string[] }) =>
                  (createPriority = (details.value[0] as TicketPriority) || '')
              "
              placeholder="Select priority"
            />
            <template #errorText>{{ createErrors.priority }}</template>
          </Field>

          <Field label="Type" :invalid="!!createErrors.type">
            <FieldSelect
              :items="TICKET_TYPE_OPTIONS"
              :value="createType ? [createType] : []"
              @on-value-change="
                (details: { items: SelectItem[]; value: string[] }) =>
                  (createType = (details.value[0] as TicketType) || '')
              "
              placeholder="Select type"
            />
            <template #errorText>{{ createErrors.type }}</template>
          </Field>
        </div>

        <Field label="Due Date" :invalid="!!createErrors.due_date">
          <FieldInput
            v-model="createDueDate"
            v-bind="createDueDateAttrs"
            type="date"
            :invalid="!!createErrors.due_date"
          />
          <template #errorText>{{ createErrors.due_date }}</template>
        </Field>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="handleCancelCreate"> Cancel </Button>
          <Button type="submit" @click="onCreateTicket" :disabled="isCreating">
            {{ isCreating ? 'Creating...' : 'Create Ticket' }}
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- Edit Ticket Dialog -->
    <Dialog v-model:open="isEditDialogOpen" size="lg">
      <template #title>Edit Ticket</template>
      <template #description>Update ticket details</template>

      <form @submit.prevent="onEditTicket" class="space-y-4">
        <Field label="Title" required :invalid="!!editErrors.title">
          <FieldInput
            v-model="editTitle"
            v-bind="editTitleAttrs"
            placeholder="Enter ticket title"
            :invalid="!!editErrors.title"
          />
          <template #errorText>{{ editErrors.title }}</template>
        </Field>

        <Field label="Description" :invalid="!!editErrors.description">
          <FieldTextarea
            v-model="editDescription"
            v-bind="editDescriptionAttrs"
            placeholder="Enter ticket description"
            :invalid="!!editErrors.description"
            autoresize
          />
          <template #errorText>{{ editErrors.description }}</template>
        </Field>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Status" :invalid="!!editErrors.status">
            <FieldSelect
              :items="TICKET_STATUS_OPTIONS"
              :value="editStatus ? [editStatus] : []"
              @on-value-change="
                (details: { items: SelectItem[]; value: string[] }) =>
                  (editStatus = (details.value[0] as TicketStatus) || '')
              "
              placeholder="Select status"
            />
            <template #errorText>{{ editErrors.status }}</template>
          </Field>

          <Field label="Priority" :invalid="!!editErrors.priority">
            <FieldSelect
              :items="TICKET_PRIORITY_OPTIONS"
              :value="editPriority ? [editPriority] : []"
              @on-value-change="
                (details: { items: SelectItem[]; value: string[] }) =>
                  (editPriority = (details.value[0] as TicketPriority) || '')
              "
              placeholder="Select priority"
            />
            <template #errorText>{{ editErrors.priority }}</template>
          </Field>

          <Field label="Type" :invalid="!!editErrors.type">
            <FieldSelect
              :items="TICKET_TYPE_OPTIONS"
              :value="editType ? [editType] : []"
              @on-value-change="
                (details: { items: SelectItem[]; value: string[] }) =>
                  (editType = (details.value[0] as TicketType) || '')
              "
              placeholder="Select type"
            />
            <template #errorText>{{ editErrors.type }}</template>
          </Field>
        </div>

        <Field label="Due Date" :invalid="!!editErrors.due_date">
          <FieldInput
            v-model="editDueDate"
            v-bind="editDueDateAttrs"
            type="date"
            :invalid="!!editErrors.due_date"
          />
          <template #errorText>{{ editErrors.due_date }}</template>
        </Field>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="handleCancelEdit"> Cancel </Button>
          <Button type="submit" @click="onEditTicket" :disabled="isUpdating">
            {{ isUpdating ? 'Updating...' : 'Update Ticket' }}
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
