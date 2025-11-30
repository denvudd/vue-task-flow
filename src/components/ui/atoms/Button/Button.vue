<script setup lang="ts">
import { computed } from 'vue'
import { Tooltip as ArkTooltip } from '@ark-ui/vue/tooltip'
import { buttonVariants, type ButtonVariants } from './utils'
import { cn } from '@/lib/utils'

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: string
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

const buttonClass = computed(() => buttonVariants({ variant: props.variant, size: props.size }))
</script>

<template>
  <ArkTooltip.Root
    v-if="tooltip || $slots.tooltip"
    :open-delay="tooltipOpenDelay"
    :close-delay="tooltipCloseDelay"
  >
    <ArkTooltip.Trigger as-child>
      <component :is="as" :class="cn(buttonClass, props.class)" v-bind="$attrs">
        <slot />
      </component>
    </ArkTooltip.Trigger>

    <Teleport to="body">
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          v-if="$slots.tooltip"
          class="tooltip-content z-50 rounded-lg bg-neutral-400 p-2 text-xs text-white shadow-lg"
        >
          <slot name="tooltip" />
        </ArkTooltip.Content>
        <ArkTooltip.Content
          v-else
          class="tooltip-content z-50 rounded-lg bg-neutral-400 p-2 text-xs text-white shadow-lg"
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
