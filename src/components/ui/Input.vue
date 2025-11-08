<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  placeholder?: string
  disabled?: boolean
  error?: boolean
  modelValue?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClass = computed(() => {
  const baseClass = 'w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none'
  const borderClass = props.error
    ? 'border-2 border-error-500 focus:border-error-500 focus:ring-error-500'
    : 'border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
  const disabledClass = props.disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'

  return `${baseClass} ${borderClass} ${disabledClass}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :class="inputClass"
    :placeholder="placeholder"
    :disabled="disabled"
    :value="modelValue"
    @input="handleInput"
  />
</template>
