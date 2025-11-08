<script setup lang="ts">
import { computed } from 'vue'
import Badge from './Badge.vue'

interface Props {
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'blocked'
}

const props = defineProps<Props>()

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'info' as const,
  },
  'in-progress': {
    label: 'In Progress',
    variant: 'info' as const,
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'error' as const,
  },
  blocked: {
    label: 'Blocked',
    variant: 'warning' as const,
  },
}

const config = computed(() => statusConfig[props.status])
</script>

<template>
  <Badge :variant="config.variant">
    {{ config.label }}
  </Badge>
</template>
