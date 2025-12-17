<script setup lang="ts">
import { Menu as ArkMenu } from '@ark-ui/vue/menu'
import { computed } from 'vue'

interface Props {
  open?: boolean
  onOpenChange?: (details: { open: boolean }) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const isOpen = computed({
  get: () => props.open ?? false,
  set: (value) => {
    emit('update:open', value)
    props.onOpenChange?.({ open: value })
  },
})
</script>

<template>
  <ArkMenu.Root v-model:open="isOpen" :lazy-mount="true" :unmount-on-exit="true">
    <slot name="trigger" />
    <Teleport to="body">
      <ArkMenu.Positioner style="z-index: 99999">
        <ArkMenu.Content
          class="min-w-[180px] rounded-lg bg-white border border-neutral-200 shadow-lg py-1 focus:outline-none"
          style="box-shadow: var(--shadow-soft-lg)"
        >
          <slot />
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </Teleport>
  </ArkMenu.Root>
</template>

<style>
@reference "../../../style.css";

[data-scope='menu'][data-part='positioner'] {
  z-index: 50;
}

[data-scope='menu'][data-part='content'] {
  z-index: 50;
}

[data-scope='menu'][data-part='content'][data-state='open'] {
  @apply animate-in fade-in duration-300 zoom-in-95;
}

[data-scope='menu'][data-part='content'][data-state='closed'] {
  @apply animate-out fade-out duration-300 zoom-out-95;
}

[data-scope='menu'][data-part='item'] {
  @apply flex items-center gap-2 px-2 py-1 text-xs font-medium text-neutral-700 cursor-pointer transition-colors;
  @apply hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none;
}

[data-scope='menu'][data-part='item'][data-highlighted] {
  @apply bg-neutral-50;
}

[data-scope='menu'][data-part='item'][data-disabled] {
  @apply opacity-50 cursor-not-allowed;
}

[data-scope='menu'][data-part='separator'] {
  @apply my-1 h-px bg-neutral-200;
}

[data-scope='menu'][data-part='item-group'] {
  @apply px-1 py-1;
}

[data-scope='menu'][data-part='item-group-label'] {
  @apply px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider;
}
</style>
