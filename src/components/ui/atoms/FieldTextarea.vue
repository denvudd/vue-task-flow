<script setup lang="ts">
import { Field } from '@ark-ui/vue/field'
import { CheckCircle2Icon } from 'lucide-vue-next'

interface Props {
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  valid?: boolean
  autoresize?: boolean
  modelValue?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()
</script>

<template>
  <div class="relative">
    <Field.Textarea
      :class="[
        'w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none resize-none',
        'border focus:ring-2',
        invalid
          ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
          : valid
            ? 'border-success-500 focus:border-success-500 focus:ring-success-500'
            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
        'disabled:bg-neutral-100 disabled:cursor-not-allowed',
        { 'pr-10': valid },
      ]"
      :placeholder="placeholder"
      :disabled="disabled"
      :autoresize="autoresize"
      :value="modelValue"
      @input="(e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)"
      @blur="(e: FocusEvent) => emit('blur', e)"
    />
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-0 translate-x-2"
      enter-to-class="opacity-100 scale-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-x-0"
      leave-to-class="opacity-0 scale-0 translate-x-2"
    >
      <div v-if="valid" class="absolute right-3 top-3 text-success-500 pointer-events-none">
        <CheckCircle2Icon class="size-5" />
      </div>
    </Transition>
  </div>
</template>
