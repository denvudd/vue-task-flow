<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

const badgeClass = computed(() => {
  const baseClass = 'inline-flex items-center font-medium rounded-full transition-colors'

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
    info: 'bg-info-100 text-info-700',
  }

  return `${baseClass} ${sizeClasses[props.size]} ${variantClasses[props.variant]}`
})
</script>

<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>
