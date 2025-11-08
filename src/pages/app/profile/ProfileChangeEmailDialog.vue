<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { Button, Dialog, Field, FieldInput } from '@/components/ui'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useToast } from '@/composables/useToast'
import { updateEmail } from '@/api/auth'
import { z } from 'zod'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const { user } = useAuth()
const { createToast } = useToast()

const isOpen = ref(false)
const isChangingEmail = ref(false)
const emailChangeError = ref<string | null>(null)
const emailFormRef = ref<HTMLFormElement | null>(null)

const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
})

const {
  handleSubmit: handleChangeEmailSubmit,
  errors: emailErrors,
  defineField: defineEmailField,
  resetForm: resetEmailForm,
} = useForm({
  validationSchema: toTypedSchema(changeEmailSchema),
  validateOnMount: false,
})

const [newEmail, newEmailAttrs] = defineEmailField('newEmail', {
  validateOnModelUpdate: true,
})

const openDialog = () => {
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
  emailChangeError.value = null
  resetEmailForm()
  newEmail.value = ''
}

const onChangeEmail = handleChangeEmailSubmit(async (formValues) => {
  emailChangeError.value = null

  if (!user.value?.email) {
    emailChangeError.value = 'Current email not found'
    return
  }

  if (formValues.newEmail === user.value.email) {
    emailChangeError.value = 'New email must be different from current email'
    return
  }

  try {
    isChangingEmail.value = true
    const { error } = await updateEmail(formValues.newEmail)

    if (error) {
      emailChangeError.value = error.message || 'Failed to update email'
      return
    }

    createToast({
      title: 'Email change requested',
      description: `A confirmation email has been sent to ${formValues.newEmail}. Please check your inbox and click the confirmation link to complete the email change.`,
      type: 'success',
    })

    closeDialog()
  } catch (err) {
    emailChangeError.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    isChangingEmail.value = false
  }
})
</script>

<template>
  <div>
    <p class="text-sm font-medium text-neutral-700 mb-1 block">Email</p>
    <p
      class="w-full px-3 py-2 border text-sm border-neutral-300 rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
    >
      {{ user?.email }}
    </p>
    <div class="mt-2 w-full flex justify-end">
      <Button type="button" variant="ghost" size="sm" :disabled="disabled" @click="openDialog">
        Change email
      </Button>
    </div>
  </div>
  <Dialog v-model:open="isOpen" size="md">
    <template #title>Change Email</template>
    <template #description>
      Enter your new email address. A confirmation email will be sent to the new address.
    </template>

    <form ref="emailFormRef" @submit.prevent="onChangeEmail" class="space-y-4">
      <div v-if="emailChangeError" class="p-4 rounded-lg bg-error-50 border border-error-200">
        <p class="text-sm text-error-600">{{ emailChangeError }}</p>
      </div>

      <Field label="Current Email" helper-text="Your current email address">
        <FieldInput :model-value="user?.email || ''" type="email" disabled class="bg-neutral-100" />
      </Field>

      <Field
        label="New Email"
        :helper-text="emailErrors?.newEmail || 'Enter your new email address'"
        :error-text="emailErrors?.newEmail"
        :invalid="!!emailErrors?.newEmail"
      >
        <FieldInput
          v-model="newEmail"
          type="email"
          placeholder="new.email@example.com"
          :disabled="isChangingEmail"
          :invalid="!!emailErrors?.newEmail"
          @blur="newEmailAttrs.onBlur"
        />
      </Field>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button type="button" variant="outline" :disabled="isChangingEmail" @click="closeDialog">
          Cancel
        </Button>
        <Button
          type="button"
          :disabled="isChangingEmail"
          @click="() => emailFormRef?.requestSubmit()"
        >
          {{ isChangingEmail ? 'Sending...' : 'Change Email' }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
