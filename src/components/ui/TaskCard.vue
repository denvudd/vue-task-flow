<script setup lang="ts">
import Card from './Card.vue'
import Badge from './Badge.vue'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  assignee?: string
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string
}

interface Props {
  task: Task
}

const props = defineProps<Props>()

const priorityColors = {
  low: 'bg-success-100 text-success-700',
  medium: 'bg-warning-100 text-warning-700',
  high: 'bg-error-100 text-error-700',
}
</script>

<template>
  <Card
    variant="default"
    class="cursor-pointer transition-all"
    style="box-shadow: var(--shadow-soft)"
    @mouseenter="$event.currentTarget.style.boxShadow = 'var(--shadow-soft-lg)'"
    @mouseleave="$event.currentTarget.style.boxShadow = 'var(--shadow-soft)'"
  >
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-semibold text-neutral-900">{{ task.title }}</h3>
      <Badge v-if="task.priority" :class="priorityColors[task.priority]">
        {{ task.priority }}
      </Badge>
    </div>

    <p v-if="task.description" class="text-sm text-neutral-600 mb-3">
      {{ task.description }}
    </p>

    <div class="flex items-center gap-2">
      <Badge :variant="task.status === 'completed' ? 'success' : 'info'">
        {{ task.status }}
      </Badge>

      <span v-if="task.assignee" class="text-xs text-neutral-500"> → {{ task.assignee }} </span>

      <span v-if="task.dueDate" class="text-xs text-neutral-500 ml-auto">
        Due: {{ task.dueDate }}
      </span>
    </div>
  </Card>
</template>
