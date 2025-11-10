<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProject } from '@/composables/useProjects'
import { useProjectTickets } from '@/composables/useTickets'
import {
  Button,
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
} from '@/components/ui'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft } from 'lucide-vue-next'
import CreateTicketDialog from './components/CreateTicketDialog.vue'
import TicketsTable from './components/TicketsTable.vue'
import TicketsKanbanBoard from './components/TicketsKanbanBoard.vue'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => route.params.id as string)

const { data: project, isLoading, isError, error } = useProject(projectId)
const {
  data: tickets,
  isLoading: ticketsLoading,
  refetch: refetchTickets,
} = useProjectTickets(projectId)

const isCreateDialogOpen = ref(false)
const activeTab = ref('table')

const errorMessage = computed(() => {
  if (!error.value) return null
  return error.value instanceof Error ? error.value.message : 'Failed to load project'
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}

const handleCreateTicket = () => {
  isCreateDialogOpen.value = true
}

const handleTicketCreated = () => {
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
          <Tabs v-model:value="activeTab" default-value="table">
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsIndicator />
            </TabsList>
            <TabsContent value="table">
              <TicketsTable
                :tickets="tickets || []"
                :project-id="projectId"
                :is-loading="ticketsLoading"
                @create="handleCreateTicket"
              />
            </TabsContent>
            <TabsContent value="board">
              <TicketsKanbanBoard
                :tickets="tickets || []"
                :project-id="projectId"
                :is-loading="ticketsLoading"
                @create="handleCreateTicket"
                @ticket-updated="refetchTickets"
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <CreateTicketDialog
        v-if="project"
        v-model:open="isCreateDialogOpen"
        :project-id="projectId"
        :project-members="project.members"
        @ticket-created="handleTicketCreated"
      />
    </div>
  </div>
</template>
