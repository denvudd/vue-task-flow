<script setup lang="ts">
import { CheckIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { TICKET_TYPE_OPTIONS, type TicketType } from '@/constants/tickets'

interface Props {
  value?: TicketType[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: () => [],
})

const emit = defineEmits<{
  (e: 'update:value', value: TicketType[]): void
}>()

const selectedValues = computed({
  get: () => props.value || [],
  set: (newValue) => {
    emit('update:value', newValue)
  },
})

const isChecked = (value: TicketType) => {
  return selectedValues.value.includes(value)
}

const toggleValue = (value: TicketType) => {
  const current = selectedValues.value
  if (current.includes(value)) {
    selectedValues.value = current.filter((v) => v !== value)
  } else {
    selectedValues.value = [...current, value]
  }
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="option in TICKET_TYPE_OPTIONS"
      :key="option.value"
      class="flex items-center gap-2 cursor-pointer"
      @click="!disabled && toggleValue(option.value)"
    >
      <div
        :class="[
          'flex h-4 w-4 items-center justify-center rounded border border-neutral-300 transition-colors',
          isChecked(option.value)
            ? 'bg-primary-500 border-primary-500'
            : 'bg-white hover:border-primary-600',
          disabled && 'opacity-50 cursor-not-allowed',
        ]"
      >
        <CheckIcon v-if="isChecked(option.value)" class="size-3 text-white" />
      </div>
      <label
        :class="[
          'text-sm font-medium text-neutral-700 cursor-pointer flex items-center gap-2',
          disabled && 'cursor-not-allowed opacity-50',
        ]"
      >
        <component :is="option.icon" :class="['size-3.5', option.color]" />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </div>
</template>
