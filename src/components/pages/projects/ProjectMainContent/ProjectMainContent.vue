<script setup lang="ts">
import { Tabs, TabsContent } from '@/components/ui'
import { TicketsTable } from '@/components/pages/projects/ProjectMainContent/TicketsTable'
import { useAuth } from '@/composables/useAuth'
import { useProjectContext } from '@/composables/useProjectContext'
import { useProjectTickets } from '@/composables/useTickets'
import { reorderTickets } from '@/api/tickets'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { ref } from 'vue'
import type { Tables } from '@/types/supabase'
import ProjectMainContentLoader from './ProjectMainContentLoader.vue'
import ProjectMainContentError from './ProjectMainContentError.vue'
import { ProjectMainContentInfo } from './ProjectMainContentInfo'
import ProjectMainContentAccessDenied from './ProjectMainContentAccessDenied.vue'
import ProjectBackToDashboard from './ProjectBackToDashboard.vue'
import { ProjectTabsList } from './ProjectTabsList'

const route = useRoute()

const projectId = computed(() => route.params.id as string)
const activeTab = ref('table')

const { isAuthenticated } = useAuth()
const { project, isLoading, isError, error, hasUserAccess, isOwner, isSidebarOpen } =
  useProjectContext()
const {
  data: tickets,
  isLoading: isLoadingTickets,
  isLoadingMore,
  hasMore,
  loadMore,
} = useProjectTickets(projectId, { pageSize: 10 })

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
    class="grow-0 shrink flex flex-col z-1 h-full max-h-full relative overflow-auto isolation-auto"
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
            <ProjectTabsList v-if="project" :tickets="tickets" />

            <TabsContent value="table" class="grow shrink-0 flex flex-col relative">
              <TicketsTable
                :tickets="tickets"
                :is-loading="isLoadingTickets"
                :is-loading-more="isLoadingMore"
                :has-more="hasMore"
                :load-more="loadMore"
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
