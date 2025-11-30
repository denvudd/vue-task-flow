<script setup lang="ts">
import { Clipboard } from '@ark-ui/vue/clipboard'
import { CheckIcon, ClipboardCopyIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { Button } from './Button'

const props = defineProps<{
  value: string
  withLabel?: boolean
  label?: string
}>()

const label = computed(() => {
  return props.withLabel ? props.label : null
})
</script>

<template>
  <Clipboard.Root v-model="props.value">
    <Clipboard.Label v-if="label" class="text-sm font-medium text-neutral-700">{{
      label
    }}</Clipboard.Label>
    <Clipboard.Control class="w-full flex items-center gap-1">
      <Clipboard.Input
        class="font-mono text-xs bg-neutral-50 px-3 py-2 rounded border max-w-full w-full scroll-hidden overflow-x-auto border-neutral-200 break-all"
      />
      <Clipboard.Context v-slot="clipboard">
        <Button variant="outline" size="icon" @click="clipboard.copy" tooltip="Copy to clipboard">
          <CheckIcon v-if="clipboard.copied" class="size-4" />
          <ClipboardCopyIcon v-else class="size-4" />
        </Button>
      </Clipboard.Context>
    </Clipboard.Control>
  </Clipboard.Root>
</template>
