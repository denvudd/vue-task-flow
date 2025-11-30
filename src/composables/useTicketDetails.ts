import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTicketDetailsStore } from '@/stores/ticketDetails'
import { useTicket, useUpdateTicket } from '@/composables/useTickets'
import { useProjectMembers } from '@/composables/useMembers'
import type { TicketUpdate } from '@/api/tickets'
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from '@/constants/tickets'

export function useTicketDetails() {
  const ticketDetailsStore = useTicketDetailsStore()

  const { currentTicketId, currentProjectId } = storeToRefs(ticketDetailsStore)
  const { openTicket, closeTicket } = ticketDetailsStore

  const ticketQuery = useTicket(currentTicketId)
  const ticket = computed(() => ticketQuery.data.value)
  const isLoadingTicket = computed(() => ticketQuery.isLoading.value)
  const ticketError = computed(() => ticketQuery.error.value)

  const membersQuery = useProjectMembers(currentProjectId)
  const mentionUsers = computed(() => {
    const members = membersQuery.data.value?.data || []
    return members.map((member) => ({
      id: member.user_id,
      name: member.user?.full_name || member.user?.username || 'Unknown User',
      avatar: member.user?.avatar_url || null,
    }))
  })

  const { mutateAsync: updateTicketMutation } = useUpdateTicket()

  const localTitle = ref<string>('')
  const localDescription = ref<string>('')
  const localStatus = ref<TicketStatus | null>(null)
  const localPriority = ref<TicketPriority | null>(null)
  const localType = ref<TicketType | null>(null)

  const ticketTitle = computed(() => ticket.value?.title || '')
  const ticketDescription = computed(() => ticket.value?.description || '')
  const ticketStatus = computed<TicketStatus>(
    () => (ticket.value?.status || TICKET_STATUSES.TODO) as TicketStatus,
  )
  const ticketPriority = computed<TicketPriority>(
    () => (ticket.value?.priority || TICKET_PRIORITIES.MEDIUM) as TicketPriority,
  )
  const ticketType = computed<TicketType>(
    () => (ticket.value?.type || TICKET_TYPES.TASK) as TicketType,
  )

  watch(
    () => ticket.value,
    (ticketValue) => {
      if (ticketValue) {
        if (!localTitle.value) localTitle.value = ticketValue.title
        if (!localDescription.value) localDescription.value = ticketValue.description || ''
        if (!localStatus.value)
          localStatus.value = (ticketValue.status || TICKET_STATUSES.TODO) as TicketStatus
        if (!localPriority.value)
          localPriority.value = (ticketValue.priority || TICKET_PRIORITIES.MEDIUM) as TicketPriority
        if (!localType.value)
          localType.value = (ticketValue.type || TICKET_TYPES.TASK) as TicketType
      }
    },
    { immediate: true },
  )

  watch(
    () => currentTicketId.value,
    () => {
      localTitle.value = ''
      localDescription.value = ''
      localStatus.value = null
      localPriority.value = null
      localType.value = null
    },
  )

  const title = computed(() => localTitle.value || ticketTitle.value)
  const description = computed(() => localDescription.value || ticketDescription.value)
  const status = computed(() => localStatus.value || ticketStatus.value)
  const priority = computed(() => localPriority.value || ticketPriority.value)
  const type = computed(() => localType.value || ticketType.value)

  async function updateTicketField(updates: Partial<TicketUpdate>) {
    if (!currentTicketId.value || !ticket.value) return

    try {
      await updateTicketMutation({
        ticketId: currentTicketId.value,
        updates: {
          ...updates,
        },
      })
    } catch (err) {
      console.error('Error updating ticket:', err)
      throw err
    }
  }

  function setLocalTitle(value: string) {
    localTitle.value = value
  }

  function setLocalDescription(value: string) {
    localDescription.value = value
  }

  function setLocalStatus(value: TicketStatus) {
    localStatus.value = value
  }

  function setLocalPriority(value: TicketPriority) {
    localPriority.value = value
  }

  function setLocalType(value: TicketType) {
    localType.value = value
  }

  return {
    currentTicketId,
    currentProjectId,

    ticket,
    isLoadingTicket,
    ticketError,

    title,
    description,
    status,
    priority,
    type,

    mentionUsers,

    openTicket,
    closeTicket,
    updateTicketField,
    setLocalTitle,
    setLocalDescription,
    setLocalStatus,
    setLocalPriority,
    setLocalType,
  }
}
