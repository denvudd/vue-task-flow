<script setup lang="ts">
import { Combobox, createListCollection } from '@ark-ui/vue/combobox'
import { CheckIcon, CheckCircle2Icon } from 'lucide-vue-next'
import { computed, ref, watch, type Component } from 'vue'

export interface ComboboxItem {
  label: string
  value: string
  disabled?: boolean
  icon?: Component
  color?: string
  bgColor?: string
}

interface Props {
  label?: string
  helperText?: string
  errorText?: string
  placeholder?: string
  items: ComboboxItem[]
  value?: string[]
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  valid?: boolean
  onValueChange?: (details: { items: ComboboxItem[]; value: string[] }) => void
  rootClass?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'on-value-change', details: { items: ComboboxItem[]; value: string[] }): void
}>()

const filteredItems = ref<ComboboxItem[]>(props.items)
const collection = computed(() => createListCollection({ items: filteredItems.value }))

const displayValue = computed(() => {
  if (!props.value || props.value.length === 0) return ''
  const selectedValue = props.value[0]
  const selectedItem = props.items.find((item) => item.value === selectedValue)
  return selectedItem?.label || selectedValue || ''
})

const selectedIcon = computed(() => {
  if (!props.value || props.value.length === 0) return null
  const selectedValue = props.value[0]
  const selectedItem = props.items.find((item) => item.value === selectedValue)
  return selectedItem?.icon || null
})

const selectedItem = computed(() => {
  if (!props.value || props.value.length === 0) return null
  const selectedValue = props.value[0]
  return props.items.find((item) => item.value === selectedValue) || null
})

const inputValue = ref(displayValue.value)

function filterItems(searchValue: string) {
  if (!searchValue) {
    filteredItems.value = props.items
    return
  }

  const lowerSearch = searchValue.toLowerCase()
  filteredItems.value = props.items.filter((item) => item.label.toLowerCase().includes(lowerSearch))
}

watch(displayValue, (newDisplayValue) => {
  inputValue.value = newDisplayValue
})

watch(
  () => props.items,
  (newItems) => {
    if (!inputValue.value) {
      filteredItems.value = newItems
    } else {
      filterItems(inputValue.value)
    }
  },
  { immediate: true },
)

const handleValueChange = (details: { value: string[] }) => {
  const selectedItems = props.items.filter((item) => details.value.includes(item.value))
  const payload = { items: selectedItems, value: details.value }

  if (details.value.length > 0) {
    const item = props.items.find((item) => item.value === details.value[0])
    if (item) {
      inputValue.value = item.label
    }
  } else {
    inputValue.value = ''
  }

  filteredItems.value = props.items

  emit('on-value-change', payload)
  props.onValueChange?.(payload)
}

const handleInputValueChange = (details: { inputValue: string }) => {
  inputValue.value = details.inputValue
  filterItems(details.inputValue)
}

const handleOpenChange = (details: { open: boolean }) => {
  if (details.open) {
    filteredItems.value = props.items
  } else {
    inputValue.value = displayValue.value
    filteredItems.value = props.items
  }
}
</script>

<template>
  <div :class="['space-y-2', rootClass]">
    <label v-if="label" class="block text-sm font-medium text-neutral-700">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="text-error-500 ml-1">*</span>
    </label>

    <div class="relative">
      <Combobox.Root
        :collection="collection"
        :value="value"
        :disabled="disabled"
        :input-value="inputValue"
        :open-on-click="true"
        :lazy-mount="true"
        :unmount-on-exit="true"
        @value-change="handleValueChange"
        @input-value-change="handleInputValueChange"
        @open-change="handleOpenChange"
      >
        <Combobox.Control
          :class="[
            'text-sm transition-colors focus-within:outline-none',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            'flex',
            invalid
              ? 'border-error-500 focus-within:border-error-500 focus-within:ring-error-500/20'
              : '',
          ]"
        >
          <div
            :class="[
              'flex px-1.5 py-0.5 rounded items-center gap-2 flex-1 min-w-0',
              selectedItem?.bgColor,
            ]"
          >
            <div v-if="selectedIcon" class="flex items-center gap-1.5 shrink-0">
              <component :is="selectedIcon" :class="['size-3.5', selectedItem?.color]" />
            </div>
            <Combobox.Input
              :placeholder="placeholder || 'Select...'"
              :class="[
                'flex-1 font-medium text-xs bg-transparent outline-none min-w-0',
                'placeholder:text-neutral-400',
                'disabled:cursor-not-allowed',
                selectedItem?.color,
              ]"
            />
          </div>
        </Combobox.Control>

        <Teleport to="body">
          <Combobox.Positioner>
            <Combobox.Content
              :class="[
                'z-120 rounded-lg border border-neutral-300 bg-white shadow-lg',
                'overflow-hidden w-[calc(100%+20px)]',
              ]"
            >
              <Combobox.ItemGroup v-if="filteredItems.length > 0">
                <Combobox.Item v-for="item in filteredItems" :key="item.value" :item="item">
                  <div class="flex items-center gap-2 flex-1 w-full">
                    <div
                      v-if="item.icon"
                      :class="[
                        'px-1.5 py-0.5 rounded flex items-center gap-1.5 shrink-0',
                        item.bgColor,
                      ]"
                    >
                      <component :is="item.icon" :class="['size-3.5', item.color]" />
                      <span :class="['text-xs font-medium', item.color]">{{ item.label }}</span>
                    </div>
                    <Combobox.ItemText v-else class="text-sm">{{ item.label }}</Combobox.ItemText>
                  </div>
                  <!-- <Combobox.ItemIndicator class="text-primary-600">
                    <CheckIcon class="size-4" />
                  </Combobox.ItemIndicator> -->
                </Combobox.Item>
              </Combobox.ItemGroup>
              <div v-else class="px-3 py-2 text-sm text-neutral-500">No results found</div>
            </Combobox.Content>
          </Combobox.Positioner>
        </Teleport>
      </Combobox.Root>
    </div>

    <p v-if="helperText && !invalid" class="text-xs text-neutral-500">
      <slot name="helperText">{{ helperText }}</slot>
    </p>

    <p v-if="(errorText || invalid) && invalid" class="text-xs text-error-600">
      <slot name="errorText">{{ errorText || 'This field is required' }}</slot>
    </p>
  </div>
</template>

<style scoped>
@reference "../../../style.css";

[data-scope='combobox'][data-part='content'][data-state='open'] {
  @apply animate-in fade-in duration-300 zoom-in-95 slide-in-from-bottom-2;
}

[data-scope='combobox'][data-part='content'][data-state='closed'] {
  @apply animate-out fade-out duration-300 zoom-out-95 slide-out-to-bottom-2;
}

/* Positioner stretches to trigger width */
/* [data-scope='combobox'][data-part='positioner'] {
  width: var(--reference-width);
} */

[data-scope='combobox'][data-part='positioner'] {
  width: calc(var(--reference-width) + 10px) !important;
}

[data-scope='combobox'][data-part='content'] {
  border: 1px solid rgb(212 212 216); /* ~ neutral-300 */
  background: #fff;
  z-index: 120;
  width: 100%;
  max-height: 320px;
  overflow-y: auto;
}

[data-scope='combobox'][data-part='item-group-label'] {
  font-weight: 600;
}

[data-scope='combobox'][data-part='item'] {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

[data-scope='combobox'][data-part='item'][data-highlighted] {
  background: rgb(243 244 246); /* neutral-100 */
}

[data-scope='combobox'][data-part='item'][data-disabled] {
  color: rgb(163 163 163); /* neutral-400 */
  cursor: not-allowed;
}

/* Trigger icon sizing and rotation */
[data-scope='combobox'][data-part='trigger'] svg {
  width: 1em;
  height: 1em;
  transition: transform 150ms;
}

[data-scope='combobox'][data-part='control'][data-state='open']
  [data-scope='combobox'][data-part='trigger']
  svg {
  transform: rotate(180deg);
}
</style>
