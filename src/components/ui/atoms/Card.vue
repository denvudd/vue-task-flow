<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'elevated' | 'outlined'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const cardClass = computed(() => {
  const baseClass = 'rounded-xl p-6 transition-all'

  const variantClasses = {
    default: 'bg-white border border-neutral-200',
    elevated: 'bg-white border border-neutral-200',
    outlined: 'bg-transparent border-2 border-neutral-300',
  }

  return `${baseClass} ${variantClasses[props.variant]}`
})

const cardStyle = computed(() => {
  if (props.variant === 'default') {
    return { boxShadow: 'var(--shadow-soft)' }
  }
  if (props.variant === 'elevated') {
    return { boxShadow: 'var(--shadow-soft-lg)' }
  }
  return {}
})
</script>

<template>
  <div :class="cardClass" :style="cardStyle">
    <slot />
  </div>
</template>
