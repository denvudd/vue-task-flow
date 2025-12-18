<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { useProjectContext } from '@/composables/useProjectContext'
import { Button } from '@/components/ui/atoms'
import TicketDetailsSidebarLoader from '@/components/pages/projects/TicketDetailsSidebar/TicketDetailsSidebarLoader.vue'
import TicketDetailsSidebarNotFound from '@/components/pages/projects/TicketDetailsSidebar/TicketDetailsSidebarNotFound.vue'
import TicketDetailsSidebarTitle from '@/components/pages/projects/TicketDetailsSidebar/TicketDetailsSidebarTitle.vue'
import TicketDetailsSidebarPanel from '@/components/pages/projects/TicketDetailsSidebar/TicketDetailsSidebarPanel.vue'
import TicketDetailsSidebarContent from '@/components/pages/projects/TicketDetailsSidebar/TicketDetailsSidebarContent.vue'
import { TicketComments } from '@/components/pages/projects/TicketDetailsSidebar/TicketComments'
import { ROUTES } from '@/lib/routing'
import TicketDetailsSidebarHeader from '@/components/pages/projects/TicketDetailsSidebar/TicketDetailsSidebarHeader.vue'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.projectId as string)
const ticketId = computed(() => route.params.ticketId as string)

const { ticket, isLoadingTicket, openTicket, closeTicket, currentTicketId } = useTicketDetails()
const { setProject } = useProjectContext()

// Initialize project and ticket on mount
onMounted(() => {
  if (projectId.value) {
    setProject(projectId.value, null)
  }
})

// Watch for changes in route params and open the ticket
watch(
  [ticketId, projectId],
  ([newTicketId, newProjectId]) => {
    if (newTicketId && newProjectId) {
      openTicket(newTicketId, newProjectId)
    }
  },
  { immediate: true },
)

// Clean up when leaving the page
onUnmounted(() => {
  if (currentTicketId.value === ticketId.value) {
    closeTicket()
  }
})

const handleGoBack = () => {
  closeTicket()
  router.push(ROUTES.Project(projectId.value))
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Ticket content -->
      <div class="">
        <TicketDetailsSidebarLoader v-if="isLoadingTicket" />
        <TicketDetailsSidebarNotFound
          v-else-if="!isLoadingTicket && !ticket"
          :project-id="projectId"
        />
        <template v-else-if="ticket">
          <TicketDetailsSidebarHeader @close="handleGoBack" page-view />
          <div class="px-3">
            <TicketDetailsSidebarTitle />
          </div>
          <div class="space-y-6 animate-in fade-in duration-300 px-3">
            <TicketDetailsSidebarPanel />
            <TicketComments />
            <TicketDetailsSidebarContent />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
