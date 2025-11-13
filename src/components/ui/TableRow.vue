<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  hover?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  hover: true,
})

const attrs = useAttrs()

const rowClass = computed(() =>
  [
    'border-b border-neutral-100',
    props.hover ? 'hover:bg-neutral-50 transition-colors' : '',
  ]
    .filter(Boolean)
    .join(' '),
)
</script>

<template>
  <tr v-bind="{ ...attrs, class: undefined }" :class="[rowClass, attrs.class]">
    <slot />
  </tr>
</template>

