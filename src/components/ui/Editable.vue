<script setup lang="ts">
import { Editable as ArkEditable } from '@ark-ui/vue/editable'
import { ref, watch } from 'vue'

interface Props {
  value?: string
  placeholder?: string
  disabled?: boolean
  onValueChange?: (details: { value: string }) => void
  onValueCommit?: (details: { value: string }) => void
  onValueCancel?: () => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [value: string]
}>()

const editableValue = ref(props.value ?? '')

watch(
  () => props.value,
  (newValue) => {
    editableValue.value = newValue ?? ''
  },
  { immediate: true },
)

const handleValueChange = (details: { value: string }) => {
  editableValue.value = details.value
  emit('update:value', details.value)
  props.onValueChange?.(details)
}

const handleValueCommit = (details: { value: string }) => {
  props.onValueCommit?.(details)
}

const handleValueCancel = () => {
  editableValue.value = props.value ?? ''
  props.onValueCancel?.()
}
</script>

<template>
  <ArkEditable.Root
    v-model="editableValue"
    :placeholder="placeholder"
    :disabled="disabled"
    activationMode="dblclick"
    @value-change="handleValueChange"
    @value-commit="handleValueCommit"
    @value-cancel="handleValueCancel"
  >
    <ArkEditable.Area
      class="px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 min-w-[100px]"
    >
      <ArkEditable.Input class="w-full bg-transparent focus:outline-none" />
      <ArkEditable.Preview
        class="cursor-pointer hover:bg-neutral-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-6"
      />
    </ArkEditable.Area>
  </ArkEditable.Root>
</template>

<style>
/* Editable animations */
[data-scope='editable'][data-part='area'][data-editing] {
  background: white;
  border: 1px solid rgb(59 130 246); /* primary-500 */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Ensure Preview content is visible */
[data-scope='editable'][data-part='preview'] {
  display: inline-block !important;
  min-height: 1.5rem;
  width: 100%;
  color: inherit;
  line-height: 1.5;
}

[data-scope='editable'][data-part='preview'] span {
  display: inline-block;
  width: 100%;
  min-height: 1.5rem;
}
</style>
