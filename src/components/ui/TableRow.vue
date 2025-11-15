<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

interface Props {
  hover?: boolean
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  hover: true,
})

const attrs = useAttrs()
const trRef = ref<HTMLTableRowElement>()

defineExpose({
  $el: trRef,
})

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
  <tr ref="trRef" v-bind="{ ...attrs, class: undefined }" :class="[rowClass, attrs.class]">
    <slot />
  </tr>
</template>

