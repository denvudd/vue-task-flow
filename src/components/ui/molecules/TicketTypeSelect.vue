<script setup lang="ts">
import { computed } from 'vue'
import Combobox from '../atoms/Combobox.vue'
import { TICKET_TYPE_OPTIONS, type TicketType } from '@/constants/tickets'
import type { ComboboxItem } from '../atoms/Combobox.vue'

interface Props {
  value?: TicketType | string | null
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  valid?: boolean
  rootClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select type',
})

const emit = defineEmits<{
  (e: 'update:value', value: TicketType | null): void
  (e: 'change', value: TicketType | null): void
}>()

const selectValue = computed(() => {
  return props.value ? [props.value] : []
})

const handleValueChange = (details: { items: ComboboxItem[]; value: string[] }) => {
  const newValue = (details.value[0] as TicketType) || null
  emit('update:value', newValue)
  emit('change', newValue)
}
</script>

<template>
  <Combobox
    :items="TICKET_TYPE_OPTIONS"
    :value="selectValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :valid="valid"
    :root-class="rootClass"
    @on-value-change="handleValueChange"
  />
</template>
