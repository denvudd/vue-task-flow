<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUpdateProfile } from '@/composables/useProfile'
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
    error.value = 'You must be logged in to update profile'
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
      error.value = 'No changes to save'
      return
    }

    await updateProfile({
      userId: user.value.id,
      updates,
    })

    await loadProfile(user.value.id)

    createToast({
      title: 'Profile updated',
      description: 'Your profile has been successfully updated.',
      type: 'success',
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  }
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div v-if="authLoading" class="min-h-screen bg-neutral-50 flex justify-center items-center p-4">
    <div class="text-neutral-600">Loading...</div>
  </div>

  <div v-else class="min-h-screen bg-neutral-50 p-4 md:p-8 pt-0 md:pt-0">
    <div class="max-w-3xl mx-auto space-y-4">
      <div>
        <Button variant="ghost" size="sm" @click="handleBack">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <h1 class="text-3xl font-bold text-neutral-900">Edit Profile</h1>
        <p class="text-neutral-600 mt-2 mb-6">
          Update your profile information below. Changes will be saved to your account.
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
            label="Username"
            :helper-text="
              errors.username || 'Your unique username (letters, numbers, underscores only)'
            "
            :error-text="errors.username"
            :invalid="!!errors.username"
          >
            <FieldInput
              v-model="username"
              type="text"
              placeholder="john_doe"
              :disabled="isSubmitting"
              :invalid="!!errors.username"
              @blur="usernameAttrs.onBlur"
            />
          </Field>

          <Field
            label="Full Name"
            :helper-text="errors.full_name"
            :error-text="errors.full_name"
            :invalid="!!errors.full_name"
          >
            <FieldInput
              v-model="fullName"
              type="text"
              placeholder="John Doe"
              :disabled="isSubmitting"
              :invalid="!!errors.full_name"
              @blur="fullNameAttrs.onBlur"
            />
          </Field>

          <ProfileOAuthProviders />

          <ProfileSessions />

          <div class="flex justify-between items-center gap-3 pt-4">
            <Button type="button" variant="outline" :disabled="isSubmitting" @click="handleBack">
              Cancel
            </Button>
            <Button type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>
