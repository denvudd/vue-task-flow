<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Avatar, Button, RichTextEditor } from '@/components/ui'
import {
  useUpdateTicketComment,
  useDeleteTicketComment,
  type TicketCommentWithAuthor,
} from '@/composables/useTicketComments'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { getUserDisplayName } from '@/lib/utils/get-user-display-name'
import { getAvatarUrl } from '@/lib/utils/get-avatar-url'
import { Edit2, Trash2, MoreHorizontal, ArrowUp, Link, X } from 'lucide-vue-next'
import { Menu } from '@/components/ui'
import { Menu as ArkMenu } from '@ark-ui/vue/menu'

interface Props {
  comment: TicketCommentWithAuthor
  isHighlighted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isHighlighted: false,
})

const emit = defineEmits<{
  updated: []
  deleted: []
}>()

const { currentTicketId, mentionUsers } = useTicketDetails()
const { user } = useAuth()
const { createToast } = useToast()
const { t } = useI18n()

const { mutateAsync: updateComment, isPending: isUpdating } = useUpdateTicketComment()
const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteTicketComment()

const editingCommentId = ref<string | null>(null)
const editingContent = ref('')
const menuOpenState = ref(false)

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

const isCommentAuthor = () => {
  return user.value?.id === props.comment.author_id
}

const startEdit = () => {
  editingCommentId.value = props.comment.id
  editingContent.value = props.comment.content
  menuOpenState.value = false
}

const cancelEdit = () => {
  editingCommentId.value = null
  editingContent.value = ''
}

const handleUpdateComment = async () => {
  if (!editingContent.value.trim()) {
    cancelEdit()
    return
  }

  try {
    await updateComment({
      commentId: props.comment.id,
      content: editingContent.value.trim(),
    })
    cancelEdit()
    createToast({
      title: t('ticketDetails.comments.success.updated'),
      type: 'success',
    })
    emit('updated')
  } catch (err) {
    console.error('Failed to update comment:', err)
    createToast({
      title: t('ticketDetails.comments.errors.updateFailed'),
      type: 'error',
    })
  }
}

const handleDeleteComment = async () => {
  if (!confirm(t('ticketDetails.comments.deleteConfirm'))) {
    return
  }

  try {
    await deleteComment({
      commentId: props.comment.id,
      ticketId: props.comment.ticket_id,
    })
    createToast({
      title: t('ticketDetails.comments.success.deleted'),
      type: 'success',
    })
    emit('deleted')
  } catch (err) {
    console.error('Failed to delete comment:', err)
    createToast({
      title: t('ticketDetails.comments.errors.deleteFailed'),
      type: 'error',
    })
  }
}

const handleCopyCommentLink = async () => {
  const currentUrl = window.location.href
  const url = new URL(currentUrl)
  url.searchParams.set('comment', props.comment.id)

  try {
    await navigator.clipboard.writeText(url.toString())
    createToast({
      title: t('ticketDetails.comments.success.linkCopied'),
      description: t('ticketDetails.comments.success.linkCopiedDescription'),
      type: 'success',
    })
    menuOpenState.value = false
  } catch (err) {
    console.error('Failed to copy link:', err)
    createToast({
      title: t('ticketDetails.comments.errors.copyLinkFailed'),
      type: 'error',
    })
  }
}
</script>

<template>
  <div
    :id="`comment-${comment.id}`"
    :class="[
      'flex gap-2 group relative -ml-4 transition-all duration-500',
      isHighlighted ? 'highlighted-comment' : '',
    ]"
  >
    <div class="relative z-10">
      <Avatar
        :src="getAvatarUrl(comment.author?.avatar_url)"
        :name="
          getUserDisplayName({
            full_name: comment.author?.full_name,
            username: comment.author?.username,
          })
        "
        class="size-6 text-xs"
      />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-1.5 mb-1">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="font-medium text-neutral-900 text-sm truncate">
            {{
              getUserDisplayName({
                full_name: comment.author?.full_name,
                username: comment.author?.username,
              })
            }}
          </span>
          <span class="text-xs text-neutral-500 whitespace-nowrap">
            {{ formatDateTime(comment.created_at) }}
          </span>
          <span
            v-if="comment.updated_at && comment.updated_at !== comment.created_at"
            class="text-xs text-neutral-400"
          >
            {{ t('ticketDetails.comments.edited') }}
          </span>
        </div>

        <Menu
          v-if="isCommentAuthor() && editingCommentId !== comment.id"
          v-model:open="menuOpenState"
          :id="`comment-menu-${comment.id}`"
        >
          <template #trigger>
            <ArkMenu.Trigger as-child>
              <Button
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1! hover:bg-neutral-100 absolute top-0 right-0"
                size="icon"
                variant="outline"
                :disabled="isDeleting"
              >
                <MoreHorizontal class="size-4 text-neutral-500" />
              </Button>
            </ArkMenu.Trigger>
          </template>
          <ArkMenu.Item value="copy-link" as-child>
            <button @click="handleCopyCommentLink" class="w-full text-left flex items-center gap-2">
              <Link class="size-3.5" />
              {{ t('ticketDetails.comments.copyLink') }}
            </button>
          </ArkMenu.Item>
          <ArkMenu.Item v-if="isCommentAuthor()" value="edit" as-child>
            <button @click="startEdit" class="w-full text-left flex items-center gap-2">
              <Edit2 class="size-3.5" />
              {{ t('ticketDetails.comments.edit') }}
            </button>
          </ArkMenu.Item>
          <ArkMenu.Item v-if="isCommentAuthor()" value="delete" as-child>
            <button
              @click="handleDeleteComment"
              class="w-full text-left flex items-center gap-2 text-error-600"
            >
              <Trash2 class="size-3.5" />
              {{ t('ticketDetails.comments.delete') }}
            </button>
          </ArkMenu.Item>
        </Menu>
      </div>

      <!-- Edit Mode -->
      <div v-if="editingCommentId === comment.id" class="space-y-2">
        <div
          class="flex flex-[1_1_0%] min-w-0 rounded-md cursor-text self-center relative flex-wrap justify-end items-center gap-x-1 gap-y-1.5"
        >
          <div class="grow flex min-w-6">
            <RichTextEditor
              :model-value="editingContent"
              @update:model-value="editingContent = $event"
              :placeholder="t('ticketDetails.comments.editPlaceholder')"
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
              variant="secondary"
              @click="cancelEdit"
              :disabled="isUpdating"
              class="size-6 p-0! rounded-full!"
            >
              <X class="size-4" />
            </Button>
            <Button
              size="icon"
              variant="primary"
              @click="handleUpdateComment"
              :disabled="isUpdating || !editingContent.trim()"
              class="size-6 p-0! rounded-full!"
            >
              <ArrowUp class="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- View Mode -->
      <RichTextEditor
        v-else
        :model-value="comment.content"
        min-height="24px"
        :mention-users="mentionUsers"
        :ticket-id="currentTicketId ?? ''"
        :collaborative-enabled="false"
        :show-floating-menu="false"
        class="editor-wrapper"
        :disabled="true"
      />
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

.highlighted-comment {
  @apply bg-warning-50 rounded-lg animate-in fade-in duration-300;
}
</style>
