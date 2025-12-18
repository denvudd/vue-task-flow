<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui'
import { useCreateTicket } from '@/composables/useTickets'
import type { Tables } from '@/types/supabase'
import { useAuth } from '@/composables/useAuth'
import { Plus } from 'lucide-vue-next'
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_TYPES } from '@/constants/tickets'
import { useToast } from '@/composables/useToast'
import { useProjectContext } from '@/composables/useProjectContext'

interface Props {
  tickets: Tables<'tickets'>[]
}

const props = defineProps<Props>()

const { currentProjectId, isSidebarOpen } = useProjectContext()
const { mutateAsync: createTicket, isPending: isCreatingTicket } = useCreateTicket()
const { user, isAuthenticated } = useAuth()
const { createToast } = useToast()
const { t } = useI18n()

const handleQuickCreateTicket = async () => {
  if (!user.value) {
    createToast({
      title: t('quickCreateTicket.mustBeLoggedIn'),
      type: 'warning',
    })
    return
  }

  try {
    const maxOrderIndex =
      props.tickets.length > 0 ? Math.max(...props.tickets.map((t) => t.order_index ?? 0)) : -1
    const newOrderIndex = maxOrderIndex + 1

    const today = new Date()

    const ticket = {
      title: '',
      description: null,
      status: TICKET_STATUSES.TODO,
      priority: TICKET_PRIORITIES.LOW,
      type: TICKET_TYPES.TASK,
      due_date: today.toISOString(),
      project_id: currentProjectId.value as string,
      creator_id: user.value.id,
      order_index: newOrderIndex,
    }

    await createTicket(ticket)
  } catch (err) {
    console.error('Error creating quick ticket:', err)
    createToast({
      title: t('quickCreateTicket.createFailed'),
      type: 'error',
    })
  }
}
</script>

<template>
  <div class="flex">
    <div
      v-if="isAuthenticated"
      class="px-4 sm:px-8 lg:px-24 mt-4"
      :class="{ 'shrink-0 z-86 pe-4': isSidebarOpen }"
      :style="{
        insetInlineStart: isSidebarOpen ? '0' : 'auto',
        position: isSidebarOpen ? 'sticky' : 'relative',
      }"
    >
      <div
        class="w-full flex items-center"
        :style="{
          insetInlineStart: isSidebarOpen ? '0px' : 'auto',
        }"
      >
        <div class="w-full">
          <Button
            variant="ghost"
            size="sm"
            class="justify-start w-fit"
            :disabled="isCreatingTicket"
            @click="handleQuickCreateTicket"
          >
            <Plus class="w-4 h-4 mr-2" />
            {{
              isCreatingTicket ? t('quickCreateTicket.creating') : t('quickCreateTicket.newTask')
            }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
