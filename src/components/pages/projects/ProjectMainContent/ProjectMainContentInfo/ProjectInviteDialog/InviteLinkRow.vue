<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()
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
      title: props.link.active
        ? t('inviteLink.success.deactivated')
        : t('inviteLink.success.activated'),
      description: props.link.active
        ? t('inviteLink.success.deactivatedDescription')
        : t('inviteLink.success.activatedDescription'),
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to toggle link:', err)
    createToast({
      title: t('inviteLink.errors.updateFailed'),
      type: 'error',
    })
  }
}

const handleRegenerate = async () => {
  if (!confirm(t('inviteLink.confirmRegenerate'))) {
    return
  }

  try {
    await regenerateToken(props.link.id)
    createToast({
      title: t('inviteLink.success.regenerated'),
      description: t('inviteLink.success.regeneratedDescription'),
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to regenerate:', err)
    createToast({
      title: t('inviteLink.errors.regenerateFailed'),
      type: 'error',
    })
  }
}

const handleDelete = async () => {
  if (!confirm(t('inviteLink.confirmDelete'))) {
    return
  }

  try {
    await deleteLink(props.link.id)
    createToast({
      title: t('inviteLink.success.deleted'),
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to delete:', err)
    createToast({
      title: t('inviteLink.errors.deleteFailed'),
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
    class="flex flex-col p-2 sm:p-4 border border-neutral-200 rounded-lg"
    :class="{ 'opacity-60': !link.active }"
  >
    <div class="flex-1 space-y-2">
      <div
        class="flex sm:items-center flex-wrap sm:flex-nowrap flex-col-reverse sm:flex-row gap-2 sm:gap-4 sm:justify-between"
      >
        <div class="flex items-center gap-2">
          <Badge variant="secondary">
            {{ PROJECT_ROLE_LABELS[link.role as keyof typeof PROJECT_ROLE_LABELS] }}
          </Badge>
          <Badge v-if="link.active" variant="success">{{ t('inviteLink.status.active') }}</Badge>
          <Badge v-else variant="default">{{ t('inviteLink.status.inactive') }}</Badge>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            @click="handleToggleActive"
            :disabled="isUpdating"
            :tooltip="
              link.active ? t('inviteLink.tooltips.deactivate') : t('inviteLink.tooltips.activate')
            "
          >
            <Power class="size-3" :class="{ 'text-success-600': link.active }" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            @click="handleRegenerate"
            :disabled="isRegenerating"
            :tooltip="t('inviteLink.tooltips.regenerate')"
          >
            <RefreshCw class="size-3" :class="{ 'animate-spin': isRegenerating }" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            @click="handleDelete"
            :disabled="isDeleting"
            :tooltip="t('inviteLink.tooltips.delete')"
          >
            <Trash2 class="size-3 text-error-600" />
          </Button>
        </div>
      </div>

      <div class="text-xs text-neutral-600">
        {{ t('inviteLink.created') }} {{ formatDate(link.created_at) }}
      </div>

      <Clipboard :value="inviteUrl" />
    </div>
  </div>
</template>
