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

const buttonClass = computed(() =>
  buttonVariants({ variant: props.variant, size: props.size, class: props.class }),
)
</script>

<template>
  <ArkTooltip.Root
    v-if="tooltip || $slots.tooltip"
    :open-delay="tooltipOpenDelay"
    :close-delay="tooltipCloseDelay"
  >
    <ArkTooltip.Trigger as-child>
      <component :is="as" :class="buttonClass" v-bind="$attrs">
        <slot />
      </component>
    </ArkTooltip.Trigger>

    <Teleport to="body">
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          v-if="$slots.tooltip"
          class="tooltip-content z-120 rounded-lg bg-neutral-400 p-2 text-xs text-white shadow-lg"
        >
          <slot name="tooltip" />
        </ArkTooltip.Content>
        <ArkTooltip.Content
          v-else
          class="tooltip-content z-120 rounded-lg bg-neutral-400 p-2 text-xs text-white shadow-lg"
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
@reference "../../../../style.css";

.tooltip-content {
  @apply animate-in fade-in duration-300 zoom-in-95;
}

.tooltip-arrow {
  --arrow-size: 8px;
  --arrow-background: theme('colors.neutral.800');
}

.tooltip-arrow-tip {
  border-color: var(--arrow-background);
  border-width: var(--arrow-size);
}
</style>
