<script setup lang="ts">
import { Progress } from '@ark-ui/vue/progress'
import { computed } from 'vue'

interface Props {
  value: number
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 2,
})

const progressColor = computed(() => {
  if (props.value === 0) return 'bg-error-500'
  if (props.value === 1) return 'bg-warning-500'
  if (props.value === 2) return 'bg-success-500'
  return 'bg-error-500'
})

const progressPercent = computed(() => {
  const range = props.max - props.min
  if (range === 0) return 25

  const percent = ((props.value - props.min) / range) * 100

  if (props.value === props.min) {
    return 25
  }

  if (props.value === props.min + 1) {
    return 60
  }

  if (props.value === props.max) {
    return 100
  }

  return Math.max(25, Math.min(100, percent))
})
</script>

<template>
  <Progress.Root :value="value" :min="min" :max="max" class="w-full">
    <Progress.Track
      class="h-1.5 w-full rounded-full border border-neutral-200 overflow-hidden bg-neutral-100"
    >
      <Progress.Range
        :class="[progressColor, 'h-full transition-all duration-300']"
        :style="{ width: `${progressPercent}%` }"
      />
    </Progress.Track>
  </Progress.Root>
</template>
