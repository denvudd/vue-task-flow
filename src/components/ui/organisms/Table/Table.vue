<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type Density = 'default' | 'comfortable' | 'compact'

interface Props {
  density?: Density
  stickyHeader?: boolean
  class?: string | Record<string, boolean>
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  density: 'comfortable',
  stickyHeader: false,
})

const attrs = useAttrs()

const tableClass = computed(() => {
  const densityClasses: Record<Density, string> = {
    default: 'text-base',
    comfortable: 'text-sm',
    compact: 'text-xs',
  }

  return [
    'w-full border-collapse text-left text-neutral-700',
    densityClasses[props.density],
    props.stickyHeader ? '[&_thead]:sticky [&_thead]:top-0' : '',
  ]
    .filter(Boolean)
    .join(' ')
})
</script>

<template>
  <div class="relative w-full" :class="props.class">
    <table v-bind="{ ...attrs, class: undefined }" :class="[tableClass, attrs.class]">
      <slot />
    </table>
  </div>
</template>
