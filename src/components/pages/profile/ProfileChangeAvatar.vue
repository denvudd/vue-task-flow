<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import { Field, AvatarUpload } from '@/components/ui'
import { uploadAvatar, deleteAvatar } from '@/api/profiles'
import { supabase } from '@/lib/supabase'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  uploaded: [path: string]
  error: [message: string]
}>()

const { profile } = useAuth()
const { t } = useI18n()
const avatarFile = ref<File | null>(null)
const avatarError = ref<string | null>(null)
const uploadingAvatar = ref(false)
const uploadedAvatarPath = ref<string | null>(null)

const currentAvatarUrl = computed(() => {
  if (uploadedAvatarPath.value) {
    return supabase.storage.from('avatars').getPublicUrl(uploadedAvatarPath.value).data.publicUrl
  }

  const url = profile.value?.avatar_url
  if (!url) return null
  if (url.startsWith('http')) return url
  return supabase.storage.from('avatars').getPublicUrl(url).data.publicUrl
})

const handleError = (message: string) => {
  avatarError.value = message
  emit('error', message)
}

const handleAvatarChange = async () => {
  if (!avatarFile.value) return

  const userId = profile.value?.id
  if (!userId) {
    handleError(t('profilePage.avatar.userNotFound'))
    return
  }

  uploadingAvatar.value = true
  avatarError.value = null

  try {
    if (profile.value?.avatar_url) {
      const oldPath = profile.value.avatar_url.includes('/storage/v1/object/public/avatars/')
        ? profile.value.avatar_url.split('/avatars/')[1]
        : profile.value.avatar_url

      if (oldPath) {
        await deleteAvatar(oldPath).catch(() => {})
      }
    }

    const { path } = await uploadAvatar(userId, avatarFile.value)

    if (!path) {
      handleError(t('profilePage.avatar.uploadFailed'))
      return
    }

    uploadedAvatarPath.value = path
    avatarFile.value = null
    avatarError.value = null
    emit('uploaded', path)
  } catch (err: any) {
    handleError(err.message || t('profilePage.avatar.uploadFailed'))
  } finally {
    uploadingAvatar.value = false
  }
}

watch(avatarFile, (newFile) => {
  if (newFile) {
    handleAvatarChange()
  }
})

watch(
  () => profile.value?.avatar_url,
  (newUrl) => {
    if (newUrl && uploadedAvatarPath.value) {
      uploadedAvatarPath.value = null
    }
  },
)
</script>

<template>
  <Field
    :label="t('profilePage.avatar.label')"
    :helper-text="avatarError || t('profilePage.avatar.helper')"
    :error-text="avatarError || undefined"
    :invalid="!!avatarError"
  >
    <AvatarUpload
      v-model="avatarFile"
      :current-avatar-url="currentAvatarUrl"
      :disabled="disabled || uploadingAvatar"
      :invalid="!!avatarError"
      @error="handleError"
    />
  </Field>
</template>
