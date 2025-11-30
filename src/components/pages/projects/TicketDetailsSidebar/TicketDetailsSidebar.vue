<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTicketDetails } from '@/composables/useTicketDetails'
import TicketDetailsSidebarHeader from './TicketDetailsSidebarHeader.vue'
import TicketDetailsSidebarLoader from './TicketDetailsSidebarLoader.vue'
import TicketDetailsSidebarPanel from './TicketDetailsSidebarPanel.vue'
import TicketDetailsSidebarNotFound from './TicketDetailsSidebarNotFound.vue'
import TicketDetailsSidebarTitle from './TicketDetailsSidebarTitle.vue'
import TicketDetailsSidebarContent from './TicketDetailsSidebarContent.vue'

interface Props {
  ticketId: string
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { ticket, isLoadingTicket, openTicket, closeTicket, currentTicketId } = useTicketDetails()

onMounted(() => {
  openTicket(props.ticketId, props.projectId)
})

onUnmounted(() => {
  if (currentTicketId.value === props.ticketId) {
    closeTicket()
  }
})

const handleClose = () => {
  closeTicket()
  emit('close')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <TicketDetailsSidebarHeader @close="handleClose" />

    <div class="flex-1 overflow-y-auto px-15 pt-3 pb-6">
      <TicketDetailsSidebarLoader v-if="isLoadingTicket" />

      <template v-else-if="ticket">
        <TicketDetailsSidebarTitle />

        <div class="space-y-6 mt-2.5 animate-in fade-in duration-300">
          <TicketDetailsSidebarPanel />

          <TicketDetailsSidebarContent />
        </div>
      </template>

      <TicketDetailsSidebarNotFound v-else :project-id="props.projectId" />
    </div>
  </div>
</template>
