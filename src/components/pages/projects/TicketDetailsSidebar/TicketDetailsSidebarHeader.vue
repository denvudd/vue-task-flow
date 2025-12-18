<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Avatar, Skeleton } from '@/components/ui'
import { ChevronsLeft, ChevronsRight, MoveDiagonal, PanelRight, X } from 'lucide-vue-next'
import { ROUTES } from '@/lib/routing'
import { getUserDisplayName, getAvatarUrl } from '@/lib/utils'
import { useTicketPresence } from '@/composables/useTickets'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { useToast } from '@/composables/useToast'

interface Props {
  pageView?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const { createToast } = useToast()
const { t } = useI18n()

const { currentTicketId, currentProjectId, isLoadingTicket } = useTicketDetails()
const ticketIdForPresence = computed(() => currentTicketId.value || undefined)
const { connectedUsers } = useTicketPresence(ticketIdForPresence)

const handleOpenInFullPage = () => {
  if (!currentProjectId.value || !currentTicketId.value) return

  window.open(window.location.origin + ROUTES.Ticket(currentProjectId.value, currentTicketId.value))
}

const handleShare = () => {
  if (!currentProjectId.value || !currentTicketId.value) return

  navigator.clipboard.writeText(
    window.location.origin + ROUTES.Ticket(currentProjectId.value, currentTicketId.value),
  )
  createToast({
    title: t('ticketDetails.header.urlCopied'),
    description: t('ticketDetails.header.urlCopiedDescription'),
    type: 'success',
  })
}

const MAX_VISIBLE_AVATARS = 2
const visibleUsers = computed(() => connectedUsers.value.slice(0, MAX_VISIBLE_AVATARS))
const remainingCount = computed(() =>
  Math.max(0, connectedUsers.value.length - MAX_VISIBLE_AVATARS),
)
</script>

<template>
  <div class="flex items-center justify-between px-3 pt-2 gap-1">
    <div class="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        @click="emit('close')"
        class="shrink-0"
        :tooltip="pageView ? t('ticketDetails.header.backToProject') : t('ticketDetails.header.close')"
      >
        <ChevronsLeft v-if="pageView" class="size-4" />
        <ChevronsRight v-else class="size-4" />
      </Button>
      <Button
        v-if="currentProjectId && currentTicketId && !pageView"
        variant="ghost"
        size="icon"
        @click="handleOpenInFullPage"
        class="shrink-0"
        :tooltip="t('ticketDetails.header.openInFullPage')"
      >
        <MoveDiagonal class="size-4" />
      </Button>
    </div>

    <div class="flex items-center gap-2">
      <div v-if="isLoadingTicket" class="flex items-center -space-x-2">
        <Skeleton class="size-8 rounded-full" />
        <Skeleton class="size-8 rounded-full" />
      </div>
      <div
        v-else-if="!isLoadingTicket && connectedUsers.length > 0"
        class="flex items-center -space-x-2"
      >
        <TransitionGroup>
          <Button
            v-for="user in visibleUsers"
            :key="user.userId"
            variant="ghost"
            size="icon"
            class="p-0! hover:bg-transparent!"
          >
            <template #tooltip>
              <div class="flex flex-col">
                <span>{{ getUserDisplayName(user.profile) }}</span>
                <span>{{ user.email }}</span>
              </div>
            </template>
            <Transition
              enter-active-class="transition-all duration-500 ease-out"
              enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-500 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-0"
            >
              <Avatar
                :src="getAvatarUrl(user.profile.avatar_url)"
                :name="getUserDisplayName(user.profile)"
                size="sm"
              />
            </Transition>
          </Button>
        </TransitionGroup>

        <div
          v-if="remainingCount > 0"
          class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-medium flex items-center justify-center border-2 border-white"
        >
          +{{ remainingCount }}
        </div>
      </div>

      <Button variant="ghost" @click="handleShare" class="shrink-0 px-2!">{{ t('ticketDetails.header.share') }}</Button>
    </div>
  </div>
</template>
