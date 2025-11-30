<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { Button } from '../atoms/Button'

interface Props {
  open?: boolean
  onOpenChange?: (details: { open: boolean }) => void
  lazyMount?: boolean
  unmountOnExit?: boolean
  side?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  width?: string
  showOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lazyMount: false,
  unmountOnExit: false,
  side: 'right',
  size: 'lg',
  showOverlay: true,
})

const sizeClasses = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[32rem]',
  xl: 'w-[48rem]',
  full: 'w-full',
}

const widthStyle = computed(() => {
  if (props.width) {
    return { width: props.width }
  }
  return {}
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
  <ArkDialog.Root v-model:open="isOpen" :lazy-mount="lazyMount" :unmount-on-exit="unmountOnExit">
    <Teleport to="body">
      <ArkDialog.Backdrop
        v-if="showOverlay"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
      />
      <ArkDialog.Positioner
        :class="['fixed inset-y-0 z-50 flex items-stretch', side === 'left' ? 'left-0' : 'right-0']"
      >
        <ArkDialog.Content
          :class="[
            'relative z-50 h-full bg-gray-100 border shadow-lg transition-all sheet-content',
            side === 'left' ? 'border-r border-neutral-200' : 'border-l border-neutral-200',
            width ? '' : sizeClasses[size],
          ]"
          :style="{ ...widthStyle, boxShadow: 'var(--shadow-soft-lg)' }"
          :data-side="side"
        >
          <div class="flex flex-col h-full">
            <!-- Header -->
            <div
              v-if="$slots.title || $slots.header"
              class="flex items-center justify-between px-6 py-4 border-b z-10 border-neutral-200 shrink-0"
            >
              <div class="flex-1 min-w-0">
                <slot name="header">
                  <ArkDialog.Title
                    v-if="$slots.title"
                    class="text-2xl font-semibold text-neutral-900"
                  >
                    <slot name="title" />
                  </ArkDialog.Title>
                </slot>
              </div>
              <ArkDialog.CloseTrigger as-child>
                <Button variant="ghost" size="icon" class="ml-4 shrink-0">
                  <X class="w-4 h-4" />
                </Button>
              </ArkDialog.CloseTrigger>
            </div>

            <!-- Description -->
            <ArkDialog.Description
              v-if="$slots.description"
              class="px-6 pt-4 text-sm text-neutral-600 shrink-0"
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
              class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 shrink-0"
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
/* Sheet animations - slide from right */
.sheet-content[data-side='right'][data-state='open'] {
  animation:
    sheet-fade-in 0.2s ease-out,
    sheet-slide-in-right 0.2s ease-out;
}

.sheet-content[data-side='right'][data-state='closed'] {
  animation:
    sheet-fade-out 0.15s ease-in,
    sheet-slide-out-right 0.15s ease-in;
}

/* Sheet animations - slide from left */
.sheet-content[data-side='left'][data-state='open'] {
  animation:
    sheet-fade-in 0.2s ease-out,
    sheet-slide-in-left 0.2s ease-out;
}

.sheet-content[data-side='left'][data-state='closed'] {
  animation:
    sheet-fade-out 0.15s ease-in,
    sheet-slide-out-left 0.15s ease-in;
}

/* Backdrop animations for sheet */
[data-scope='dialog'][data-part='backdrop'][data-state='open'] {
  animation: sheet-fade-in 0.2s ease-out;
}

[data-scope='dialog'][data-part='backdrop'][data-state='closed'] {
  animation: sheet-fade-out 0.15s ease-in;
}

/* Keyframes */
@keyframes sheet-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes sheet-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes sheet-slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes sheet-slide-out-right {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}

@keyframes sheet-slide-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes sheet-slide-out-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
