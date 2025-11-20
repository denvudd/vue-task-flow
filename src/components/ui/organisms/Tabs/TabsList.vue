<script setup lang="ts">
import { Tabs as ArkTabs } from '@ark-ui/vue/tabs'
</script>

<template>
  <ArkTabs.List
    class="inline-flex items-center gap-1 border-b border-neutral-200 bg-white relative w-full"
    data-part="list"
  >
    <slot />
  </ArkTabs.List>
</template>

