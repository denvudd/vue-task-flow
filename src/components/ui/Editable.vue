<script setup lang="ts">
import { Editable as ArkEditable } from '@ark-ui/vue/editable'
import { ref, watch, computed } from 'vue'
import { Pencil, Check, X } from 'lucide-vue-next'

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

// Debug logging
console.log('[Editable] Initial props.value:', props.value)
console.log('[Editable] Initial editableValue:', editableValue.value)

// Sync value from props
watch(
  () => props.value,
  (newValue) => {
    console.log('[Editable] Props value changed:', newValue)
    editableValue.value = newValue ?? ''
    console.log('[Editable] Updated editableValue:', editableValue.value)
  },
  { immediate: true },
)

watch(editableValue, (newValue) => {
  console.log('[Editable] editableValue changed:', newValue)
  console.log('[Editable] editableValue type:', typeof newValue)
  console.log('[Editable] editableValue length:', newValue?.length)
  console.log('[Editable] editableValue truthy:', !!newValue)
})

const displayText = computed(() => {
  const text = editableValue.value || props.placeholder || 'Click to edit'
  console.log('[Editable] displayText computed:', text)
  return text
})

const editTriggerRef = ref<HTMLElement | null>(null)

const handleDoubleClick = () => {
  if (!props.disabled && editTriggerRef.value) {
    editTriggerRef.value.click()
  }
}

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
    v-model:value="editableValue"
    :disabled="disabled"
    @value-change="handleValueChange"
    @value-commit="handleValueCommit"
    @value-cancel="handleValueCancel"
  >
    <ArkEditable.Area
      class="px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 min-w-[100px]"
    >
      <ArkEditable.Input
        class="w-full bg-transparent focus:outline-none"
        :placeholder="placeholder"
      />
      <ArkEditable.Preview
        class="cursor-pointer hover:bg-neutral-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[1.5rem]"
        @dblclick="handleDoubleClick"
      >
        <span
          v-if="editableValue"
          class="inline-block w-full"
          :title="`DEBUG: editableValue=${editableValue}, props.value=${props.value}`"
          >{{ editableValue }}</span
        >
        <span
          v-else
          class="text-neutral-400 inline-block w-full"
          :title="`DEBUG: No value, props.value=${props.value}`"
          >{{ placeholder || 'Click to edit' }}</span
        >
      </ArkEditable.Preview>
    </ArkEditable.Area>
    <!-- <ArkEditable.Control class="flex items-center gap-1 mt-1">
      <ArkEditable.EditTrigger
        ref="editTriggerRef"
        class="p-1 rounded hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Pencil class="w-3 h-3 text-neutral-600" />
      </ArkEditable.EditTrigger>
      <ArkEditable.SubmitTrigger
        class="p-1 rounded hover:bg-success-100 transition-colors focus:outline-none focus:ring-2 focus:ring-success-500"
      >
        <Check class="w-3 h-3 text-success-600" />
      </ArkEditable.SubmitTrigger>
      <ArkEditable.CancelTrigger
        class="p-1 rounded hover:bg-error-100 transition-colors focus:outline-none focus:ring-2 focus:ring-error-500"
      >
        <X class="w-3 h-3 text-error-600" />
      </ArkEditable.CancelTrigger>
    </ArkEditable.Control> -->
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
