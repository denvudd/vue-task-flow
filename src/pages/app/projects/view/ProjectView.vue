<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectContext } from '@/composables/useProjectContext'
import { useAuth } from '@/composables/useAuth'
import { useJoinProjectViaInvite } from '@/composables/useInvites'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { TicketDetailsSidebar } from '@/components/pages/projects/TicketDetailsSidebar'
import { PROJECT_JOIN_STATUS, PROJECT_ROLE_LABELS } from '@/constants/projects'
import { useToast } from '@/composables/useToast'
import ProjectMainContent from '@/components/pages/projects/ProjectMainContent/ProjectMainContent.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { createToast } = useToast()

const projectId = computed(() => route.params.id as string)

const isProcessingInvite = ref(false)

const {
  setProject,
  refetch: refetchProject,
  isSidebarOpen,
  openSidebar,
  closeSidebar,
} = useProjectContext()
const { mutateAsync: joinProjectViaInvite } = useJoinProjectViaInvite()

const { currentTicketId, openTicket, closeTicket } = useTicketDetails()

const selectedTicketId = computed(() => {
  const ticketParam = route.query.ticket
  return typeof ticketParam === 'string' ? ticketParam : undefined
})

watch(
  selectedTicketId,
  (ticketId) => {
    if (ticketId && projectId.value) {
      openTicket(ticketId, projectId.value)
      openSidebar()
    } else {
      closeTicket()
      closeSidebar()
    }
  },
  { immediate: true },
)

watch(currentTicketId, (ticketId) => {
  const queryTicketId = selectedTicketId.value

  if (ticketId !== queryTicketId) {
    const query = { ...route.query }

    if (ticketId) {
      query.ticket = ticketId
    } else {
      delete query.ticket
    }
    router.replace({ query })
  }
})

watch(
  projectId,
  (id) => {
    if (id) {
      setProject(id, null)
    }
  },
  { immediate: true },
)

const handleInviteToken = async () => {
  const inviteToken = route.query.invite as string | undefined

  if (!inviteToken || isProcessingInvite.value) {
    return
  }

  isProcessingInvite.value = true

  try {
    // Check if user needs to be authenticated
    // For viewer role, authentication might not be required (handled by access check)
    // For commenter and editor, authentication is required
    if (!user.value) {
      router.push({
        name: 'Login',
        query: { redirect: route.fullPath },
      })
      return
    }

    // User is authenticated, try to join the project
    const result = await joinProjectViaInvite({
      token: inviteToken,
      userId: user.value.id,
    })

    // Remove invite token from URL
    const query = { ...route.query }
    delete query.invite
    await router.replace({ query })

    if (result.status === PROJECT_JOIN_STATUS.JOINED) {
      createToast({
        title: 'Welcome to the project!',
        description: `You've joined as ${PROJECT_ROLE_LABELS[result.role]}`,
        type: 'success',
      })
    } else if (result.status === PROJECT_JOIN_STATUS.ROLE_UPGRADED) {
      createToast({
        title: 'Role upgraded',
        description: `Your role has been upgraded to ${PROJECT_ROLE_LABELS[result.role]}`,
        type: 'success',
      })
    } else if (result.status === PROJECT_JOIN_STATUS.ALREADY_MEMBER) {
      createToast({
        title: 'Already a member',
        description: 'You already have access to this project',
        type: 'info',
      })
    }

    await refetchProject()
  } catch (err: any) {
    console.error('Failed to join project via invite:', err)

    const query = { ...route.query }
    delete query.invite
    await router.replace({ query })

    createToast({
      title: 'Invalid invite link',
      description: err?.message || 'This invite link is invalid or has expired',
      type: 'error',
    })
  } finally {
    isProcessingInvite.value = false
  }
}

onMounted(() => {
  handleInviteToken()
})

watch(
  () => user.value,
  (newUser) => {
    if (newUser && route.query.invite) {
      handleInviteToken()
    }
  },
)
</script>

<template>
  <div class="h-screen overflow-hidden">
    <div class="h-full w-screen flex flex-col grow shrink-0">
        <ProjectMainContent />
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="translate-x-full opacity-0"
          enter-to-class="translate-x-0 opacity-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="translate-x-0 opacity-100"
          leave-to-class="translate-x-full opacity-0"
        >
          <div
            v-if="isSidebarOpen && currentTicketId"
            class="w-1/2 border-l border-neutral-200 bg-white overflow-hidden flex flex-col absolute top-0 right-0 bottom-0 z-109"
          >
            <TicketDetailsSidebar
              :ticket-id="currentTicketId"
              :project-id="projectId"
              @close="closeSidebar"
            />
          </div>
        </Transition>
    </div>
  </div>
</template>
