<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, Button, Field } from '@/components/ui'
import { useProjectInviteLinks, useCreateInviteLink } from '@/composables/useInvites'
import { Plus, Share2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import InviteLinkRow from './InviteLinkRow.vue'
import {
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
  PROJECT_ROLE_DESCRIPTIONS,
  type ProjectRole,
} from '@/constants/projects'
import { ROUTES } from '@/lib/routing'

interface Props {
  projectId: string
  projectName: string
}

const props = defineProps<Props>()

const { createToast } = useToast()
const isOpen = ref(false)
const showCreateForm = ref(false)
const selectedRole = ref<ProjectRole>(PROJECT_ROLES.VIEWER)

const { data: inviteLinksResponse, isLoading } = useProjectInviteLinks(
  computed(() => props.projectId),
)
const { mutateAsync: createInviteLink, isPending: isCreating } = useCreateInviteLink()

const inviteLinks = computed(() => inviteLinksResponse.value?.data || [])

const baseUrl = computed(() => {
  return `${window.location.origin}${ROUTES.Project(props.projectId)}`
})

const handleCreateLink = async () => {
  try {
    await createInviteLink({
      projectId: props.projectId,
      role: selectedRole.value,
    })
    createToast({
      title: 'Invite link created',
      description: 'You can now share this link with others',
      type: 'success',
    })
    showCreateForm.value = false
    selectedRole.value = PROJECT_ROLES.VIEWER
  } catch (err) {
    console.error('Failed to create invite link:', err)
    createToast({
      title: 'Failed to create invite link',
      type: 'error',
    })
  }
}

const handleCancelCreate = () => {
  showCreateForm.value = false
  selectedRole.value = PROJECT_ROLES.VIEWER
}

const open = () => {
  isOpen.value = true
}
</script>

<template>
  <div>
    <slot name="trigger" :open="open">
      <Button variant="outline" size="sm" @click="open">
        <Share2 class="w-4 h-4 mr-2" />
        Share
      </Button>
    </slot>

    <Dialog v-model:open="isOpen" size="xl">
      <template #title>Share project {{ projectName }}</template>
      <template #description>
        Create and manage invite links for this project. Anyone with the link can join based on the
        role you assign.
      </template>

      <div class="space-y-6">
        <!-- Create new link form -->
        <div v-if="showCreateForm" class="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <h3 class="text-lg font-semibold mb-4">Create New Invite Link</h3>

          <Field label="Select Role" required class="mb-4">
            <div class="space-y-2">
              <label
                v-for="role in Object.values(PROJECT_ROLES)"
                :key="role"
                class="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                :class="{
                  'bg-primary-50 border-primary-300': selectedRole === role,
                }"
              >
                <input type="radio" :value="role" v-model="selectedRole" class="mt-1" />
                <div class="flex-1">
                  <div class="font-medium text-neutral-900">
                    {{ PROJECT_ROLE_LABELS[role] }}
                  </div>
                  <div class="text-sm text-neutral-600">
                    {{ PROJECT_ROLE_DESCRIPTIONS[role] }}
                  </div>
                </div>
              </label>
            </div>
          </Field>

          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="handleCancelCreate" :disabled="isCreating">
              Cancel
            </Button>
            <Button @click="handleCreateLink" :disabled="isCreating">
              {{ isCreating ? 'Creating...' : 'Create Link' }}
            </Button>
          </div>
        </div>

        <!-- Show create button if form is not visible -->
        <Button
          v-if="!showCreateForm"
          variant="outline"
          @click="showCreateForm = true"
          class="w-full"
        >
          <Plus class="w-4 h-4 mr-2" />
          Create New Invite Link
        </Button>

        <!-- List of existing invite links -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Existing Invite Links</h3>

          <div v-if="isLoading" class="text-center py-8 text-neutral-600">
            Loading invite links...
          </div>

          <div v-else-if="inviteLinks.length === 0" class="text-center py-8 text-neutral-600">
            No invite links yet. Create one to invite members to this project.
          </div>

          <div v-else class="space-y-3">
            <InviteLinkRow
              v-for="link in inviteLinks"
              :key="link.id"
              :link="link"
              :base-url="baseUrl"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
