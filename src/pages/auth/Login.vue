<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'
import { Button, Card, Field, FieldInput, FieldPasswordInput } from '@/components/ui'
import { loginSchema } from '@/validation/auth'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ROUTES } from '@/lib/routing'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { signIn, signInWithGoogle } = useAuth()

const loading = ref(false)
const googleLoading = ref(false)
const error = ref<string | null>(null)

const { handleSubmit, values, errors, defineField, meta, isFieldTouched, isFieldValid } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  validateOnMount: false,
})

const [email, emailAttrs] = defineField('email', {
  validateOnModelUpdate: true,
})
const [password, passwordAttrs] = defineField('password', {
  validateOnModelUpdate: true,
})

// Computed properties for validation state
const emailValid = computed(() => isFieldValid('email') && isFieldTouched('email'))
const passwordValid = computed(() => isFieldValid('password') && isFieldTouched('password'))

const onSubmit = handleSubmit(async (formValues) => {
  error.value = null
  loading.value = true

  try {
    const { data, error: authError } = await signIn(formValues.email, formValues.password)

    if (authError) {
      error.value = authError.message
      return
    }

    if (data) {
      // Redirect to the page user was trying to access, or home
      const redirect = route.query.redirect as string
      router.push(redirect || ROUTES.Dashboard)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
})

const navigateToSignUp = () => {
  router.push(ROUTES.SignUp)
}

const handleGoogleSignIn = async () => {
  error.value = null
  googleLoading.value = true

  try {
    const { error: authError } = await signInWithGoogle(window.location.origin)

    if (authError) {
      error.value = authError.message
    }
    // User will be redirected to Google OAuth page
    // After successful authentication, they will be redirected back
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
    googleLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-primary-900 mb-2">{{ t('auth.login.title') }}</h1>
          <p class="text-neutral-600 text-sm">{{ t('auth.login.subtitle') }}</p>
        </div>

        <!-- Google Sign In -->
        <Button
          type="button"
          variant="outline"
          size="lg"
          class="w-full"
          :disabled="loading || googleLoading"
          @click="handleGoogleSignIn"
        >
          <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {{ googleLoading ? t('auth.login.loading') : t('auth.login.continueWithGoogle') }}
        </Button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-neutral-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-neutral-500">{{ t('auth.login.orDivider') }}</span>
          </div>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div v-if="error" class="p-3 rounded-lg bg-error-50 border border-error-200">
            <p class="text-sm text-error-600">{{ error }}</p>
          </div>

          <Field
            label="Email"
            :helper-text="errors.email || 'Enter your email address'"
            :error-text="errors.email"
            :invalid="!!errors.email"
          >
            <FieldInput
              v-model="email"
              type="email"
              placeholder="your@email.com"
              :disabled="loading"
              :invalid="!!errors.email"
              :valid="emailValid"
              @blur="emailAttrs.onBlur"
            />
          </Field>

          <FieldPasswordInput
            v-model="password"
            label="Password"
            :helper-text="errors.password || 'Enter your password'"
            :error-text="errors.password"
            :invalid="!!errors.password"
            :valid="passwordValid"
            placeholder="••••••••"
            auto-complete="current-password"
            :disabled="loading"
            @blur="passwordAttrs.onBlur"
          />

          <Button type="submit" :disabled="loading" class="w-full" size="lg">
            {{ loading ? t('auth.login.loading') : t('auth.login.submit') }}
          </Button>
        </form>

        <div class="text-center text-sm">
          <button
            type="button"
            @click="router.push(ROUTES.ForgotPassword)"
            class="text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </button>
        </div>

        <div class="text-center text-sm text-neutral-600">
          <span>{{ t('auth.login.noAccount') }}</span>
          <button
            type="button"
            @click="navigateToSignUp"
            class="ml-1 text-primary-600 hover:text-primary-700 font-medium"
          >
            {{ t('auth.login.signUp') }}
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>
