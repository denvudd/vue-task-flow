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
    password: z.string().min(6, t('auth.resetPassword.errors.passwordMinLength')),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('auth.resetPassword.errors.passwordMismatch'),
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
    error.value = t('auth.resetPassword.invalidLink')
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
    error.value = err instanceof Error ? err.message : t('auth.resetPassword.errors.unexpectedError')
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-primary-900 mb-2">{{ t('auth.resetPassword.title') }}</h1>
          <p class="text-neutral-600 text-sm">{{ t('auth.resetPassword.subtitle') }}</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div v-if="error" class="p-3 rounded-lg bg-error-50 border border-error-200">
            <p class="text-sm text-error-600">{{ error }}</p>
          </div>

          <div v-if="success" class="p-3 rounded-lg bg-success-50 border border-success-200">
            <p class="text-sm text-success-600">{{ t('auth.resetPassword.success') }}</p>
          </div>

          <FieldPasswordInput
            v-model="password"
            :label="t('auth.resetPassword.fields.password')"
            :helper-text="errors.password || t('auth.resetPassword.fields.passwordHelper')"
            :error-text="errors.password"
            :invalid="!!errors.password"
            :placeholder="t('auth.resetPassword.fields.passwordPlaceholder')"
            auto-complete="new-password"
            :disabled="loading || success"
            show-strength
            @blur="passwordAttrs.onBlur"
          />

          <FieldPasswordInput
            v-model="confirmPassword"
            :label="t('auth.resetPassword.fields.confirmPassword')"
            :helper-text="errors.confirmPassword || t('auth.resetPassword.fields.confirmPasswordHelper')"
            :error-text="errors.confirmPassword"
            :invalid="!!errors.confirmPassword"
            :placeholder="t('auth.resetPassword.fields.confirmPasswordPlaceholder')"
            auto-complete="new-password"
            :disabled="loading || success"
            @blur="confirmPasswordAttrs.onBlur"
          />

          <Button type="submit" :disabled="loading || success" class="w-full" size="lg">
            {{ loading ? t('auth.resetPassword.loading') : t('auth.resetPassword.submit') }}
          </Button>
        </form>
      </div>
    </Card>
  </div>
</template>
