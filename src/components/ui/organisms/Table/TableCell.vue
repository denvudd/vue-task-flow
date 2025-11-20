<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  align?: 'left' | 'center' | 'right'
  padding?: 'default' | 'none'
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  padding: 'default',
})

const attrs = useAttrs()

const cellClass = computed(() =>
  [
    props.padding === 'default' ? 'py-3 px-4' : '',
    'text-sm text-neutral-600',
    props.align === 'center' ? 'text-center' : '',
    props.align === 'right' ? 'text-right' : '',
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

