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
  <ArkMenu.Root v-model:open="isOpen">
    <slot name="trigger" />
    <Teleport to="body">
      <ArkMenu.Positioner>
        <ArkMenu.Content
          class="min-w-[200px] rounded-lg bg-white border border-neutral-200 shadow-lg py-1 focus:outline-none z-50"
          style="box-shadow: var(--shadow-soft-lg)"
        >
          <slot />
        </ArkMenu.Content>
      </ArkMenu.Positioner>
    </Teleport>
  </ArkMenu.Root>
</template>

<style>
@reference 'tailwindcss';

[data-scope='menu'][data-part='positioner'] {
  z-index: 50;
}

[data-scope='menu'][data-part='content'] {
  z-index: 50;
}

[data-scope='menu'][data-part='content'][data-state='open'] {
  animation: menu-fade-in 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

[data-scope='menu'][data-part='content'][data-state='closed'] {
  animation: menu-fade-out 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

[data-scope='menu'][data-part='item'] {
  @apply flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 cursor-pointer transition-colors;
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

@keyframes menu-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes menu-fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
