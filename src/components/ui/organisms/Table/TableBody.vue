<script setup lang="ts">
import { ref, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const tbodyRef = ref<HTMLTableSectionElement>()

defineExpose({
  $el: tbodyRef,
})
</script>

<template>
  <tbody ref="tbodyRef" v-bind="{ ...attrs, class: undefined }" :class="['divide-y divide-neutral-100', attrs.class]">
    <slot />
  </tbody>
</template>

