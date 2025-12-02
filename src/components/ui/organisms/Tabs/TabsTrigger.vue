<script setup lang="ts">
import { Tabs as ArkTabs } from '@ark-ui/vue/tabs'

interface Props {
  value: string
  disabled?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <ArkTabs.Trigger
    :value="props.value"
    :disabled="props.disabled"
    class="px-3 py-1.5 flex items-center gap-1.5 text-sm font-medium rounded-full text-neutral-600 transition-colors hover:text-neutral-900 data-selected:text-primary-600 data-selected:bg-neutral-200 data-disabled:opacity-50 data-disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    data-part="trigger"
  >
    <slot />
  </ArkTabs.Trigger>
</template>
