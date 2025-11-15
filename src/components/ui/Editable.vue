<script setup lang="ts">
import { Editable as ArkEditable } from '@ark-ui/vue/editable'
import { ref, watch } from 'vue'
import { Button } from '@/components/ui'
import { CheckIcon, XIcon } from 'lucide-vue-next'

interface Props {
  value?: string
  placeholder?: string
  disabled?: boolean
  onValueChange?: (details: { value: string }) => void
  onValueCommit?: (details: { value: string }) => void
  onValueCancel?: () => void
  previewClass?: string
  inputClass?: string
  withControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withControls: true,
})

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
    :select-on-focus="false"
    activationMode="click"
    @value-change="handleValueChange"
    @value-commit="handleValueCommit"
    @value-cancel="handleValueCancel"
  >
    <ArkEditable.Area class="text-sm focus:outline-none min-w-[100px]">
      <ArkEditable.Input
        :class="[
          inputClass,
          'w-full bg-transparent focus:outline-none focus:ring-2 rounded px-2 py-1 focus:ring-primary-500 focus:ring-offset-1',
        ]"
      />
      <ArkEditable.Preview
        :class="[
          'cursor-pointer hover:bg-neutral-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-6 w-full',
          previewClass,
        ]"
      />
    </ArkEditable.Area>
    <ArkEditable.Context v-slot="{ editing }">
      <ArkEditable.Control
        v-if="editing && withControls"
        class="flex items-center gap-1 w-full justify-end mt-1"
      >
        <ArkEditable.SubmitTrigger>
          <Button variant="secondary" size="icon">
            <CheckIcon class="size-4" />
          </Button>
        </ArkEditable.SubmitTrigger>
        <ArkEditable.CancelTrigger>
          <Button variant="secondary" size="icon">
            <XIcon class="size-4" />
          </Button>
        </ArkEditable.CancelTrigger>
      </ArkEditable.Control>
    </ArkEditable.Context>
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
