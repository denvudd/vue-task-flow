<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
</script>

<template>
  <tbody v-bind="{ ...attrs, class: undefined }" :class="['divide-y divide-neutral-100', attrs.class]">
    <slot />
  </tbody>
</template>

