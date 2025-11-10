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
    class="px-4 py-2 text-sm font-medium text-neutral-600 transition-colors border-b-2 border-transparent hover:text-neutral-900 hover:border-neutral-300 data-[selected]:text-primary-600 data-[selected]:border-primary-600 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    data-part="trigger"
  >
    <slot />
  </ArkTabs.Trigger>
</template>

