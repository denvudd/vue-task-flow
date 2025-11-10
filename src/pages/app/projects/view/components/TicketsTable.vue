<script setup lang="ts">
import { computed } from 'vue'
import { Button, Badge } from '@/components/ui'
import { useDeleteTicket } from '@/composables/useTickets'
import { Plus, Trash2 } from 'lucide-vue-next'

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
  creator?: {
    id: string
    full_name?: string | null
    username?: string | null
  } | null
  due_date?: string | null
  created_at?: string | null
}

interface Props {
  tickets: Ticket[]
  projectId: string
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  create: []
}>()

const { mutateAsync: deleteTicket, isPending: isDeleting } = useDeleteTicket()

const statusColors = {
  todo: 'info',
  in_progress: 'warning',
  review: 'primary',
  done: 'success',
  archived: 'error',
} as const

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
} as const

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleDelete = async (ticketId: string) => {
  if (confirm('Are you sure you want to delete this ticket?')) {
    try {
      await deleteTicket({ ticketId, projectId: props.projectId })
    } catch (error) {
      console.error('Failed to delete ticket:', error)
    }
  }
}

const getStatusColor = (status: string | null | undefined) => {
  if (!status) return 'info'
  return statusColors[status as keyof typeof statusColors] || 'info'
}

const getPriorityColor = (priority: string | null | undefined) => {
  if (!priority) return 'info'
  return priorityColors[priority as keyof typeof priorityColors] || 'info'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-neutral-900">Tickets</h3>
      <Button size="sm" @click="emit('create')">
        <Plus class="w-4 h-4 mr-2" />
        Create Ticket
      </Button>
    </div>

      <div v-if="isLoading" class="flex justify-center items-center py-8">
        <div class="text-neutral-600">Loading tickets...</div>
      </div>

      <div v-else-if="!tickets || tickets.length === 0" class="text-center py-8">
        <p class="text-neutral-600 mb-2 font-medium">No tickets yet</p>
        <p class="text-neutral-500 text-sm">Create your first ticket to get started</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-neutral-200">
              <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Title</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Status</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Priority</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Type</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Assignee</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Due Date</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Created</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in tickets"
              :key="ticket.id"
              class="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="space-y-1">
                  <div class="font-medium text-neutral-900">{{ ticket.title }}</div>
                  <div v-if="ticket.description" class="text-xs text-neutral-500 line-clamp-1">
                    {{ ticket.description }}
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <Badge
                  v-if="ticket.status"
                  :variant="getStatusColor(ticket.status)"
                  size="sm"
                >
                  {{ ticket.status }}
                </Badge>
                <span v-else class="text-neutral-400 text-sm">—</span>
              </td>
              <td class="py-3 px-4">
                <Badge
                  v-if="ticket.priority"
                  :variant="getPriorityColor(ticket.priority)"
                  size="sm"
                >
                  {{ ticket.priority }}
                </Badge>
                <span v-else class="text-neutral-400 text-sm">—</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="ticket.type" class="text-sm text-neutral-700">{{ ticket.type }}</span>
                <span v-else class="text-neutral-400 text-sm">—</span>
              </td>
              <td class="py-3 px-4">
                <span v-if="ticket.assignee" class="text-sm text-neutral-700">
                  {{ ticket.assignee.full_name || ticket.assignee.username || ticket.assignee.email }}
                </span>
                <span v-else class="text-neutral-400 text-sm">Unassigned</span>
              </td>
              <td class="py-3 px-4">
                <span
                  v-if="ticket.due_date"
                  :class="[
                    'text-sm',
                    new Date(ticket.due_date) < new Date()
                      ? 'text-error-600 font-medium'
                      : 'text-neutral-700',
                  ]"
                >
                  {{ formatDateTime(ticket.due_date) }}
                </span>
                <span v-else class="text-neutral-400 text-sm">—</span>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm text-neutral-600">{{ formatDate(ticket.created_at) }}</span>
              </td>
              <td class="py-3 px-4">
                <div class="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    :disabled="isDeleting"
                    @click="handleDelete(ticket.id)"
                    class="text-error-600 hover:text-error-700 hover:bg-error-50"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</template>

