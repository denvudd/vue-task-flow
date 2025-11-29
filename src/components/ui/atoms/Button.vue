<script setup lang="ts">
import { computed } from 'vue'
import { Tooltip as ArkTooltip } from '@ark-ui/vue/tooltip'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  as?: string
  tooltip?: string
  tooltipOpenDelay?: number
  tooltipCloseDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  as: 'button',
  tooltipOpenDelay: 200,
  tooltipCloseDelay: 200,
})

const buttonClass = computed(() => {
  const baseClass =
    'inline-flex items-center cursor-pointer justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  }

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500',
    secondary:
      'bg-primary-100 text-primary-700 hover:bg-primary-200 active:bg-primary-300 focus-visible:ring-primary-500',
    ghost:
      'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 focus-visible:ring-neutral-300',
    outline:
      'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 focus-visible:ring-neutral-300',
    danger:
      'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500',
  }

  return `${baseClass} ${sizeClasses[props.size]} ${variantClasses[props.variant]} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2`
})
</script>

<template>
  <ArkTooltip.Root v-if="tooltip" :open-delay="tooltipOpenDelay" :close-delay="tooltipCloseDelay">
    <ArkTooltip.Trigger as-child>
      <component :is="as" :class="buttonClass" v-bind="$attrs">
        <slot />
      </component>
    </ArkTooltip.Trigger>

    <Teleport to="body">
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          class="tooltip-content z-50 rounded-lg bg-neutral-400 p-2 text-xs font-medium text-white shadow-ьв"
        >
          {{ tooltip }}
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Teleport>
  </ArkTooltip.Root>

  <component v-else :is="as" :class="buttonClass" v-bind="$attrs">
    <slot />
  </component>
</template>

<style scoped>
.tooltip-content {
  animation: tooltip-fade-in 0.2s ease-out;
}

.tooltip-arrow {
  --arrow-size: 8px;
  --arrow-background: theme('colors.neutral.800');
}

.tooltip-arrow-tip {
  border-color: var(--arrow-background);
  border-width: var(--arrow-size);
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
