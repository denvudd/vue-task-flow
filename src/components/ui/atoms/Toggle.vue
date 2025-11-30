<script setup lang="ts">
import { Toggle as ArkToggle } from '@ark-ui/vue/toggle'
import { Tooltip as ArkTooltip } from '@ark-ui/vue/tooltip'

interface Props {
  pressed?: boolean
  defaultPressed?: boolean
  disabled?: boolean
  class?: string
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  tooltipOpenDelay?: number
  tooltipCloseDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  (e: 'pressed-change', pressed: boolean): void
  (e: 'update:pressed', pressed: boolean): void
}>()

const handlePressedChange = (pressed: boolean) => {
  emit('pressed-change', pressed)
  emit('update:pressed', pressed)
}
</script>

<template>
  <ArkTooltip.Root v-if="tooltip" :open-delay="tooltipOpenDelay" :close-delay="tooltipCloseDelay">
    <ArkTooltip.Trigger as-child>
      <ArkToggle.Root
        :pressed="pressed"
        :default-pressed="defaultPressed"
        :disabled="disabled"
        :class="props.class"
        @pressed-change="handlePressedChange"
      >
        <slot />
      </ArkToggle.Root>
    </ArkTooltip.Trigger>

    <Teleport to="body">
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          class="tooltip-content z-50 rounded-lg bg-neutral-400 p-2 text-xs text-white shadow-lg"
        >
          {{ tooltip }}
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Teleport>
  </ArkTooltip.Root>

  <ArkToggle.Root
    v-else
    :pressed="pressed"
    :default-pressed="defaultPressed"
    :disabled="disabled"
    :class="props.class"
    @pressed-change="handlePressedChange"
  >
    <slot />
  </ArkToggle.Root>
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
