<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import Button from './Button.vue'

interface Props {
  open?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  lazyMount?: boolean
  unmountOnExit?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const props = withDefaults(defineProps<Props>(), {
  lazyMount: false,
  unmountOnExit: false,
  size: 'md',
})

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

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
  <ArkDialog.Root v-model:open="isOpen" :lazy-mount="lazyMount" :unmount-on-exit="unmountOnExit">
    <Teleport to="body">
      <ArkDialog.Backdrop
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
      />
      <ArkDialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ArkDialog.Content
          :class="[
            'relative z-50 w-full rounded-xl bg-white border border-neutral-200 shadow-lg transition-all dialog-content',
            sizeClasses[size],
          ]"
          style="box-shadow: var(--shadow-soft-lg)"
        >
          <div class="flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div
              v-if="$slots.title || $slots.header"
              class="flex items-center justify-between px-6 py-4 border-b border-neutral-200"
            >
              <div class="flex-1">
                <slot name="header">
                  <ArkDialog.Title
                    v-if="$slots.title"
                    class="text-lg font-semibold text-neutral-900"
                  >
                    <slot name="title" />
                  </ArkDialog.Title>
                </slot>
              </div>
              <ArkDialog.CloseTrigger as-child>
                <Button variant="ghost" size="sm" class="ml-4">
                  <X class="w-4 h-4" />
                </Button>
              </ArkDialog.CloseTrigger>
            </div>

            <!-- Description -->
            <ArkDialog.Description
              v-if="$slots.description"
              class="px-6 py-4 text-sm text-neutral-600"
            >
              <slot name="description" />
            </ArkDialog.Description>

            <!-- Content -->
            <div class="flex-1 overflow-auto px-6 py-4">
              <slot />
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200"
            >
              <slot name="footer" />
            </div>
          </div>
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </Teleport>
  </ArkDialog.Root>
</template>

<style>
/* Dialog animations */
.dialog-content[data-state='open'] {
  animation:
    dialog-fade-in 0.2s ease-out,
    dialog-zoom-in 0.2s ease-out;
}

.dialog-content[data-state='closed'] {
  animation:
    dialog-fade-out 0.15s ease-in,
    dialog-zoom-out 0.15s ease-in;
}

[data-scope='dialog'][data-part='backdrop'][data-state='open'] {
  animation: dialog-fade-in 0.2s ease-out;
}

[data-scope='dialog'][data-part='backdrop'][data-state='closed'] {
  animation: dialog-fade-out 0.15s ease-in;
}

@keyframes dialog-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes dialog-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes dialog-zoom-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes dialog-zoom-out {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}
</style>
