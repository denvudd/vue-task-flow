<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

const isOpen = ref(false)
const isChangingEmail = ref(false)
const emailChangeError = ref<string | null>(null)
const emailFormRef = ref<HTMLFormElement | null>(null)

const changeEmailSchema = z.object({
  newEmail: z.string().email(t('profilePage.email.errors.invalidEmail')),
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
    emailChangeError.value = t('profilePage.email.errors.currentNotFound')
    return
  }

  if (formValues.newEmail === user.value.email) {
    emailChangeError.value = t('profilePage.email.errors.mustBeDifferent')
    return
  }

  try {
    isChangingEmail.value = true
    const { error } = await updateEmail(formValues.newEmail)

    if (error) {
      emailChangeError.value = error.message || t('profilePage.email.errors.updateFailed')
      return
    }

    createToast({
      title: t('profilePage.email.success.title'),
      description: t('profilePage.email.success.description', { email: formValues.newEmail }),
      type: 'success',
    })

    closeDialog()
  } catch (err) {
    emailChangeError.value =
      err instanceof Error ? err.message : t('profilePage.email.errors.unexpected')
  } finally {
    isChangingEmail.value = false
  }
})
</script>

<template>
  <div>
    <p class="text-sm font-medium text-neutral-700 mb-1 block">
      {{ t('profilePage.email.label') }}
    </p>
    <p
      class="w-full relative px-3 py-2 border text-sm border-neutral-300 rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
    >
      {{ user?.email }}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled"
        @click="openDialog"
        class="absolute top-1/2 -translate-y-1/2 right-3"
      >
        {{ t('profilePage.email.changeButton') }}
      </Button>
    </p>
  </div>
  <Dialog v-model:open="isOpen" size="md">
    <template #title>{{ t('profilePage.email.dialogTitle') }}</template>
    <template #description>
      {{ t('profilePage.email.dialogDescription') }}
    </template>

    <form ref="emailFormRef" @submit.prevent="onChangeEmail" class="space-y-4">
      <div v-if="emailChangeError" class="p-4 rounded-lg bg-error-50 border border-error-200">
        <p class="text-sm text-error-600">{{ emailChangeError }}</p>
      </div>

      <Field
        :label="t('profilePage.email.currentEmail')"
        :helper-text="t('profilePage.email.currentEmailHelper')"
      >
        <FieldInput :model-value="user?.email || ''" type="email" disabled class="bg-neutral-100" />
      </Field>

      <Field
        :label="t('profilePage.email.newEmail')"
        :helper-text="emailErrors?.newEmail || t('profilePage.email.newEmailHelper')"
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
          {{ t('profilePage.email.cancel') }}
        </Button>
        <Button
          type="button"
          :disabled="isChangingEmail"
          @click="() => emailFormRef?.requestSubmit()"
        >
          {{ isChangingEmail ? t('profilePage.email.sending') : t('profilePage.email.submit') }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
