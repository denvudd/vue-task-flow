<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  align?: 'left' | 'center' | 'right'
  padding?: 'default' | 'none'
  class?: string
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  padding: 'default',
})

const attrs = useAttrs()

const cellClass = computed(() =>
  [
    props.padding === 'default' ? 'p-2' : '',
    'text-sm text-neutral-600',
    props.align === 'center' ? 'text-center' : '',
    props.align === 'right' ? 'text-right' : '',
    'border-r border-neutral-200 last:border-r-0',
    props.class,
  ]
    .filter(Boolean)
    .join(' '),
)
</script>

<template>
  <td v-bind="{ ...attrs, class: undefined }" :class="[cellClass, attrs.class]">
    <slot />
  </td>
</template>
