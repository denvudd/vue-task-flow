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
@reference "../../../style.css";

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
