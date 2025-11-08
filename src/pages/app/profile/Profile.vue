<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUpdateProfile } from '@/composables/useProfile'
import { Button, Card, Field, FieldInput } from '@/components/ui'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useRouter } from 'vue-router'
import { editProfileSchema } from '@/validation/profile'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const { user, profile, loading: authLoading } = useAuth()

const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile()

const error = ref<string | null>(null)
const success = ref(false)

const { handleSubmit, errors, defineField, setValues, isFieldTouched, isFieldValid } = useForm({
  validationSchema: toTypedSchema(editProfileSchema),
  validateOnMount: false,
})

const [username, usernameAttrs] = defineField('username', {
  validateOnModelUpdate: true,
})
const [fullName, fullNameAttrs] = defineField('full_name', {
  validateOnModelUpdate: true,
})

const usernameValid = computed(() => isFieldValid('username') && isFieldTouched('username'))
const fullNameValid = computed(() => isFieldValid('full_name') && isFieldTouched('full_name'))

// Set initial values when profile is loaded
if (profile.value) {
  setValues({
    username: profile.value.username || '',
    full_name: profile.value.full_name || '',
  })
}

const onSubmit = handleSubmit(async (formValues) => {
  error.value = null
  success.value = false

  if (!user.value?.id) {
    error.value = 'You must be logged in to update profile'
    return
  }

  try {
    const updates: any = {}

    if (formValues.username && formValues.username !== profile.value?.username) {
      updates.username = formValues.username
    }

    if (formValues.full_name !== undefined && formValues.full_name !== profile.value?.full_name) {
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

    success.value = true

    setTimeout(() => {
      success.value = false
    }, 3000)
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

  <div v-else class="min-h-screen bg-neutral-50 p-4 md:p-8">
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
          <div v-if="success" class="p-4 rounded-lg bg-success-50 border border-success-200">
            <p class="text-sm text-success-700 font-medium">✓ Profile updated successfully!</p>
          </div>

          <div v-if="error" class="p-4 rounded-lg bg-error-50 border border-error-200">
            <p class="text-sm text-error-600">{{ error }}</p>
          </div>

          <div>
            <p class="text-sm font-medium text-neutral-700 mb-1 block">Email</p>
            <p
              class="w-full px-3 py-2 border text-sm border-neutral-300 rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
            >
              {{ user?.email }}
            </p>
            <p class="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
          </div>

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
              :disabled="isUpdating || success"
              :invalid="!!errors.username"
              :valid="usernameValid"
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
              :disabled="isUpdating || success"
              :invalid="!!errors.full_name"
              :valid="!!fullName && fullNameValid"
              @blur="fullNameAttrs.onBlur"
            />
          </Field>

          <div class="flex justify-between items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              :disabled="isUpdating || success"
              @click="handleBack"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isUpdating || success">
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>
