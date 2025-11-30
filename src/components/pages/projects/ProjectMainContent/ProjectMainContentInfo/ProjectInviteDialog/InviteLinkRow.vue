<script setup lang="ts">
import { ref } from 'vue'
import { Button, Badge } from '@/components/ui'
import { RefreshCw, Trash2, Power } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import {
  useRevokeInviteLink,
  useRegenerateInviteLinkToken,
  useDeleteInviteLink,
  useUpdateInviteLink,
} from '@/composables/useInvites'
import type { InviteLink } from '@/api/invites'
import { PROJECT_ROLE_LABELS } from '@/constants/projects'
import { Clipboard } from '@/components/ui'

interface Props {
  link: InviteLink
  baseUrl: string
}

const props = defineProps<Props>()

const { createToast } = useToast()
const { mutateAsync: revokeLink, isPending: isRevoking } = useRevokeInviteLink()
const { mutateAsync: regenerateToken, isPending: isRegenerating } = useRegenerateInviteLinkToken()
const { mutateAsync: deleteLink, isPending: isDeleting } = useDeleteInviteLink()
const { mutateAsync: updateLink, isPending: isUpdating } = useUpdateInviteLink()

const inviteUrl = `${props.baseUrl}?invite=${props.link.token}`

const handleToggleActive = async () => {
  try {
    await updateLink({
      linkId: props.link.id,
      updates: { active: !props.link.active },
    })
    createToast({
      title: props.link.active ? 'Link deactivated' : 'Link activated',
      description: props.link.active ? 'This link will no longer work' : 'This link is now active',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to toggle link:', err)
    createToast({
      title: 'Failed to update link',
      type: 'error',
    })
  }
}

const handleRegenerate = async () => {
  if (!confirm('Are you sure you want to regenerate this link? The old link will stop working.')) {
    return
  }

  try {
    await regenerateToken(props.link.id)
    createToast({
      title: 'Link regenerated',
      description: 'A new invite link has been generated',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to regenerate:', err)
    createToast({
      title: 'Failed to regenerate link',
      type: 'error',
    })
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this invite link?')) {
    return
  }

  try {
    await deleteLink(props.link.id)
    createToast({
      title: 'Link deleted',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to delete:', err)
    createToast({
      title: 'Failed to delete link',
      type: 'error',
    })
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div
    class="flex flex-col p-4 border border-neutral-200 rounded-lg"
    :class="{ 'opacity-60': !link.active }"
  >
    <div class="flex-1 space-y-2">
      <div class="flex items-center gap-4 justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="secondary">
            {{ PROJECT_ROLE_LABELS[link.role as keyof typeof PROJECT_ROLE_LABELS] }}
          </Badge>
          <Badge v-if="link.active" variant="success">Active</Badge>
          <Badge v-else variant="default">Inactive</Badge>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            @click="handleToggleActive"
            :disabled="isUpdating"
            :tooltip="link.active ? 'Deactivate link' : 'Activate link'"
          >
            <Power class="size-3" :class="{ 'text-success-600': link.active }" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            @click="handleRegenerate"
            :disabled="isRegenerating"
            tooltip="Regenerate token"
          >
            <RefreshCw class="size-3" :class="{ 'animate-spin': isRegenerating }" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            @click="handleDelete"
            :disabled="isDeleting"
            tooltip="Delete link"
          >
            <Trash2 class="size-3 text-error-600" />
          </Button>
        </div>
      </div>

      <div class="text-xs text-neutral-600">Created {{ formatDate(link.created_at) }}</div>

      <Clipboard :value="inviteUrl" />
    </div>
  </div>
</template>
