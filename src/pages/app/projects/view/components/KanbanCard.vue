<script setup lang="ts">
import { Badge } from '@/components/ui'
import { GripVertical } from 'lucide-vue-next'

interface Ticket {
  id: string
  title: string
  description?: string | null
  status?: string | null
  priority?: string | null
  type?: string | null
  assignee?: {
    id: string
    full_name?: string | null
    username?: string | null
    email?: string | null
  } | null
  due_date?: string | null
  order_index?: number | null
}

interface Props {
  ticket: Ticket
}

const props = defineProps<Props>()

const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.ticket.id)
  }
  // Add visual feedback
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '0.5'
  }
}

const handleDragEnd = (event: DragEvent) => {
  // Reset visual feedback
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '1'
  }
}

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
} as const

const getPriorityColor = (priority: string | null | undefined) => {
  if (!priority) return 'info'
  return priorityColors[priority as keyof typeof priorityColors] || 'info'
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const isOverdue = (dateString: string | null | undefined) => {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}
</script>

<template>
  <div
    :data-ticket-id="ticket.id"
    draggable="true"
    class="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-move group"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="flex items-start gap-2">
      <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical class="w-4 h-4 text-neutral-400" />
      </div>
      <div class="flex-1 min-w-0 space-y-2">
        <div class="font-medium text-sm text-neutral-900 line-clamp-2">
          {{ ticket.title }}
        </div>
        <div v-if="ticket.description" class="text-xs text-neutral-500 line-clamp-2">
          {{ ticket.description }}
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <Badge v-if="ticket.priority" :variant="getPriorityColor(ticket.priority)" size="sm">
            {{ ticket.priority }}
          </Badge>
          <span
            v-if="ticket.due_date"
            :class="[
              'text-xs px-2 py-0.5 rounded',
              isOverdue(ticket.due_date)
                ? 'bg-error-50 text-error-700 font-medium'
                : 'bg-neutral-100 text-neutral-600',
            ]"
          >
            {{ formatDate(ticket.due_date) }}
          </span>
        </div>
        <div v-if="ticket.assignee" class="flex items-center gap-1.5">
          <div class="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
            <span class="text-xs font-medium text-primary-700">
              {{ (ticket.assignee.full_name || ticket.assignee.username || ticket.assignee.email || '?')[0].toUpperCase() }}
            </span>
          </div>
          <span class="text-xs text-neutral-600 truncate">
            {{ ticket.assignee.full_name || ticket.assignee.username || ticket.assignee.email }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

