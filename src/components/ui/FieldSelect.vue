<script setup lang="ts">
import { Field as ArkField } from '@ark-ui/vue/field'
import { Select as SelectComponent, createListCollection } from '@ark-ui/vue/select'
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
}

const props = defineProps<Props>()
const collection = createListCollection({ items: props.items })

const displayValue = computed(() => {
  if (!props.value || props.value.length === 0) return ''
  const selectedValue = props.value[0]
  const selectedItem = props.items.find((item) => item.value === selectedValue)
  return selectedItem?.label || selectedValue || ''
})
</script>

<template>
  <ArkField.Root :required="required" :disabled="disabled" :invalid="invalid">
    <div class="space-y-2">
      <!-- Label -->
      <ArkField.Label v-if="label" class="block text-sm font-medium text-neutral-700">
        <slot name="label">{{ label }}</slot>
        <span v-if="required" class="text-error-500 ml-1">*</span>
      </ArkField.Label>

      <!-- Select Control -->
      <div class="relative">
        <SelectComponent.Root
          :collection="collection"
          :value="value"
          :disabled="disabled"
          :multiple="multiple"
          @value-change="onValueChange"
        >
          <SelectComponent.Trigger
            :class="[
              'w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none',
              'border focus:ring-2',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed',
              'flex items-center justify-between gap-2',
              invalid
                ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                : valid
                  ? 'border-success-500 focus:border-success-500 focus:ring-success-500'
                  : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
            ]"
            :disabled="disabled"
          >
            <SelectComponent.ValueText :placeholder="placeholder">
              <span v-if="displayValue">{{ displayValue }}</span>
              <span v-else class="text-neutral-400">{{ placeholder || 'Select...' }}</span>
            </SelectComponent.ValueText>
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
              <SelectComponent.Indicator>
                <ChevronDownIcon />
              </SelectComponent.Indicator>
            </div>
          </SelectComponent.Trigger>

          <Teleport to="body">
            <SelectComponent.Positioner>
              <SelectComponent.Content
                :class="[
                  'z-50 rounded-lg border border-neutral-300 bg-white shadow-lg',
                  'overflow-hidden',
                ]"
                style="min-width: var(--reference-width); width: var(--reference-width)"
              >
                <SelectComponent.ItemGroup>
                  <SelectComponent.Item v-for="item in items" :key="item.value" :item="item">
                    <SelectComponent.ItemText class="text-sm">{{
                      item.label
                    }}</SelectComponent.ItemText>
                    <SelectComponent.ItemIndicator class="text-primary-600">
                      <CheckIcon class="size-4" />
                    </SelectComponent.ItemIndicator>
                  </SelectComponent.Item>
                </SelectComponent.ItemGroup>
              </SelectComponent.Content>
            </SelectComponent.Positioner>
          </Teleport>

          <SelectComponent.HiddenSelect />
        </SelectComponent.Root>
      </div>

      <!-- Helper Text -->
      <ArkField.HelperText v-if="helperText && !invalid" class="text-xs text-neutral-500">
        <slot name="helperText">{{ helperText }}</slot>
      </ArkField.HelperText>

      <!-- Error Text -->
      <ArkField.ErrorText v-if="(errorText || invalid) && invalid" class="text-xs text-error-600">
        <slot name="errorText">{{ errorText || 'This field is required' }}</slot>
      </ArkField.ErrorText>
    </div>
  </ArkField.Root>
</template>

<style>
/* Animations for Select content open/close */
[data-scope='select'][data-part='content'][data-state='open'] {
  animation: select-fade-in 0.25s ease-out;
}

[data-scope='select'][data-part='content'][data-state='closed'] {
  animation: select-fade-out 0.2s ease-in;
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
