<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
</script>

<template>
  <thead
    v-bind="{ ...attrs, class: undefined }"
    :class="['bg-neutral-50 text-xs font-medium text-neutral-500 tracking-wide', attrs.class]"
  >
    <slot />
  </thead>
</template>

