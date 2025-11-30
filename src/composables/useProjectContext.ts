import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectContextStore } from '@/stores/projectContext'
import { useProject } from '@/composables/useProjects'
import { useAuth } from '@/composables/useAuth'
import { PROJECT_VISIBILITIES } from '@/constants/projects'

/**
 * Composable for managing project context
 * Provides project data, access control, and owner status
 */
export function useProjectContext() {
  const projectContextStore = useProjectContextStore()
  const { currentProjectId } = storeToRefs(projectContextStore)
  const { setProject, clearProject } = projectContextStore

  const { user } = useAuth()
  const projectQuery = useProject(currentProjectId)
  const project = computed(() => projectQuery.data.value)
  const isLoading = computed(() => projectQuery.isLoading.value)
  const isError = computed(() => projectQuery.isError.value)
  const error = computed(() => projectQuery.error.value)

  watch(
    project,
    (projectData) => {
      if (currentProjectId.value && projectData) {
        setProject(currentProjectId.value, projectData)
      }
    },
    { immediate: true },
  )

  const hasUserAccess = computed(() => {
    const projectData = project.value
    const userData = user.value

    if (!projectData) return false

    const isProjectPublic = projectData.visibility === PROJECT_VISIBILITIES.PUBLIC

    if (isProjectPublic) {
      return true
    }

    if (!userData) return false

    const isUserOwner = projectData.owner_id === userData.id

    if (isUserOwner) {
      return true
    }

    const projectMembers = projectData.members as Array<{ user_id: string }> | null
    const isUserMember = projectMembers?.some((member) => member.user_id === userData.id)

    if (isUserMember) {
      return true
    }

    return false
  })

  const isOwner = computed(() => {
    if (!project.value || !user.value) return false
    return project.value.owner_id === user.value.id
  })

  return {
    currentProjectId,
    project,
    isLoading,
    isError,
    error,

    hasUserAccess,
    isOwner,

    setProject,
    clearProject,
    refetch: projectQuery.refetch,
  }
}
