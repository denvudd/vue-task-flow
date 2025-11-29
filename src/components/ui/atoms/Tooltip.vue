<script setup lang="ts">
import { Tooltip as ArkTooltip } from '@ark-ui/vue/tooltip'

interface Props {
  open?: boolean
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  openDelay: 400,
  closeDelay: 200,
  disabled: false,
})

const emit = defineEmits<{
  openChange: [details: { open: boolean }]
}>()

const handleOpenChange = (details: { open: boolean }) => {
  emit('openChange', details)
}
</script>

<template>
  <ArkTooltip.Root
    v-if="!disabled"
    :open="open"
    :open-delay="openDelay"
    :close-delay="closeDelay"
    @open-change="handleOpenChange"
  >
    <ArkTooltip.Trigger as-child>
      <slot name="trigger" />
    </ArkTooltip.Trigger>

    <Teleport to="body">
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          class="tooltip-content z-50 rounded-lg bg-neutral-800 px-3 py-2 text-xs text-white shadow-lg"
        >
          <slot name="content" />
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Teleport>
  </ArkTooltip.Root>

  <slot v-else name="trigger" />
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
