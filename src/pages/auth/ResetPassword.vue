<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'
import { Button, Card, Field, FieldPasswordInput } from '@/components/ui'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ROUTES } from '@/lib/routing'

const { t } = useI18n()
const router = useRouter()
const { updatePassword } = useAuth()

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
  validateOnMount: false,
})

const [password, passwordAttrs] = defineField('password', {
  validateOnModelUpdate: true,
})
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword', {
  validateOnModelUpdate: true,
})

onMounted(() => {
  const hash = window.location.hash
  if (!hash || !hash.includes('type=recovery')) {
    error.value = 'Invalid password reset link'
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  error.value = null
  success.value = false
  loading.value = true

  try {
    const result = await updatePassword(formValues.password)

    if (result.error) {
      error.value = result.error.message
      loading.value = false
      return
    }

    success.value = true
    loading.value = false

    setTimeout(() => {
      router.push(ROUTES.Dashboard)
    }, 1500)
  } catch (err) {
    console.error('Caught exception:', err)
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-primary-900 mb-2">Set New Password</h1>
          <p class="text-neutral-600 text-sm">Enter your new password below.</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div v-if="error" class="p-3 rounded-lg bg-error-50 border border-error-200">
            <p class="text-sm text-error-600">{{ error }}</p>
          </div>

          <div v-if="success" class="p-3 rounded-lg bg-success-50 border border-success-200">
            <p class="text-sm text-success-600">Password reset successfully! Redirecting...</p>
          </div>

          <FieldPasswordInput
            v-model="password"
            label="New Password"
            :helper-text="errors.password || 'Password must be at least 6 characters'"
            :error-text="errors.password"
            :invalid="!!errors.password"
            placeholder="••••••••"
            auto-complete="new-password"
            :disabled="loading || success"
            show-strength
            @blur="passwordAttrs.onBlur"
          />

          <FieldPasswordInput
            v-model="confirmPassword"
            label="Confirm New Password"
            :helper-text="errors.confirmPassword || 'Re-enter your new password'"
            :error-text="errors.confirmPassword"
            :invalid="!!errors.confirmPassword"
            placeholder="••••••••"
            auto-complete="new-password"
            :disabled="loading || success"
            @blur="confirmPasswordAttrs.onBlur"
          />

          <Button type="submit" :disabled="loading || success" class="w-full" size="lg">
            {{ loading ? 'Updating...' : 'Update Password' }}
          </Button>
        </form>
      </div>
    </Card>
  </div>
</template>
