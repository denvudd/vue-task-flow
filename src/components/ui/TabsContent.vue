<script setup lang="ts">
import { Tabs as ArkTabs } from '@ark-ui/vue/tabs'

interface Props {
  value: string
}

const props = defineProps<Props>()
</script>

<template>
  <ArkTabs.Content
    :value="props.value"
    class="mt-4 focus-visible:outline-none"
    data-part="content"
  >
    <slot />
  </ArkTabs.Content>
</template>

