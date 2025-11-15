<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProject } from '@/composables/useProjects'
import { useProjectTickets, useUpdateTicket } from '@/composables/useTickets'
import { reorderTickets } from '@/api/tickets'
import { Button, Card, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import TicketsTable from '@/components/pages/projects/TicketsTable.vue'
import TicketCreateDialog from '@/components/pages/projects/TicketCreateDialog.vue'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft } from 'lucide-vue-next'
import {
  TICKET_STATUS_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_TYPE_OPTIONS,
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
const { data: tickets, isLoading: isLoadingTickets } = useProjectTickets(projectId)

const { mutateAsync: updateTicket } = useUpdateTicket()

const errorMessage = computed(() => {
  if (!error.value) return null
  return error.value instanceof Error ? error.value.message : 'Failed to load project'
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}

const handleTitleUpdate = async (ticket: Tables<'tickets'>, newValue: string) => {
  if (!newValue.trim() || newValue === ticket.title) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { title: newValue },
    })
    // Realtime will automatically update the tickets list
  } catch (err) {
    console.error('Error updating ticket title:', err)
  }
}

const handleStatusChange = async (payload: {
  ticket: Tables<'tickets'>
  value: TicketStatus | null
}) => {
  const { ticket, value: newStatus } = payload
  if (!newStatus || newStatus === ticket.status) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { status: newStatus },
    })
    // Realtime will automatically update the tickets list
  } catch (err) {
    console.error('Error updating ticket status:', err)
  }
}

const handlePriorityChange = async (payload: {
  ticket: Tables<'tickets'>
  value: TicketPriority | null
}) => {
  const { ticket, value: newPriority } = payload
  if (!newPriority || newPriority === ticket.priority) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { priority: newPriority },
    })
    // Realtime will automatically update the tickets list
  } catch (err) {
    console.error('Error updating ticket priority:', err)
  }
}

const handleTypeChange = async (payload: {
  ticket: Tables<'tickets'>
  value: TicketType | null
}) => {
  const { ticket, value: newType } = payload
  if (!newType || newType === ticket.type) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { type: newType },
    })
    // Realtime will automatically update the tickets list
  } catch (err) {
    console.error('Error updating ticket type:', err)
  }
}

const handleTableTitleUpdate = ({ ticket, value }: { ticket: Tables<'tickets'>; value: string }) =>
  handleTitleUpdate(ticket, value)

const handleTableStatusUpdate = (payload: {
  ticket: Tables<'tickets'>
  value: TicketStatus | null
}) => handleStatusChange(payload)

const handleTablePriorityUpdate = (payload: {
  ticket: Tables<'tickets'>
  value: TicketPriority | null
}) => handlePriorityChange(payload)

const handleTableTypeUpdate = (payload: { ticket: Tables<'tickets'>; value: TicketType | null }) =>
  handleTypeChange(payload)

const handleReorder = async (payload: { tickets: Tables<'tickets'>[] }) => {
  try {
    const ticketUpdates = payload.tickets.map((ticket, index) => ({
      id: ticket.id,
      order_index: index,
    }))

    await reorderTickets(ticketUpdates)
    // Realtime will automatically update the tickets list
  } catch (err) {
    console.error('Error reordering tickets:', err)
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
              <TicketCreateDialog v-if="project" :project-id="project.id" />
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
                  @update:title="handleTableTitleUpdate"
                  @update:status="handleTableStatusUpdate"
                  @update:priority="handleTablePriorityUpdate"
                  @update:type="handleTableTypeUpdate"
                  @reorder="handleReorder"
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
  </div>
</template>
