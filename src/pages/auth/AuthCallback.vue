<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { ROUTES } from '@/lib/routing'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const { createToast } = useToast()
const { t } = useI18n()

const loading = ref(true)
const error = ref('')

let authListener: any = null

async function handleCallback() {
  const hash = window.location.hash
  const params = new URLSearchParams(hash.substring(1))

  const type = params.get('type')
  const messageParam = params.get('message')
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (messageParam) {
    const msg = decodeURIComponent(messageParam)
    if (msg.includes('Confirmation link accepted')) {
      createToast({
        title: t('auth.callback.confirmationReceived'),
        description: t('auth.callback.confirmationDescription'),
        type: 'info',
      })
    }
    await router.push(ROUTES.Login)
    return
  }

  if (accessToken && refreshToken) {
    try {
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        console.error('[Callback] Session error:', sessionError)
        throw sessionError
      }

      if (!data.session) {
        throw new Error('No session created')
      }

      await authStore.initialize()

      if (type === 'email_change') {
        createToast({
          title: t('auth.callback.emailChanged'),
          description: t('auth.callback.emailChangedDescription', { email: data.user?.email }),
          type: 'success',
        })
      }

      window.history.replaceState(null, '', window.location.pathname)

      await router.push(ROUTES.Profile)
      return
    } catch (err) {
      console.error('[Callback] Error processing tokens:', err)
      throw err
    }
  }

  await router.push(ROUTES.Login)
}

onMounted(async () => {
  try {
    await handleCallback()
  } catch (err: any) {
    console.error('[Callback] Error:', err)
    error.value = err.message || t('auth.callback.processingError')
    createToast({
      title: t('auth.callback.error'),
      description: t('auth.callback.processingError'),
      type: 'error',
    })
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (authListener) {
    authListener.subscription?.unsubscribe()
  }
})
</script>

<template>
  <div class="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border border-neutral-200 rounded-xl p-6">
      <div v-if="loading" class="flex flex-col gap-4 text-center">
        <div
          class="inline-block w-8 h-8 border-2 border-info-600 border-t-transparent rounded-full animate-spin mx-auto"
        ></div>
        <h1 class="text-2xl font-bold text-primary-900 m-0">{{ t('auth.callback.processing') }}</h1>
        <p class="text-sm text-primary-600 m-0">{{ t('auth.callback.settingUp') }}</p>
      </div>

      <div v-else-if="error" class="flex flex-col gap-4 text-center">
        <h1 class="text-2xl font-bold text-error-600 m-0">{{ t('auth.callback.error') }}</h1>
        <div class="p-3 rounded-lg text-sm bg-error-50 border border-error-200 text-error-600">
          <p class="m-0">{{ error }}</p>
        </div>
        <button
          @click="router.push(ROUTES.Login)"
          class="text-info-600 text-sm font-medium cursor-pointer bg-transparent border-0 underline p-0 hover:text-info-700"
        >
          {{ t('auth.callback.goToLogin') }}
        </button>
      </div>
    </div>
  </div>
</template>
