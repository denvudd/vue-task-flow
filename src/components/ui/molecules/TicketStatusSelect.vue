<script setup lang="ts">
import { computed } from 'vue'
import FieldSelect from '../atoms/FieldSelect.vue'
import { TICKET_STATUS_OPTIONS, type TicketStatus } from '@/constants/tickets'
import type { SelectItem } from '../atoms/FieldSelect.vue'

interface Props {
  value?: TicketStatus | string | null
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  valid?: boolean
  rootClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select status',
})

const emit = defineEmits<{
  (e: 'update:value', value: TicketStatus | null): void
  (e: 'change', value: TicketStatus | null): void
}>()

const selectValue = computed(() => {
  return props.value ? [props.value] : []
})

const handleValueChange = (details: { items: SelectItem[]; value: string[] }) => {
  const newValue = (details.value[0] as TicketStatus) || null
  emit('update:value', newValue)
  emit('change', newValue)
}
</script>

<template>
  <FieldSelect
    :items="TICKET_STATUS_OPTIONS"
    :value="selectValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :invalid="invalid"
    :valid="valid"
    :root-class="rootClass"
    @on-value-change="handleValueChange"
  />
</template>

