<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Avatar, Button, Field, RichTextEditor } from '@/components/ui'
import {
  useTicketComments,
  useCreateTicketComment,
  useUpdateTicketComment,
  useDeleteTicketComment,
  useCanComment,
  type TicketCommentWithAuthor,
} from '@/composables/useTicketComments'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { getUserDisplayName } from '@/lib/utils/get-user-display-name'
import { getAvatarUrl } from '@/lib/utils/get-avatar-url'
import {
  MoreVertical,
  Edit2,
  Trash2,
  MoreHorizontal,
  Send,
  ArrowUp,
  Link,
  X,
} from 'lucide-vue-next'
import { Menu } from '@/components/ui'
import { Menu as ArkMenu } from '@ark-ui/vue/menu'

const route = useRoute()
const router = useRouter()
const { currentTicketId, mentionUsers } = useTicketDetails()
const { user, profile } = useAuth()
const { canComment } = useCanComment()
const { createToast } = useToast()

const { data: comments, isLoading } = useTicketComments(currentTicketId)
const { mutateAsync: createComment, isPending: isCreating } = useCreateTicketComment()
const { mutateAsync: updateComment, isPending: isUpdating } = useUpdateTicketComment()
const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteTicketComment()

const newCommentContent = ref('')
const editingCommentId = ref<string | null>(null)
const editingContent = ref('')
const menuOpenStates = ref<Record<string, boolean>>({})
const highlightedCommentId = ref<string | null>(null)

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

const isCommentAuthor = (comment: TicketCommentWithAuthor) => {
  return user.value?.id === comment.author_id
}

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
      title: 'Comment added',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to create comment:', err)
    createToast({
      title: 'Failed to add comment',
      type: 'error',
    })
  }
}

const startEdit = (comment: TicketCommentWithAuthor) => {
  editingCommentId.value = comment.id
  editingContent.value = comment.content
}

const cancelEdit = () => {
  editingCommentId.value = null
  editingContent.value = ''
}

const handleUpdateComment = async (commentId: string) => {
  if (!editingContent.value.trim()) {
    cancelEdit()
    return
  }

  try {
    await updateComment({
      commentId,
      content: editingContent.value.trim(),
    })
    cancelEdit()
    createToast({
      title: 'Comment updated',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to update comment:', err)
    createToast({
      title: 'Failed to update comment',
      type: 'error',
    })
  }
}

const handleDeleteComment = async (comment: TicketCommentWithAuthor) => {
  if (!confirm('Are you sure you want to delete this comment?')) {
    return
  }

  try {
    await deleteComment({
      commentId: comment.id,
      ticketId: comment.ticket_id,
    })
    createToast({
      title: 'Comment deleted',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to delete comment:', err)
    createToast({
      title: 'Failed to delete comment',
      type: 'error',
    })
  }
}

const handleCopyCommentLink = async (comment: TicketCommentWithAuthor) => {
  const currentUrl = window.location.href
  const url = new URL(currentUrl)
  url.searchParams.set('comment', comment.id)

  try {
    await navigator.clipboard.writeText(url.toString())
    createToast({
      title: 'Link copied',
      description: 'Comment link has been copied to clipboard',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to copy link:', err)
    createToast({
      title: 'Failed to copy link',
      type: 'error',
    })
  }
}

const highlightComment = (commentId: string) => {
  highlightedCommentId.value = commentId
  const commentElement = document.getElementById(`comment-${commentId}`)

  if (commentElement) {
    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Remove query parameter after scrolling
    const query = { ...route.query }
    delete query.comment
    router.replace({ query })

    // Remove highlight after 3 seconds
    setTimeout(() => {
      highlightedCommentId.value = null
    }, 3000)
  }
}

// Watch for comment query parameter
watch(
  () => route.query.comment,
  (commentId) => {
    if (commentId && typeof commentId === 'string' && comments.value) {
      const comment = comments.value.find((c) => c.id === commentId)
      if (comment) {
        nextTick(() => {
          highlightComment(commentId)
        })
      }
    }
  },
  { immediate: true },
)

// Watch for comments to be loaded and check for comment query parameter
watch(
  comments,
  (newComments) => {
    if (newComments && newComments.length > 0) {
      const commentId = route.query.comment
      if (commentId && typeof commentId === 'string') {
        const comment = newComments.find((c) => c.id === commentId)
        if (comment) {
          nextTick(() => {
            highlightComment(commentId)
          })
        }
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="mt-6">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-neutral-600 mb-3">Comments</h3>
    </div>

    <!-- Comments List -->
    <div v-if="isLoading" class="relative">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex gap-2 animate-pulse">
          <div class="w-6 h-6 rounded-full bg-neutral-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div class="h-20 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="comments && comments.length > 0" class="relative pl-4">
      <!-- Vertical line connecting avatars -->
      <div
        v-if="comments.length > 1"
        class="absolute left-[11px] top-3 w-px bg-neutral-200"
        style="height: calc(100% - 12px)"
      ></div>

      <div class="space-y-4">
        <div
          v-for="(comment, index) in comments"
          :key="comment.id"
          :id="`comment-${comment.id}`"
          :class="[
            'flex gap-2 group relative -ml-4 transition-all duration-500',
            highlightedCommentId === comment.id ? 'highlighted-comment' : '',
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
              class="size-6 bg-white border-2 border-white"
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
                  (edited)
                </span>
              </div>

              <Menu
                v-if="isCommentAuthor(comment) && editingCommentId !== comment.id"
                v-model:open="menuOpenStates[comment.id]"
                :id="`comment-menu-${comment.id}`"
              >
                <template #trigger>
                  <ArkMenu.Trigger as-child>
                    <Button
                      class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-100 absolute top-0 right-0"
                      size="icon"
                      variant="ghost"
                      :disabled="isDeleting"
                    >
                      <MoreHorizontal class="size-4 text-neutral-500" />
                    </Button>
                  </ArkMenu.Trigger>
                </template>
                <ArkMenu.Item value="copy-link" as-child>
                  <button
                    @click="handleCopyCommentLink(comment)"
                    class="w-full text-left flex items-center gap-2"
                  >
                    <Link class="size-3.5" />
                    Copy link
                  </button>
                </ArkMenu.Item>
                <ArkMenu.Item v-if="isCommentAuthor(comment)" value="edit" as-child>
                  <button
                    @click="startEdit(comment)"
                    class="w-full text-left flex items-center gap-2"
                  >
                    <Edit2 class="size-3.5" />
                    Edit
                  </button>
                </ArkMenu.Item>
                <ArkMenu.Item v-if="isCommentAuthor(comment)" value="delete" as-child>
                  <button
                    @click="handleDeleteComment(comment)"
                    class="w-full text-left flex items-center gap-2 text-error-600"
                  >
                    <Trash2 class="size-3.5" />
                    Delete
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
                    placeholder="Edit your comment..."
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
                    @click="handleUpdateComment(comment.id)"
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
      </div>
    </div>

    <!-- Add Comment Form -->
    <div v-if="canComment" class="space-y-3 pt-3 pb-4 border-b border-neutral-200">
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
              placeholder="Add a comment..."
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

    <div v-else class="text-center py-4 text-sm text-neutral-500 border-t border-neutral-200">
      <p>You don't have permission to comment on this ticket.</p>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

:deep(.prose) {
  @apply text-sm leading-relaxed;
}

:deep(.prose p) {
  @apply mb-2;
}

:deep(.prose p:last-child) {
  @apply mb-0;
}

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
