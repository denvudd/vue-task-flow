<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUserProjects, useDeleteProject } from '@/composables/useProjects'
import { useI18n } from 'vue-i18n'
import { Card, Dialog } from '@/components/ui'
import { SquareKanban, Ban, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui'
import { useRouter, RouterLink } from 'vue-router'
import { ROUTES } from '@/lib/routing'
import { useToast } from '@/composables/useToast'

const { user } = useAuth()
const router = useRouter()
const { t } = useI18n()
const { createToast } = useToast()

const {
  data: projects,
  isLoading: projectsLoading,
  isError: hasProjectsError,
  error: projectsError,
  refetch: refetchProjects,
} = useUserProjects(computed(() => user.value?.id))

const deleteProjectMutation = useDeleteProject()

const ownedProjects = computed(() =>
  (projects.value || []).filter((project) => project.owner_id === user.value?.id),
)

const sharedProjects = computed(() =>
  (projects.value || []).filter((project) => project.owner_id !== user.value?.id),
)

const errorMessage = computed(() => {
  if (!projectsError.value) return null
  return projectsError.value instanceof Error
    ? projectsError.value.message
    : t('projects.errorLoading')
})

// Delete dialog state
const showDeleteDialog = ref(false)
const projectToDelete = ref<string | null>(null)

const handleRefreshProjects = () => {
  refetchProjects()
}

const handleEditProject = (projectId: string, event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  router.push(ROUTES.EditProject(projectId))
}

const handleDeleteProject = (projectId: string, event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  projectToDelete.value = projectId
  showDeleteDialog.value = true
}

const confirmDeleteProject = async () => {
  if (!projectToDelete.value) return

  try {
    await deleteProjectMutation.mutateAsync(projectToDelete.value)
    createToast({
      title: t('projects.deleteSuccess'),
      type: 'success',
    })
    showDeleteDialog.value = false
    projectToDelete.value = null
  } catch (error) {
    createToast({
      title: t('projects.deleteError'),
      description: error instanceof Error ? error.message : t('projects.deleteError'),
      type: 'error',
    })
  }
}

const cancelDeleteProject = () => {
  showDeleteDialog.value = false
  projectToDelete.value = null
}
</script>

<template>
  <Card>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold text-neutral-900">{{ t('projects.title') }}</h3>

        <Button size="sm" variant="outline" @click="router.push(ROUTES.CreateProject)">
          <Plus class="w-4 h-4 mr-1.5" />{{ t('projects.new') }}
        </Button>
      </div>

      <div v-if="projectsLoading && !projects" class="flex justify-center items-center py-8">
        <div class="text-neutral-600">{{ t('projects.loading') }}</div>
      </div>

      <div
        v-else-if="hasProjectsError"
        class="text-center py-8 bg-error-50 border border-error-200 rounded-lg"
      >
        <div class="flex items-center flex-col gap-3">
          <Ban class="w-12 h-12 mx-auto text-error-600" />
          <span class="text-error-800 font-medium">{{ t('projects.errorLoading') }}</span>
        </div>
        <p class="text-error-600 text-sm mt-1 text-center mx-auto">{{ errorMessage }}</p>
        <Button variant="outline" @click="handleRefreshProjects" class="mt-4">{{
          t('projects.refresh')
        }}</Button>
      </div>

      <div v-else-if="!projects || projects.length === 0" class="text-center py-8">
        <SquareKanban class="w-12 h-12 mx-auto text-neutral-400 mb-3" />
        <p class="text-neutral-600 mb-2 font-medium">{{ t('projects.noProjects') }}</p>
        <p class="text-neutral-500 text-sm">{{ t('projects.noProjectsDescription') }}</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Own projects -->
        <div v-if="ownedProjects.length">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              {{ t('projects.yourProjects') }}
            </h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RouterLink
              v-for="project in ownedProjects"
              :to="ROUTES.Project(project.id)"
              :key="project.id"
              class="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer relative"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-neutral-900 text-lg">{{ project.name }}</h4>
                  <div class="flex items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      class="h-7 w-7 p-0"
                      @click="handleEditProject(project.id, $event)"
                      @mousedown.stop
                      :tooltip="t('projects.edit')"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      class="h-7 w-7 p-0 text-error-600 hover:text-error-700 hover:bg-error-50 mr-1"
                      @click="handleDeleteProject(project.id, $event)"
                      @mousedown.stop
                      :tooltip="t('projects.delete')"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                    <span
                      class="text-xs text-neutral-500 bg-primary-50 px-2 py-1 rounded font-medium"
                    >
                      {{ project.key }}
                    </span>
                  </div>
                </div>
                <p v-if="project.description" class="text-neutral-600 text-sm line-clamp-2">
                  {{ project.description }}
                </p>
                <div class="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span class="text-xs text-neutral-500">
                    {{ t('projects.created') }}
                    {{
                      project.created_at
                        ? new Date(project.created_at).toLocaleDateString()
                        : t('profile.unknown')
                    }}
                  </span>
                  <span
                    class="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded"
                  >
                    {{ t('projects.owner') }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- Shared projects -->
        <div v-if="sharedProjects.length">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              {{ t('projects.sharedWithYou') }}
            </h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RouterLink
              v-for="project in sharedProjects"
              :to="ROUTES.Project(project.id)"
              :key="project.id"
              class="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer relative"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-neutral-900 text-lg">{{ project.name }}</h4>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-xs text-neutral-500 bg-primary-50 px-2 py-1 rounded font-medium"
                    >
                      {{ project.key }}
                    </span>
                  </div>
                </div>
                <p v-if="project.description" class="text-neutral-600 text-sm line-clamp-2">
                  {{ project.description }}
                </p>
                <div class="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span class="text-xs text-neutral-500">
                    {{ t('projects.created') }}
                    {{
                      project.created_at
                        ? new Date(project.created_at).toLocaleDateString()
                        : t('profile.unknown')
                    }}
                  </span>
                  <span
                    class="text-xs font-medium text-neutral-500 bg-neutral-50 px-2 py-1 rounded"
                  >
                    {{ t('projects.member') }}
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </Card>

  <!-- Delete Confirmation Dialog -->
  <Dialog v-model:open="showDeleteDialog" size="md">
    <template #title>{{ t('projects.deleteConfirm') }}</template>
    <template #description>
      {{ t('projects.deleteConfirmDescription') }}
    </template>

    <template #footer>
      <Button variant="outline" @click="cancelDeleteProject">
        {{ t('createProject.cancel') }}
      </Button>
      <Button
        variant="danger"
        @click="confirmDeleteProject"
        :disabled="deleteProjectMutation.isPending.value"
      >
        {{ deleteProjectMutation.isPending.value ? t('projects.deleting') : t('projects.delete') }}
      </Button>
    </template>
  </Dialog>
</template>
