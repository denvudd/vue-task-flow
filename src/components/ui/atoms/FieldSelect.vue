<script setup lang="ts">
import { Select, createListCollection } from '@ark-ui/vue/select'
import { ChevronDownIcon, CheckIcon, CheckCircle2Icon } from 'lucide-vue-next'
import { computed } from 'vue'

export interface SelectItem {
  label: string
  value: string
  disabled?: boolean
}

interface Props {
  label?: string
  helperText?: string
  errorText?: string
  placeholder?: string
  items: SelectItem[]
  value?: string[]
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  valid?: boolean
  multiple?: boolean
  clearable?: boolean
  onValueChange?: (details: { items: SelectItem[]; value: string[] }) => void
  rootClass?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'on-value-change', details: { items: SelectItem[]; value: string[] }): void
}>()

const collection = createListCollection({ items: props.items })

const displayValue = computed(() => {
  if (!props.value || props.value.length === 0) return ''
  const selectedValue = props.value[0]
  const selectedItem = props.items.find((item) => item.value === selectedValue)
  return selectedItem?.label || selectedValue || ''
})

const handleValueChange = (details: { value: string[] }) => {
  const selectedItems = props.items.filter((item) => details.value.includes(item.value))
  const payload = { items: selectedItems, value: details.value }
  emit('on-value-change', payload)
  props.onValueChange?.(payload)
}
</script>

<template>
  <div :class="['space-y-2', rootClass]">
    <label v-if="label" class="block text-sm font-medium text-neutral-700">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>

    <div class="relative">
      <Select.Root
        :collection="collection"
        :value="value"
        :disabled="disabled"
        :multiple="multiple"
        @value-change="handleValueChange"
      >
        <Select.Trigger
          :class="[
            'w-full text-sm transition-colors focus:outline-none',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            'flex items-center justify-between gap-2',
            invalid ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '',
          ]"
          :disabled="disabled"
        >
          <Select.ValueText :placeholder="placeholder">
            <span v-if="displayValue">{{ displayValue }}</span>
            <span v-else class="text-neutral-400">{{ placeholder || 'Select...' }}</span>
          </Select.ValueText>
          <div class="flex items-center gap-1">
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-0"
            >
              <CheckCircle2Icon v-if="valid" class="size-5 text-success-500" />
            </Transition>
            <Select.Indicator>
              <ChevronDownIcon />
            </Select.Indicator>
          </div>
        </Select.Trigger>

        <Teleport to="body">
          <Select.Positioner>
            <Select.Content
              :class="[
                'z-50 rounded-lg border border-neutral-300 bg-white shadow-lg',
                'overflow-hidden min-w-fit',
              ]"
            >
              <Select.ItemGroup>
                <Select.Item v-for="item in items" :key="item.value" :item="item">
                  <Select.ItemText class="text-sm">{{ item.label }}</Select.ItemText>
                  <Select.ItemIndicator class="text-primary-600">
                    <CheckIcon class="size-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.ItemGroup>
            </Select.Content>
          </Select.Positioner>
        </Teleport>

        <Select.HiddenSelect />
      </Select.Root>
    </div>

    <!-- Helper Text -->
    <p v-if="helperText && !invalid" class="text-xs text-neutral-500">
      <slot name="helperText">{{ helperText }}</slot>
    </p>

    <!-- Error Text -->
    <p v-if="(errorText || invalid) && invalid" class="text-xs text-error-600">
      <slot name="errorText">{{ errorText || 'This field is required' }}</slot>
    </p>
  </div>
</template>

<style>
/* Animations for Select content open/close */
[data-scope='select'][data-part='content'][data-state='open'] {
  animation: select-fade-in 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

[data-scope='select'][data-part='content'][data-state='closed'] {
  animation: select-fade-out 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Positioner stretches to trigger width */
[data-scope='select'][data-part='positioner'] {
  width: var(--reference-width);
}

/* Base content surface to match app UI */
[data-scope='select'][data-part='content'] {
  border: 1px solid rgb(212 212 216); /* ~ neutral-300 */
  background: #fff;
  z-index: 50;
  width: 100%;
}

/* Group label emphasis */
[data-scope='select'][data-part='item-group-label'] {
  font-weight: 600;
}

/* Item layout and states */
[data-scope='select'][data-part='item'] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem; /* px-3 py-2 */
}

[data-scope='select'][data-part='item'][data-highlighted] {
  background: rgb(243 244 246); /* neutral-100 */
}

[data-scope='select'][data-part='item'][data-disabled] {
  color: rgb(163 163 163); /* neutral-400 */
}

/* Trigger icon sizing */
[data-scope='select'][data-part='trigger'] svg {
  width: 1em;
  height: 1em;
}

@keyframes select-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes select-fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
