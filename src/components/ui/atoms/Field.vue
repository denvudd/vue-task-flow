<script setup lang="ts">
import { Field as ArkField } from '@ark-ui/vue/field'

interface Props {
  label?: string
  helperText?: string
  errorText?: string
  required?: boolean
  disabled?: boolean
  invalid?: boolean
  rootClass?: string
}

const props = defineProps<Props>()
</script>

<template>
  <ArkField.Root :required="required" :disabled="disabled" :invalid="invalid">
    <div :class="['space-y-1', rootClass]">
      <!-- Label -->
      <ArkField.Label v-if="$slots.label" class="block text-sm font-medium text-neutral-700">
        <slot name="label">
          <slot name="label">{{ label }}</slot>
        </slot>
        <span v-if="required" class="text-error-500 ml-1">*</span>
      </ArkField.Label>
      <ArkField.Label v-else-if="label" class="block text-sm font-medium text-neutral-700">
        {{ label }}
        <span v-if="required" class="text-error-500 ml-1">*</span>
      </ArkField.Label>

      <!-- Control Slot -->
      <div class="relative">
        <slot />
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
