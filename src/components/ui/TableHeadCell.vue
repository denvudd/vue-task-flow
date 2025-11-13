<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  align?: 'left' | 'center' | 'right'
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
})

const attrs = useAttrs()

const cellClass = computed(() =>
  [
    'py-3 px-4 text-sm font-semibold text-neutral-700',
    props.align === 'center' ? 'text-center' : '',
    props.align === 'right' ? 'text-right' : '',
  ]
    .filter(Boolean)
    .join(' '),
)
</script>

<template>
  <th v-bind="{ ...attrs, class: undefined }" :class="[cellClass, attrs.class]">
    <slot />
  </th>
</template>

