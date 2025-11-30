<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProject } from '@/composables/useProjects'
import { useAuth } from '@/composables/useAuth'
import { useJoinProjectViaInvite } from '@/composables/useInvites'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { TicketDetailsSidebar } from '@/components/pages/projects/TicketDetailsSidebar'
import { PROJECT_ROLE_LABELS, PROJECT_VISIBILITIES } from '@/constants/projects'
import { useToast } from '@/composables/useToast'
import ProjectMainContent from '@/components/pages/projects/ProjectMainContent/ProjectMainContent.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { createToast } = useToast()

const projectId = computed(() => route.params.id as string)

const isProcessingInvite = ref(false)

const { data: project, refetch: refetchProject } = useProject(projectId)
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
    } else {
      closeTicket()
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

const isSidebarOpen = computed(() => !!currentTicketId.value)

const closeSidebar = () => {
  closeTicket()
  const query = { ...route.query }
  delete query.ticket
  router.push({ query })
}

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

    if (result.status === 'joined') {
      createToast({
        title: 'Welcome to the project!',
        description: `You've joined as ${PROJECT_ROLE_LABELS[result.role]}`,
        type: 'success',
      })
    } else if (result.status === 'role_upgraded') {
      createToast({
        title: 'Role upgraded',
        description: `Your role has been upgraded to ${PROJECT_ROLE_LABELS[result.role]}`,
        type: 'success',
      })
    } else if (result.status === 'already_member') {
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
  <div class="min-h-screen bg-neutral-50 flex flex-col">
    <div class="flex flex-1 overflow-hidden pb-8">
      <ProjectMainContent :has-user-access="hasUserAccess" :project="project" />
      <!-- Ticket Details Sidebar -->
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
          class="w-1/2 border-l border-neutral-200 bg-white overflow-hidden flex flex-col"
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
