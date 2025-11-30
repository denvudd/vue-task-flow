<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProject } from '@/composables/useProjects'
import { useProjectTickets, useUpdateTicket } from '@/composables/useTickets'
import { useAuth } from '@/composables/useAuth'
import { useJoinProjectViaInvite } from '@/composables/useInvites'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { reorderTickets } from '@/api/tickets'
import { Button, Card, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import TicketsTable from '@/components/pages/projects/TicketsTable.vue'
import TicketCreateDialog from '@/components/pages/projects/TicketCreateDialog.vue'
import { TicketDetailsSidebar } from '@/components/pages/projects/TicketDetailsSidebar'
import ProjectInviteLinksDialog from '@/components/pages/projects/ProjectInviteLinksDialog.vue'
import ProjectMembersDialog from '@/components/pages/projects/ProjectMembersDialog.vue'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft } from 'lucide-vue-next'
import { type TicketStatus, type TicketPriority, type TicketType } from '@/constants/tickets'
import { PROJECT_ROLES, PROJECT_ROLE_LABELS } from '@/constants/projects'
import type { Tables } from '@/types/supabase'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { user, isAuthenticated } = useAuth()
const { createToast } = useToast()

const projectId = computed(() => route.params.id as string)
const activeTab = ref('table')
const isProcessingInvite = ref(false)

const { data: project, isLoading, isError, error, refetch: refetchProject } = useProject(projectId)
const { data: tickets, isLoading: isLoadingTickets } = useProjectTickets(projectId)
const { mutateAsync: updateTicket } = useUpdateTicket()
const { mutateAsync: joinProjectViaInvite } = useJoinProjectViaInvite()

// Ticket details store
const { currentTicketId, openTicket, closeTicket } = useTicketDetails()

// Sidebar state for ticket details - sync with route query
const selectedTicketId = computed(() => {
  const ticketParam = route.query.ticket
  return typeof ticketParam === 'string' ? ticketParam : undefined
})

// Sync route query with store
watch(
  selectedTicketId,
  (ticketId) => {
    if (ticketId && projectId.value) {
      openTicket(ticketId, projectId.value)
    } else {
      closeTicket()
    }
  },
  { immediate: true },
)

// Sync store with route query (when store changes externally)
watch(currentTicketId, (ticketId) => {
  const queryTicketId = selectedTicketId.value
  if (ticketId !== queryTicketId) {
    const query = { ...route.query }
    if (ticketId) {
      query.ticket = ticketId
    } else {
      delete query.ticket
    }
    router.replace({ query })
  }
})

const isSidebarOpen = computed(() => !!currentTicketId.value)

const closeSidebar = () => {
  closeTicket()
  const query = { ...route.query }
  delete query.ticket
  router.push({ query })
}

const errorMessage = computed(() => {
  if (!error.value) return null
  return error.value instanceof Error ? error.value.message : 'Failed to load project'
})

// Check if user has access to the project
const hasAccess = computed(() => {
  if (!project.value) return false

  const projectData = project.value

  // Check if project is public - allow access regardless of authentication
  if (projectData.visibility === 'public') {
    return true
  }

  // For non-public projects, user must be authenticated
  if (!user.value) return false

  const userId = user.value.id

  // Check if user is the owner
  if (projectData.owner_id === userId) {
    return true
  }

  // Check if user is a member
  const members = projectData.members as Array<{ user_id: string }> | null
  if (members && Array.isArray(members)) {
    return members.some((member) => member.user_id === userId)
  }

  return false
})

// Check if user is the owner of the project
const isOwner = computed(() => {
  if (!project.value || !user.value) return false
  return project.value.owner_id === user.value.id
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}

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

// Handle invite link token
const handleInviteToken = async () => {
  const inviteToken = route.query.invite as string | undefined

  if (!inviteToken || isProcessingInvite.value) {
    return
  }

  isProcessingInvite.value = true

  try {
    // Check if user needs to be authenticated
    // For viewer role, authentication might not be required (handled by access check)
    // For commenter and editor, authentication is required
    if (!user.value) {
      // Redirect to login with the current path as redirect
      router.push({
        name: 'Login',
        query: { redirect: route.fullPath },
      })
      return
    }

    // User is authenticated, try to join the project
    const result = await joinProjectViaInvite({
      token: inviteToken,
      userId: user.value.id,
    })

    // Remove invite token from URL
    const query = { ...route.query }
    delete query.invite
    await router.replace({ query })

    // Show success message based on the result
    if (result.status === 'joined') {
      createToast({
        title: 'Welcome to the project!',
        description: `You've joined as ${PROJECT_ROLE_LABELS[result.role]}`,
        type: 'success',
      })
    } else if (result.status === 'role_upgraded') {
      createToast({
        title: 'Role upgraded',
        description: `Your role has been upgraded to ${PROJECT_ROLE_LABELS[result.role]}`,
        type: 'success',
      })
    } else if (result.status === 'already_member') {
      createToast({
        title: 'Already a member',
        description: 'You already have access to this project',
        type: 'info',
      })
    }

    // Refetch project to update access
    await refetchProject()
  } catch (err: any) {
    console.error('Failed to join project via invite:', err)

    // Remove invite token from URL even on error
    const query = { ...route.query }
    delete query.invite
    await router.replace({ query })

    createToast({
      title: 'Invalid invite link',
      description: err?.message || 'This invite link is invalid or has expired',
      type: 'error',
    })
  } finally {
    isProcessingInvite.value = false
  }
}

// Process invite token when component mounts and when user logs in
onMounted(() => {
  handleInviteToken()
})

// Watch for authentication changes (user logging in)
watch(
  () => user.value,
  (newUser) => {
    if (newUser && route.query.invite) {
      handleInviteToken()
    }
  },
)
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex flex-col">
    <!-- Back button (outside flex layout) -->

    <!-- Main flex container -->
    <div class="flex flex-1 overflow-hidden pb-8">
      <!-- Main content area -->
      <div
        class="flex-1 overflow-y-auto pt-0 transition-all duration-300 px-4 sm:px-6 lg:px-8"
        :class="{ 'pr-2': isSidebarOpen }"
      >
        <div v-if="isAuthenticated && hasAccess">
          <Button variant="ghost" size="sm" @click="handleBack" class="my-4">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div class="mx-auto">
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

          <div
            v-else-if="project && !hasAccess"
            class="p-6 rounded-lg bg-warning-50 border border-warning-200"
          >
            <div class="flex items-center flex-col gap-3">
              <span class="text-warning-800 font-medium text-lg">Access Denied</span>
              <p class="text-warning-600 text-sm text-center">
                This project is not public and you are not a member or owner of this project.
              </p>
              <Button variant="outline" @click="handleBack" class="mt-2"> Go to Dashboard </Button>
            </div>
          </div>

          <div v-else-if="project && hasAccess" class="space-y-6">
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

                  <div v-if="isOwner && project && user" class="flex items-center gap-2">
                    <ProjectMembersDialog
                      :project-id="project.id"
                      :project-name="project.name"
                      :current-user-id="user.id"
                      :owner-id="project.owner_id"
                    />
                    <ProjectInviteLinksDialog
                      :project-id="project.id"
                      :project-name="project.name"
                    />
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

      <!-- Ticket Details Sidebar -->
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-if="isSidebarOpen && currentTicketId"
          class="w-1/2 border-l border-neutral-200 bg-white overflow-hidden flex flex-col"
        >
          <TicketDetailsSidebar
            :ticket-id="currentTicketId"
            :project-id="projectId"
            @close="closeSidebar"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>
