<script setup lang="ts">
import { computed } from 'vue'
import { Field as ArkField } from '@ark-ui/vue/field'
import { PasswordInput } from '@ark-ui/vue/password-input'
import { EyeIcon, EyeOffIcon, CheckIcon, XIcon, CheckCircle2Icon } from 'lucide-vue-next'
import { passwordStrength, type Options } from 'check-password-strength'
import ProgressLinear from '../atoms/ProgressLinear.vue'

interface PasswordCriterion {
  id: string
  label: string
  check: (password: string) => boolean
}

interface Props {
  label?: string
  helperText?: string
  errorText?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  valid?: boolean
  autoComplete?: 'new-password' | 'current-password'
  modelValue?: string
  showStrength?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStrength: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const strengthOptions: Options<string> = [
  { id: 0, value: 'weak', minDiversity: 0, minLength: 0 },
  { id: 1, value: 'medium', minDiversity: 2, minLength: 6 },
  { id: 2, value: 'strong', minDiversity: 4, minLength: 8 },
]

const strengthMap = new Map([
  ['weak', { id: 0, label: 'weak' }],
  ['medium', { id: 1, label: 'medium' }],
  ['strong', { id: 2, label: 'strong' }],
])

const shouldShowStrength = computed(() => {
  return props.showStrength
})

const passwordCriteria: PasswordCriterion[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    check: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letter',
    check: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letter',
    check: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Contains number',
    check: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'Contains special character',
    check: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
]

const criteriaStatus = computed(() => {
  if (!props.modelValue) {
    return passwordCriteria.map((criterion) => ({
      ...criterion,
      fulfilled: false,
    }))
  }

  return passwordCriteria.map((criterion) => ({
    ...criterion,
    fulfilled: criterion.check(props.modelValue || ''),
  }))
})

const strength = computed(() => {
  if (!shouldShowStrength.value) return null

  if (!props.modelValue || props.modelValue.length === 0) {
    return { value: 'weak', id: 0, label: 'weak' }
  }

  try {
    const result = passwordStrength(props.modelValue, strengthOptions)
    const data = strengthMap.get(result.value)
    return data ? { value: result.value, ...data } : { value: 'weak', id: 0, label: 'weak' }
  } catch (error) {
    console.error('Error checking password strength:', error)
    return { value: 'weak', id: 0, label: 'weak' }
  }
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

      <!-- Password Input Control -->
      <div class="relative">
        <PasswordInput.Root
          :disabled="disabled"
          :invalid="invalid"
          :auto-complete="autoComplete"
          :value="modelValue"
          @update:value="({ value }: { value?: string }) => emit('update:modelValue', value || '')"
        >
          <PasswordInput.Control
            :class="[
              'w-full rounded-lg px-3 py-2 text-sm transition-colors focus-within:outline-none',
              'border focus-within:ring-2',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed',
              'flex items-center gap-2',
              invalid
                ? 'border-error-500 focus-within:border-error-500 focus-within:ring-error-500'
                : valid
                  ? 'border-success-500 focus-within:border-success-500 focus-within:ring-success-500'
                  : 'border-neutral-300 focus-within:border-primary-500 focus-within:ring-primary-500',
            ]"
          >
            <PasswordInput.Input
              :class="[
                'flex-1 bg-transparent border-none outline-none',
                'disabled:cursor-not-allowed',
                'placeholder:text-neutral-400',
              ]"
              :placeholder="placeholder"
              :disabled="disabled"
              @input="(e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)"
              @blur="(e: FocusEvent) => emit('blur', e)"
            />
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-0"
            >
              <div v-if="valid" class="flex items-center text-success-500">
                <CheckCircle2Icon class="size-5" />
              </div>
            </Transition>
            <PasswordInput.VisibilityTrigger
              :class="[
                'flex items-center justify-center text-neutral-500 hover:text-neutral-700',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-colors',
              ]"
              :disabled="disabled"
            >
              <PasswordInput.Indicator>
                <EyeIcon class="size-4" />
                <template #fallback>
                  <EyeOffIcon class="size-4" />
                </template>
              </PasswordInput.Indicator>
            </PasswordInput.VisibilityTrigger>
          </PasswordInput.Control>
        </PasswordInput.Root>
      </div>

      <!-- Password Strength Indicator -->
      <div v-if="shouldShowStrength && strength" class="mt-2 space-y-2">
        <ProgressLinear :value="strength.id" />
        <div class="text-xs capitalize text-neutral-600">{{ strength.label }} password</div>

        <!-- Password Criteria List -->
        <div class="space-y-1.5">
          <div
            v-for="criterion in criteriaStatus"
            :key="criterion.id"
            class="flex items-center gap-2 text-xs transition-colors"
            :class="criterion.fulfilled ? 'text-success-600' : 'text-neutral-500'"
          >
            <div
              :class="[
                'flex items-center justify-center rounded-full transition-all',
                criterion.fulfilled
                  ? 'bg-success-100 text-success-600'
                  : 'bg-neutral-100 text-neutral-400',
              ]"
              class="size-4 shrink-0"
            >
              <CheckIcon v-if="criterion.fulfilled" class="size-3" />
              <XIcon v-else class="size-3" />
            </div>
            <span>{{ criterion.label }}</span>
          </div>
        </div>
      </div>

      <!-- Helper Text -->
      <ArkField.HelperText
        v-if="helperText && !invalid && !strength"
        class="text-xs text-neutral-500"
      >
        <slot name="helperText">{{ helperText }}</slot>
      </ArkField.HelperText>

      <!-- Error Text -->
      <ArkField.ErrorText v-if="(errorText || invalid) && invalid" class="text-xs text-error-600">
        <slot name="errorText">{{ errorText || 'This field is required' }}</slot>
      </ArkField.ErrorText>
    </div>
  </ArkField.Root>
</template>
