<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'
import { Button, Card, Field, FieldInput } from '@/components/ui'
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ROUTES } from '@/lib/routing'

const { t } = useI18n()
const router = useRouter()
const { resetPassword } = useAuth()

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const forgotPasswordSchema = z.object({
  email: z.string().email(t('auth.forgotPassword.errors.invalidEmail')),
})

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema),
  validateOnMount: false,
})

const [email, emailAttrs] = defineField('email', {
  validateOnModelUpdate: true,
})

const onSubmit = handleSubmit(async (formValues) => {
  error.value = null
  success.value = false
  loading.value = true

  try {
    const { error: authError } = await resetPassword(formValues.email)

    if (authError) {
      error.value = authError.message
      return
    }

    success.value = true
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : t('auth.forgotPassword.errors.unexpectedError')
  } finally {
    loading.value = false
  }
})

const navigateToLogin = () => {
  router.push(ROUTES.Profile)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-primary-900 mb-2">
            {{ t('auth.forgotPassword.title') }}
          </h1>
          <p class="text-neutral-600 text-sm">
            {{ t('auth.forgotPassword.subtitle') }}
          </p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div v-if="error" class="p-3 rounded-lg bg-error-50 border border-error-200">
            <p class="text-sm text-error-600">{{ error }}</p>
          </div>

          <div v-if="success" class="p-3 rounded-lg bg-success-50 border border-success-200">
            <p class="text-sm text-success-600">{{ t('auth.forgotPassword.success') }}</p>
          </div>

          <Field
            :label="t('auth.forgotPassword.fields.email')"
            :helper-text="errors.email || t('auth.forgotPassword.fields.emailHelper')"
            :error-text="errors.email"
            :invalid="!!errors.email"
          >
            <FieldInput
              v-model="email"
              type="email"
              placeholder="your@email.com"
              :disabled="loading || success"
              :invalid="!!errors.email"
              @blur="emailAttrs.onBlur"
            />
          </Field>

          <Button type="submit" :disabled="loading || success" class="w-full" size="lg">
            {{ loading ? t('auth.forgotPassword.loading') : t('auth.forgotPassword.submit') }}
          </Button>
        </form>

        <div class="text-center text-sm text-neutral-600">
          <span>{{ t('auth.forgotPassword.rememberPassword') }}</span>
          <button
            type="button"
            @click="navigateToLogin"
            class="ml-1 text-primary-600 hover:text-primary-700 font-medium"
          >
            {{ t('auth.forgotPassword.backToLogin') }}
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>
