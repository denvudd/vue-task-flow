<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUpdateProfile } from '@/composables/useProfile'
import { useI18n } from 'vue-i18n'
import { Button, Card, Field, FieldInput } from '@/components/ui'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useRouter } from 'vue-router'
import { editProfileSchema } from '@/validation/profile'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import ProfileChangeEmailDialog from '@/components/pages/profile/ProfileChangeEmailDialog.vue'
import ProfileChangeAvatar from '@/components/pages/profile/ProfileChangeAvatar.vue'
import ProfileOAuthProviders from '@/components/pages/profile/ProfileOAuthProviders.vue'
import ProfileSessions from '@/components/pages/profile/ProfileSessions.vue'

const router = useRouter()
const { user, profile, loading: authLoading, loadProfile } = useAuth()
const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile()
const { createToast } = useToast()
const { t } = useI18n()

const error = ref<string | null>(null)
const avatarPath = ref<string | null>(null)
const avatarError = ref<string | null>(null)

const isSubmitting = computed(() => isUpdating.value)

const { handleSubmit, errors, defineField, setValues } = useForm({
  validationSchema: toTypedSchema(editProfileSchema),
  validateOnMount: false,
})

const [username, usernameAttrs] = defineField('username', {
  validateOnModelUpdate: true,
})
const [fullName, fullNameAttrs] = defineField('full_name', {
  validateOnModelUpdate: true,
})

watch(
  profile,
  (newProfile) => {
    if (newProfile) {
      setValues({
        username: newProfile.username || '',
        full_name: newProfile.full_name || '',
      })
    }
  },
  { immediate: true },
)

const handleAvatarUploaded = (path: string) => {
  avatarPath.value = path
  avatarError.value = null
}

const handleAvatarError = (message: string) => {
  avatarError.value = message
}

const onSubmit = handleSubmit(async (formValues) => {
  error.value = null

  if (!user.value?.id) {
    error.value = t('profilePage.errors.notLoggedIn')
    return
  }

  try {
    const updates: any = {}

    if (avatarPath.value) {
      updates.avatar_url = avatarPath.value
      avatarPath.value = null
    }

    if (formValues.username && formValues.username !== profile.value?.username) {
      updates.username = formValues.username
    }

    if (formValues.full_name !== profile.value?.full_name) {
      updates.full_name = formValues.full_name || null
    }

    if (Object.keys(updates).length === 0) {
      error.value = t('profilePage.errors.noChanges')
      return
    }

    await updateProfile({
      userId: user.value.id,
      updates,
    })

    await loadProfile(user.value.id)

    createToast({
      title: t('profilePage.success.title'),
      description: t('profilePage.success.description'),
      type: 'success',
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('profilePage.errors.unexpected')
  }
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div v-if="authLoading" class="min-h-screen bg-neutral-50 flex justify-center items-center p-4">
    <div class="text-neutral-600">{{ t('profilePage.loading') }}</div>
  </div>

  <div v-else class="min-h-screen bg-neutral-50 p-4 md:p-8 pt-0 md:pt-0">
    <div class="max-w-3xl mx-auto space-y-4">
      <div>
        <Button variant="ghost" size="sm" @click="handleBack">
          <ArrowLeft class="w-4 h-4 mr-2" />
          {{ t('profilePage.backToDashboard') }}
        </Button>
      </div>

      <Card>
        <h1 class="text-3xl font-bold text-neutral-900">{{ t('profilePage.title') }}</h1>
        <p class="text-neutral-600 mt-2 mb-6">
          {{ t('profilePage.subtitle') }}
        </p>

        <form @submit.prevent="onSubmit" class="space-y-6">
          <div v-if="error" class="p-4 rounded-lg bg-error-50 border border-error-200">
            <p class="text-sm text-error-600">{{ error }}</p>
          </div>

          <ProfileChangeAvatar
            :disabled="isSubmitting"
            @uploaded="handleAvatarUploaded"
            @error="handleAvatarError"
          />

          <ProfileChangeEmailDialog />

          <Field
            :label="t('profilePage.username')"
            :helper-text="errors.username || t('profilePage.usernameHelper')"
            :error-text="errors.username"
            :invalid="!!errors.username"
          >
            <FieldInput
              v-model="username"
              type="text"
              :placeholder="t('profilePage.usernamePlaceholder')"
              :disabled="isSubmitting"
              :invalid="!!errors.username"
              @blur="usernameAttrs.onBlur"
            />
          </Field>

          <Field
            :label="t('profilePage.fullName')"
            :helper-text="errors.full_name"
            :error-text="errors.full_name"
            :invalid="!!errors.full_name"
          >
            <FieldInput
              v-model="fullName"
              type="text"
              :placeholder="t('profilePage.fullNamePlaceholder')"
              :disabled="isSubmitting"
              :invalid="!!errors.full_name"
              @blur="fullNameAttrs.onBlur"
            />
          </Field>

          <ProfileOAuthProviders />

          <ProfileSessions />

          <div class="flex justify-between items-center gap-3 pt-4">
            <Button type="button" variant="outline" :disabled="isSubmitting" @click="handleBack">
              {{ t('profilePage.cancel') }}
            </Button>
            <Button type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? t('profilePage.saving') : t('profilePage.save') }}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>
