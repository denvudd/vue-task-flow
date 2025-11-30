<script setup lang="ts">
import { Toast as ArkToast, Toaster as ArkToaster } from '@ark-ui/vue/toast'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'
import { createToaster } from '@ark-ui/vue/toast'
import { Button } from '../atoms/Button'

interface Props {
  toaster: ReturnType<typeof createToaster>
}

const props = defineProps<Props>()

const getToastTypeStyles = (type?: string) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-success-50',
        border: 'border-success-200',
        icon: 'text-success-600',
        title: 'text-success-900',
        description: 'text-success-700',
      }
    case 'error':
      return {
        bg: 'bg-error-50',
        border: 'border-error-200',
        icon: 'text-error-600',
        title: 'text-error-900',
        description: 'text-error-700',
      }
    case 'warning':
      return {
        bg: 'bg-warning-50',
        border: 'border-warning-200',
        icon: 'text-warning-600',
        title: 'text-warning-900',
        description: 'text-warning-700',
      }
    case 'info':
    default:
      return {
        bg: 'bg-info-50',
        border: 'border-info-200',
        icon: 'text-info-600',
        title: 'text-info-900',
        description: 'text-info-700',
      }
  }
}

const getToastIcon = (type?: string) => {
  switch (type) {
    case 'success':
      return CheckCircle2
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'info':
    default:
      return Info
  }
}
</script>

<template>
  <Teleport to="body">
    <ArkToaster :toaster="toaster" class="fixed z-50 pointer-events-none" v-slot="toast">
      <ArkToast.Root
        :class="[
          'group relative flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg transition-all pointer-events-auto min-w-[320px] max-w-md',
          getToastTypeStyles(toast.type).bg,
          getToastTypeStyles(toast.type).border,
        ]"
      >
        <component
          :is="getToastIcon(toast.type)"
          :class="['h-5 w-5 flex-shrink-0 mt-0.5', getToastTypeStyles(toast.type).icon]"
        />
        <div class="flex-1 min-w-0">
          <ArkToast.Title
            v-if="toast.title"
            :class="['text-sm font-semibold mb-1', getToastTypeStyles(toast.type).title]"
          >
            {{ toast.title }}
          </ArkToast.Title>
          <ArkToast.Description
            v-if="toast.description"
            :class="['text-sm', getToastTypeStyles(toast.type).description]"
          >
            {{ toast.description }}
          </ArkToast.Description>
        </div>
        <ArkToast.CloseTrigger as-child>
          <Button variant="ghost" size="sm" class="flex-shrink-0">
            <X class="w-4 h-4" />
          </Button>
        </ArkToast.CloseTrigger>
      </ArkToast.Root>
    </ArkToaster>
  </Teleport>
</template>

<style scoped>
/* Toast animations */
[data-scope='toast'][data-part='root'][data-state='open'] {
  animation: toast-slide-in 0.3s ease-out;
}

[data-scope='toast'][data-part='root'][data-state='closed'] {
  animation: toast-slide-out 0.2s ease-in;
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
