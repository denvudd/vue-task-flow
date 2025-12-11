<script setup lang="ts">
import { Popover as ArkPopover } from '@ark-ui/vue/popover'
import type * as popover from '@zag-js/popover'
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  lazyMount?: boolean
  unmountOnExit?: boolean
  positioning?: popover.PositioningOptions
  class?: string
  triggerAsChild?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  lazyMount: false,
  unmountOnExit: false,
  positioning: () => ({ placement: 'bottom', offset: { mainAxis: 8 } }),
  triggerAsChild: false,
})

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
  <ArkPopover.Root
    v-model:open="isOpen"
    :lazy-mount="lazyMount"
    :unmount-on-exit="unmountOnExit"
    :positioning="positioning"
  >
    <ArkPopover.Trigger :as-child="triggerAsChild">
      <slot name="trigger" />
    </ArkPopover.Trigger>

    <Teleport to="body">
      <ArkPopover.Positioner>
        <ArkPopover.Content
          :class="
            cn(
              'z-50 w-[--reference-width] rounded-lg border border-neutral-200 bg-white shadow-lg transition-all popover-content',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
              {
                'slide-in-from-bottom-2': positioning?.placement === 'bottom',
                'slide-in-from-top-2': positioning?.placement === 'top',
                'slide-in-from-left-2': positioning?.placement === 'left',
                'slide-in-from-right-2': positioning?.placement === 'right',
                'slide-out-to-bottom-2': positioning?.placement === 'bottom',
              },
              'max-h-[50vh] overflow-auto',
              $attrs.class ?? '',
            )
          "
          style="box-shadow: var(--shadow-soft-lg)"
        >
          <div class="flex flex-col max-h-[90vh]">
            <div
              v-if="$slots.title || $slots.header"
              class="flex items-center justify-between p-3 border-b border-neutral-200"
            >
              <div class="flex-1">
                <slot name="header">
                  <ArkPopover.Title
                    v-if="$slots.title"
                    class="text-lg font-semibold text-neutral-900"
                  >
                    <slot name="title" />
                  </ArkPopover.Title>
                </slot>
              </div>
              <ArkPopover.CloseTrigger as-child>
                <Button variant="ghost" size="icon" class="ml-2 h-6 w-6">
                  <X class="w-3.5 h-3.5" />
                </Button>
              </ArkPopover.CloseTrigger>
            </div>

            <ArkPopover.Description
              v-if="$slots.description"
              class="px-4 pt-3 text-sm text-neutral-600"
            >
              <slot name="description" />
            </ArkPopover.Description>

            <div class="flex-1 p-3" @click.stop>
              <slot />
            </div>

            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-2 px-3 py-1 border-t border-neutral-200"
            >
              <slot name="footer" />
            </div>
          </div>
        </ArkPopover.Content>
      </ArkPopover.Positioner>
    </Teleport>
  </ArkPopover.Root>
</template>
