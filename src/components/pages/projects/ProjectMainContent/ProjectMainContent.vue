<script setup lang="ts">
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { TicketsTable } from '@/components/pages/projects/ProjectMainContent/TicketsTable'
import TicketCreateDialog from './TicketCreateDialog.vue'
import { useAuth } from '@/composables/useAuth'
import { useProjectContext } from '@/composables/useProjectContext'
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
import ProjectMainContentAccessDenied from './ProjectMainContentAccessDenied.vue'
import ProjectBackToDashboard from './ProjectBackToDashboard.vue'
import { SquareKanban, Table as TableIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { createToast } = useToast()

const projectId = computed(() => route.params.id as string)
const activeTab = ref('table')

const { isAuthenticated } = useAuth()
const { project, isLoading, isError, error, hasUserAccess, isOwner, isSidebarOpen } =
  useProjectContext()
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

const errorMessage = computed(() => {
  if (!error.value) return null
  return error.value instanceof Error ? error.value.message : 'Failed to load project'
})
</script>

<template>
  <div
    class="grow-0 shrink flex flex-col z-1 h-full max-h-full relative"
    :class="{ 'w-1/2': isSidebarOpen }"
  >
    <div class="contents">
      <div class="z-1 flex flex-col grow relative overflow-auto transition-all duration-300 py-4">
        <ProjectBackToDashboard v-if="isAuthenticated && hasUserAccess" />
        <ProjectMainContentLoader v-if="isLoading" />
        <ProjectMainContentError v-else-if="isError" :error-message="errorMessage" />
        <ProjectMainContentAccessDenied v-else-if="project && !hasUserAccess" />
        <template v-else-if="project && hasUserAccess">
          <ProjectMainContentInfo
            :project-id="project.id"
            :project-key="project.key"
            :name="project.name"
            :description="project.description"
            :is-owner="isOwner"
            :owner-id="project.owner_id"
          />

          <Tabs v-model:value="activeTab" default-value="table" class="contents">
            <div
              class="ps-24 pe-4"
              :class="{ 'shrink-0 z-86': isSidebarOpen }"
              :style="{
                insetInlineStart: isSidebarOpen ? '0' : 'auto',
                position: isSidebarOpen ? 'sticky' : 'relative',
              }"
            >
              <div
                class="w-full flex items-center"
                :style="{
                  insetInlineStart: isSidebarOpen ? '96px' : 'auto',
                }"
              >
                <div class="flex items-center justify-between w-full">
                  <TabsList>
                    <TabsTrigger value="table">
                      <TableIcon class="size-4" />
                      Table
                    </TabsTrigger>
                    <TabsTrigger value="board">
                      <SquareKanban class="size-4" />
                      Board
                    </TabsTrigger>
                  </TabsList>
                  <TicketCreateDialog v-if="project" :tickets="tickets" :project-id="project.id" />
                </div>
              </div>
            </div>

            <TabsContent value="table" class="grow shrink-0 flex flex-col relative">
              <TicketsTable
                :tickets="tickets"
                :is-loading="isLoadingTickets"
                :project-id="projectId"
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
        </template>
      </div>
    </div>
  </div>
</template>
