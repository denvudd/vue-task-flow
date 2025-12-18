<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useTicketComments,
  useCanComment,
  type TicketCommentWithAuthor,
} from '@/composables/useTicketComments'
import { useTicketDetails } from '@/composables/useTicketDetails'
import { Button } from '@/components/ui'
import TicketCommentItem from './TicketCommentItem.vue'
import TicketCommentForm from './TicketCommentForm.vue'
import TicketCommentsLoader from './TicketCommentsLoader.vue'

const route = useRoute()
const router = useRouter()
const { currentTicketId } = useTicketDetails()
const { canComment } = useCanComment()

const { data: comments, isLoading } = useTicketComments(currentTicketId)
const highlightedCommentId = ref<string | null>(null)
const isExpanded = ref(false)

const MIN_COMMENTS_TO_COLLAPSE = 3

// Computed to determine which comments to show
const visibleComments = computed((): TicketCommentWithAuthor[] => {
  if (!comments.value || comments.value.length === 0) {
    return []
  }

  // If 3 or fewer comments, or expanded, show all
  if (comments.value.length <= MIN_COMMENTS_TO_COLLAPSE || isExpanded.value) {
    return comments.value
  }

  // Otherwise, show first and last
  const first = comments.value[0]
  const last = comments.value[comments.value.length - 1]
  if (!first || !last) {
    return comments.value
  }
  return [first, last]
})

// Computed to determine if we should show the "Show X replies" button
const shouldShowCollapseButton = computed(() => {
  if (!comments.value) return false
  return comments.value.length > MIN_COMMENTS_TO_COLLAPSE && !isExpanded.value
})

// Computed to get the count of hidden comments
const hiddenCommentsCount = computed(() => {
  if (!comments.value) return 0
  return comments.value.length - 2 // First and last are shown, so subtract 2
})

// Function to check if a comment is in the middle (not first or last)
const isCommentInMiddle = (commentId: string): boolean => {
  if (!comments.value || comments.value.length <= MIN_COMMENTS_TO_COLLAPSE) {
    return false
  }

  const index = comments.value.findIndex((c) => c.id === commentId)
  // Comment is in middle if it's not the first (index 0) and not the last (index === length - 1)
  return index > 0 && index < comments.value.length - 1
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
        // If comment is in the middle, expand the list first
        if (isCommentInMiddle(commentId)) {
          isExpanded.value = true
        }
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
          // If comment is in the middle, expand the list first
          if (isCommentInMiddle(commentId)) {
            isExpanded.value = true
          }
          nextTick(() => {
            highlightComment(commentId)
          })
        }
      }
    }
  },
  { immediate: true },
)

const handleExpandComments = () => {
  isExpanded.value = true
}
</script>

<template>
  <div class="mt-6">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-neutral-600 mb-3">Comments</h3>
    </div>

    <!-- Comments List -->
    <TicketCommentsLoader v-if="isLoading" />

    <div v-else-if="comments && comments.length > 0" class="relative pl-4">
      <!-- Vertical line connecting avatars -->
      <div
        v-if="comments.length > 1"
        class="absolute left-[11px] top-3 w-px bg-neutral-200"
        style="height: calc(100% - 12px)"
      ></div>

      <div class="space-y-4">
        <template v-for="(comment, index) in visibleComments" :key="comment.id">
          <TicketCommentItem
            v-if="comment"
            :comment="comment"
            :is-highlighted="highlightedCommentId === comment.id"
          />

          <!-- Show "Show X replies" button between first and last comment when collapsed -->
          <div
            v-if="
              comment &&
              shouldShowCollapseButton &&
              index === 0 &&
              comments &&
              comments.length > MIN_COMMENTS_TO_COLLAPSE
            "
            class="flex items-center justify-start py-2 h-7"
          >
            <Button
              variant="ghost"
              size="sm"
              @click="handleExpandComments"
              class="text-xs w-full ml-0 justify-start text-neutral-600! hover:text-neutral-900!"
            >
              Show {{ hiddenCommentsCount }} {{ hiddenCommentsCount === 1 ? 'reply' : 'replies' }}
            </Button>
          </div>
        </template>
      </div>
    </div>

    <!-- Add Comment Form -->
    <TicketCommentForm v-if="canComment" />

    <div v-else class="text-center py-4 text-sm text-neutral-500 border-t border-neutral-200">
      <p>You don't have permission to comment on this ticket.</p>
    </div>
  </div>
</template>
