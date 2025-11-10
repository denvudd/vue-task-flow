<script setup lang="ts">
import { Tabs as ArkTabs } from '@ark-ui/vue/tabs'
import { computed } from 'vue'

interface RootProps {
  defaultValue?: string
  value?: string
  orientation?: 'horizontal' | 'vertical'
}

const rootProps = defineProps<RootProps>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const tabsValue = computed({
  get: () => rootProps.value,
  set: (value) => emit('update:value', value || ''),
})
</script>

<template>
  <ArkTabs.Root
    :value="tabsValue"
    :default-value="defaultValue"
    :orientation="orientation"
    @value-change="(e) => (tabsValue = e.value)"
  >
    <slot />
  </ArkTabs.Root>
</template>
