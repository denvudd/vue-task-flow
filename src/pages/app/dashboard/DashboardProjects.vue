<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUserProjects } from '@/composables/useProjects'
import { Card } from '@/components/ui'
import { SquareKanban, Ban, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui'
import { useRouter, RouterLink } from 'vue-router'
import { ROUTES } from '@/lib/routing'

const { user } = useAuth()
const router = useRouter()

const {
  data: projects,
  isLoading: projectsLoading,
  isError: hasProjectsError,
  error: projectsError,
  refetch: refetchProjects,
} = useUserProjects(computed(() => user.value?.id))

const errorMessage = computed(() => {
  if (!projectsError.value) return null
  return projectsError.value instanceof Error
    ? projectsError.value.message
    : 'Failed to load projects'
})

const handleRefreshProjects = () => {
  refetchProjects()
}
</script>

<template>
  <Card>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold text-neutral-900">Projects</h3>

        <Button size="sm" variant="outline" @click="router.push(ROUTES.CreateProject)">
          <Plus class="w-4 h-4 mr-2" />Create
        </Button>
      </div>

      <div v-if="projectsLoading && !projects" class="flex justify-center items-center py-8">
        <div class="text-neutral-600">Loading projects...</div>
      </div>

      <div
        v-else-if="hasProjectsError"
        class="text-center py-8 bg-error-50 border border-error-200 rounded-lg"
      >
        <div class="flex items-center flex-col gap-3">
          <Ban class="w-12 h-12 mx-auto text-error-600" />
          <span class="text-error-800 font-medium">Error loading projects</span>
        </div>
        <p class="text-error-600 text-sm mt-1 text-center mx-auto">{{ errorMessage }}</p>
        <Button variant="outline" @click="handleRefreshProjects" class="mt-4">Refresh</Button>
      </div>

      <div v-else-if="!projects || projects.length === 0" class="text-center py-8">
        <SquareKanban class="w-12 h-12 mx-auto text-neutral-400 mb-3" />
        <p class="text-neutral-600 mb-2 font-medium">No projects yet</p>
        <p class="text-neutral-500 text-sm">Create your first project to get started</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouterLink
          v-for="project in projects"
          :to="ROUTES.Project(project.id)"
          :key="project.id"
          class="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-neutral-900 text-lg">{{ project.name }}</h4>
              <span class="text-xs text-neutral-500 bg-primary-50 px-2 py-1 rounded font-medium">
                {{ project.key }}
              </span>
            </div>
            <p v-if="project.description" class="text-neutral-600 text-sm line-clamp-2">
              {{ project.description }}
            </p>
            <div class="flex items-center justify-between pt-2 border-t border-neutral-100">
              <span class="text-xs text-neutral-500">
                Created
                {{
                  project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'
                }}
              </span>
              <span
                v-if="project.owner_id === user?.id"
                class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded"
              >
                Owner
              </span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </Card>
</template>
