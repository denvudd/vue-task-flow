import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Tables } from '@/types/supabase'

type Project = Tables<'projects'>

export const useProjectContextStore = defineStore('projectContext', () => {
  const currentProjectId = ref<string | undefined>(undefined)
  const project = ref<Project | null>(null)
  const isSidebarOpen = ref(false)
  const selectedTicketIds = ref<string[]>([])

  function setProject(projectId: string, projectData: Project | null) {
    currentProjectId.value = projectId
    project.value = projectData
    // Clear selection when project changes
    selectedTicketIds.value = []
  }

  function clearProject() {
    currentProjectId.value = undefined
    project.value = null
    selectedTicketIds.value = []
  }

  function openSidebar() {
    isSidebarOpen.value = true
  }

  function closeSidebar() {
    isSidebarOpen.value = false
  }

  function selectTicket(ticketId: string) {
    if (!selectedTicketIds.value.includes(ticketId)) {
      selectedTicketIds.value.push(ticketId)
    }
  }

  function deselectTicket(ticketId: string) {
    selectedTicketIds.value = selectedTicketIds.value.filter((id) => id !== ticketId)
  }

  function toggleTicket(ticketId: string) {
    if (selectedTicketIds.value.includes(ticketId)) {
      deselectTicket(ticketId)
    } else {
      selectTicket(ticketId)
    }
  }

  function selectAllTickets(ticketIds: string[]) {
    selectedTicketIds.value = [...ticketIds]
  }

  function clearSelection() {
    selectedTicketIds.value = []
  }

  function cleanupSelection(validTicketIds: string[]) {
    const validIdsSet = new Set(validTicketIds)
    selectedTicketIds.value = selectedTicketIds.value.filter((id) => validIdsSet.has(id))
  }

  return {
    currentProjectId,
    project,
    isSidebarOpen,
    selectedTicketIds,

    setProject,
    clearProject,
    openSidebar,
    closeSidebar,
    selectTicket,
    deselectTicket,
    toggleTicket,
    selectAllTickets,
    clearSelection,
    cleanupSelection,
  }
})
