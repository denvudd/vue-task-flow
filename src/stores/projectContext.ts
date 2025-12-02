import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Tables } from '@/types/supabase'

type Project = Tables<'projects'>

export const useProjectContextStore = defineStore('projectContext', () => {
  const currentProjectId = ref<string | undefined>(undefined)
  const project = ref<Project | null>(null)
  const isSidebarOpen = ref(false)

  function setProject(projectId: string, projectData: Project | null) {
    currentProjectId.value = projectId
    project.value = projectData
  }

  function clearProject() {
    currentProjectId.value = undefined
    project.value = null
  }

  function openSidebar() {
    isSidebarOpen.value = true
  }

  function closeSidebar() {
    isSidebarOpen.value = false
  }

  return {
    currentProjectId,
    project,
    isSidebarOpen,

    setProject,
    clearProject,
    openSidebar,
    closeSidebar,
  }
})
