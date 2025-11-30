<script setup lang="ts">
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { TicketsTable } from '@/components/pages/projects/ProjectMainContent/TicketsTable'
import TicketCreateDialog from './TicketCreateDialog.vue'
import { useAuth } from '@/composables/useAuth'
import { useProject } from '@/composables/useProjects'
import { useProjectTickets } from '@/composables/useTickets'
import { useUpdateTicket } from '@/composables/useTickets'
import { reorderTickets } from '@/api/tickets'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { computed } from 'vue'
import { ROUTES } from '@/lib/routing'
import { ref } from 'vue'
import type { Tables } from '@/types/supabase'
import type { TicketPriority, TicketStatus, TicketType } from '@/constants/tickets'
import ProjectMainContentLoader from './ProjectMainContentLoader.vue'
import ProjectMainContentError from './ProjectMainContentError.vue'
import { ProjectMainContentInfo } from './ProjectMainContentInfo'

interface Props {
  hasUserAccess: boolean
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()
const { createToast } = useToast()

const projectId = computed(() => route.params.id as string)
const activeTab = ref('table')

const { user, isAuthenticated } = useAuth()
const { data: project, isLoading, isError, error, refetch: refetchProject } = useProject(projectId)
const { data: tickets, isLoading: isLoadingTickets } = useProjectTickets(projectId)
const { mutateAsync: updateTicket } = useUpdateTicket()

const handleTitleUpdate = async (ticket: Tables<'tickets'>, newValue: string) => {
  if (!isAuthenticated) {
    createToast({
      title: 'You must be logged in to update a ticket',
      type: 'warning',
    })
    return
  }
  if (!newValue.trim() || newValue === ticket.title) return

  try {
    await updateTicket({
      ticketId: ticket.id,
      updates: { title: newValue },
    })
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
  } catch (err) {
    console.error('Error reordering tickets:', err)
  }
}

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}

const isSidebarOpen = computed(() => !!route.query.ticket)

const errorMessage = computed(() => {
  if (!error.value) return null
  return error.value instanceof Error ? error.value.message : 'Failed to load project'
})

const isOwner = computed(() => {
  if (!project.value || !user.value) return false
  return project.value.owner_id === user.value.id
})
</script>

<template>
  <div
    class="flex-1 overflow-y-auto transition-all duration-300 p-4"
    :class="{ 'pr-2': isSidebarOpen }"
  >
    <ProjectBackToDashboard v-if="isAuthenticated && hasUserAccess" />
    <div class="mx-auto">
      <ProjectMainContentLoader v-if="isLoading" />
      <ProjectMainContentError v-else-if="isError" :error-message="errorMessage" />
      <ProjectMainContentAccessDenied v-else-if="project && !hasUserAccess" />

      <div v-else-if="project && hasUserAccess" class="space-y-6">
        <ProjectMainContentInfo
          :project-id="project.id"
          :project-key="project.key"
          :name="project.name"
          :description="project.description"
          :is-owner="isOwner"
          :owner-id="project.owner_id"
        />

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
