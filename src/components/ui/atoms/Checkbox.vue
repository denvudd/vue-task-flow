<script setup lang="ts">
import { Checkbox as ArkCheckbox, type CheckboxCheckedState } from '@ark-ui/vue/checkbox'
import { CheckIcon, MinusIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  checked?: CheckboxCheckedState
  defaultChecked?: CheckboxCheckedState
  disabled?: boolean
  indeterminate?: boolean
  name?: string
  value?: string
  class?: string
  rootClass?: string
  controlClass?: string
  indicatorClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  indeterminate: false,
})

const emit = defineEmits<{
  (e: 'update:checked', checked: CheckboxCheckedState): void
  (e: 'checked-change', details: { checked: CheckboxCheckedState }): void
}>()

const handleCheckedChange = (details: { checked: CheckboxCheckedState }) => {
  emit('update:checked', details.checked)
  emit('checked-change', details)
}
</script>

<template>
  <ArkCheckbox.Root
    :checked="checked"
    :default-checked="defaultChecked"
    :disabled="disabled"
    :indeterminate="indeterminate"
    :name="name"
    :value="value"
    :class="cn('inline-flex items-center gap-2', rootClass)"
    @checked-change="handleCheckedChange"
  >
    <ArkCheckbox.Control
      :class="
        cn(
          'flex h-4 w-4 items-center justify-center rounded border border-neutral-300 transition-colors',
          'data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500',
          'data-[state=indeterminate]:bg-primary-500 data-[state=indeterminate]:border-primary-500',
          'data-hover:border-primary-600 cursor-pointer',
          'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
          controlClass,
        )
      "
    >
      <ArkCheckbox.Indicator
        v-if="!indeterminate"
        :indeterminate="indeterminate"
        :class="cn('text-white', indicatorClass)"
      >
        <CheckIcon class="size-4" />
      </ArkCheckbox.Indicator>
      <ArkCheckbox.Indicator :class="cn('text-white', indicatorClass)" v-else>
        <MinusIcon class="size-4" />
      </ArkCheckbox.Indicator>
    </ArkCheckbox.Control>
    <ArkCheckbox.Label
      v-if="$slots.default"
      class="text-sm font-medium text-neutral-700 cursor-pointer data-disabled:cursor-not-allowed data-disabled:opacity-50"
    >
      <slot />
    </ArkCheckbox.Label>
    <ArkCheckbox.HiddenInput />
  </ArkCheckbox.Root>
</template>
