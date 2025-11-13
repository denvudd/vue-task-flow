<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProject } from '@/composables/useProjects'
import { useProjectTickets, useUpdateTicket } from '@/composables/useTickets'
import {
  Button,
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type SelectItem,
} from '@/components/ui'
import TicketsTable from '@/components/pages/projects/TicketsTable.vue'
import TicketCreateDialog from '@/components/pages/projects/TicketCreateDialog.vue'
import TicketEditDialog from '@/components/pages/projects/TicketEditDialog.vue'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft, Plus } from 'lucide-vue-next'
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

const projectId = computed(() => route.params.id as string)
const activeTab = ref('table')

const { data: project, isLoading, isError, error } = useProject(projectId)
const {
  data: tickets,
  isLoading: isLoadingTickets,
  refetch: refetchTickets,
} = useProjectTickets(projectId)

const { mutateAsync: updateTicket } = useUpdateTicket()

const createDialogRef = ref<InstanceType<typeof TicketCreateDialog> | null>(null)
const editDialogRef = ref<InstanceType<typeof TicketEditDialog> | null>(null)

const errorMessage = computed(() => {
  if (!error.value) return null
  return error.value instanceof Error ? error.value.message : 'Failed to load project'
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}

const openCreateDialog = () => {
  createDialogRef.value?.open()
}

const openEditDialog = (ticket: Tables<'tickets'>) => {
  editDialogRef.value?.open(ticket)
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

const handleTypeChange = async (ticket: Tables<'tickets'>, details: { items: SelectItem[]; value: string[] }) => {
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

const handleTableTitleUpdate = ({ ticket, value }: { ticket: Tables<'tickets'>; value: string }) =>
  handleTitleUpdate(ticket, value)

const handleTableStatusUpdate = ({
  ticket,
  details,
}: {
  ticket: Tables<'tickets'>
  details: { items: SelectItem[]; value: string[] }
}) => handleStatusChange(ticket, details)

const handleTablePriorityUpdate = ({
  ticket,
  details,
}: {
  ticket: Tables<'tickets'>
  details: { items: SelectItem[]; value: string[] }
}) => handlePriorityChange(ticket, details)

const handleTableTypeUpdate = ({
  ticket,
  details,
}: {
  ticket: Tables<'tickets'>
  details: { items: SelectItem[]; value: string[] }
}) => handleTypeChange(ticket, details)

const getStatusLabel = (status: string | null) => {
  return TICKET_STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status || 'N/A'
}

const getPriorityLabel = (priority: string | null) => {
  return TICKET_PRIORITY_OPTIONS.find((opt) => opt.value === priority)?.label || priority || 'N/A'
}

const getTypeLabel = (type: string | null) => {
  return TICKET_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type || 'N/A'
}

const handleCreateSuccess = () => {
  // Dialog handles everything itself, just refetch tickets
  refetchTickets()
}

const handleEditSuccess = () => {
  // Dialog handles everything itself, just refetch tickets
  refetchTickets()
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
              <Button @click="openCreateDialog">
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
                <TicketsTable
                  :tickets="tickets"
                  :is-loading="isLoadingTickets"
                  :status-options="TICKET_STATUS_OPTIONS"
                  :priority-options="TICKET_PRIORITY_OPTIONS"
                  :type-options="TICKET_TYPE_OPTIONS"
                  @update:title="handleTableTitleUpdate"
                  @update:status="handleTableStatusUpdate"
                  @update:priority="handleTablePriorityUpdate"
                  @update:type="handleTableTypeUpdate"
                  @edit="openEditDialog"
                />
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

    <TicketCreateDialog
      v-if="project"
      ref="createDialogRef"
      :project-id="project.id"
      @success="handleCreateSuccess"
    />

    <TicketEditDialog
      ref="editDialogRef"
      @success="handleEditSuccess"
    />
  </div>
</template>
