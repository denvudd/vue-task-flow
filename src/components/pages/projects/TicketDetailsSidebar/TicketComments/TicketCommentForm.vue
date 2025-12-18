<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Avatar, Button, RichTextEditor } from '@/components/ui'
import { useCreateTicketComment } from '@/composables/useTicketComments'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { getUserDisplayName } from '@/lib/utils/get-user-display-name'
import { getAvatarUrl } from '@/lib/utils/get-avatar-url'
import { ArrowUp } from 'lucide-vue-next'

const { currentTicketId, mentionUsers } = useTicketDetails()
const { user, profile } = useAuth()
const { createToast } = useToast()
const { t } = useI18n()

const { mutateAsync: createComment, isPending: isCreating } = useCreateTicketComment()

const newCommentContent = ref('')

const handleCreateComment = async () => {
  if (!newCommentContent.value.trim() || !currentTicketId.value || !user.value) {
    return
  }

  try {
    await createComment({
      ticketId: currentTicketId.value,
      content: newCommentContent.value.trim(),
      authorId: user.value.id,
    })
    newCommentContent.value = ''
    createToast({
      title: t('ticketDetails.comments.success.added'),
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to create comment:', err)
    createToast({
      title: t('ticketDetails.comments.errors.addFailed'),
      type: 'error',
    })
  }
}
</script>

<template>
  <div class="space-y-3 pt-3 pb-4 border-b border-neutral-200">
    <div class="flex gap-2">
      <Avatar
        :src="getAvatarUrl(profile?.avatar_url ?? null)"
        :name="
          getUserDisplayName({
            full_name: profile?.full_name ?? null,
            username: profile?.username ?? null,
          })
        "
        class="size-6 shrink-0"
      />
      <div
        class="flex flex-[1_1_0%] min-w-0 rounded-md cursor-text self-center relative flex-wrap justify-end items-center gap-x-1 gap-y-1.5"
      >
        <div class="grow flex min-w-6">
          <RichTextEditor
            v-model="newCommentContent"
            :placeholder="t('ticketDetails.comments.addPlaceholder')"
            min-height="24px"
            :mention-users="mentionUsers"
            :ticket-id="currentTicketId ?? ''"
            :collaborative-enabled="false"
            :show-floating-menu="false"
            class="editor-wrapper"
          />
        </div>
        <div class="flex items-center justify-end gap-2">
          <Button
            size="icon"
            variant="primary"
            @click="handleCreateComment"
            :disabled="isCreating"
            class="size-6 p-0! rounded-full!"
          >
            <ArrowUp class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../../../style.css";

.editor-wrapper {
  @apply text-sm!;
}

.editor-wrapper :deep(.tiptap p) {
  @apply text-sm!;
}

.editor-wrapper :deep(.tiptap .mention) {
  @apply bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium;
  @apply cursor-pointer transition-colors;
  text-decoration: none;
}

.editor-wrapper :deep(.tiptap .mention:hover) {
  @apply bg-primary-200 text-primary-800;
}
</style>

