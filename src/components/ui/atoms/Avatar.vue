<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Avatar as ArkAvatar } from '@ark-ui/vue/avatar'
import { computed } from 'vue'

interface Props {
  src?: string | null
  alt?: string
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const initials = computed(() => {
  if (!props.name) return 'U'

  const parts = props.name.trim().split(/\s+/)

  if (parts.length >= 2) {
    return (parts[0]?.charAt(0) || '') + (parts[parts.length - 1]?.charAt(0) || '').toUpperCase()
  }
  return parts[0]?.charAt(0) || 'U'
})
</script>

<template>
  <ArkAvatar.Root
    :class="
      cn(
        'inline-flex items-center justify-center border border-neutral-200 relative rounded-full bg-primary-50 text-primary-700 font-medium overflow-hidden',
        sizeClasses[size],
        props.class,
      )
    "
  >
    <ArkAvatar.Fallback>{{ initials }}</ArkAvatar.Fallback>
    <ArkAvatar.Image
      v-if="src"
      :src="src"
      :alt="alt || name || 'Avatar'"
      class="size-full shrink-0"
    />
  </ArkAvatar.Root>
</template>
