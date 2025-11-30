import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Tables } from '@/types/supabase'

type Project = Tables<'projects'>

/**
 * Store for managing current project context
 * Contains project ID and access state
 * Actual data fetching is handled in useProject composable
 */
export const useProjectContextStore = defineStore('projectContext', () => {
  const currentProjectId = ref<string | undefined>(undefined)
  const project = ref<Project | null>(null)

  function setProject(projectId: string, projectData: Project | null) {
    currentProjectId.value = projectId
    project.value = projectData
  }

  function clearProject() {
    currentProjectId.value = undefined
    project.value = null
  }

  return {
    // State
    currentProjectId,
    project,

    // Methods
    setProject,
    clearProject,
  }
})

