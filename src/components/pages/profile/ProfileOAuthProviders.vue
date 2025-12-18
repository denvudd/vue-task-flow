<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import { Badge, Button, Dialog } from '@/components/ui'
import { unlinkIdentity } from '@/api/auth'
import { useToast } from '@/composables/useToast'
import {
  Github,
  Chrome,
  Facebook,
  Twitter,
  Apple,
  Link,
  Trash2,
  Globe,
  Music,
  Video,
  MessageSquare,
  Briefcase,
  Building2,
} from 'lucide-vue-next'
import type { Component } from 'vue'

const { user, initialize } = useAuth()
const { createToast } = useToast()
const { t } = useI18n()

interface OAuthProvider {
  provider: string
  id: string
  created_at: string
}

const providers = computed<OAuthProvider[]>(() => {
  if (!user.value?.identities) {
    return []
  }
  return user.value.identities.filter(
    (identity) => identity.provider !== 'email',
  ) as OAuthProvider[]
})

const isUnlinking = ref(false)
const unlinkDialogOpen = ref(false)
const providerToUnlink = ref<OAuthProvider | null>(null)

const getProviderName = (provider: string): string => {
  const providerNames: Record<string, string> = {
    google: 'Google',
    github: 'GitHub',
    facebook: 'Facebook',
    twitter: 'Twitter',
    apple: 'Apple',
    azure: 'Azure',
    bitbucket: 'Bitbucket',
    discord: 'Discord',
    gitlab: 'GitLab',
    keycloak: 'Keycloak',
    linkedin: 'LinkedIn',
    notion: 'Notion',
    slack: 'Slack',
    spotify: 'Spotify',
    twitch: 'Twitch',
    workos: 'WorkOS',
    zoom: 'Zoom',
  }
  return (
    providerNames[provider.toLowerCase()] || provider.charAt(0).toUpperCase() + provider.slice(1)
  )
}

const getProviderIcon = (provider: string): Component => {
  const providerLower = provider.toLowerCase()
  const iconMap: Record<string, Component> = {
    google: Chrome,
    github: Github,
    facebook: Facebook,
    twitter: Twitter,
    apple: Apple,
    spotify: Music,
    twitch: Video,
    discord: MessageSquare,
    linkedin: Briefcase,
    azure: Building2,
    bitbucket: Github,
    gitlab: Github,
    notion: Link,
    slack: MessageSquare,
    keycloak: Building2,
    workos: Building2,
    zoom: Video,
  }
  return iconMap[providerLower] || Globe
}

const openUnlinkDialog = (provider: OAuthProvider) => {
  providerToUnlink.value = provider
  unlinkDialogOpen.value = true
}

const closeUnlinkDialog = () => {
  unlinkDialogOpen.value = false
  providerToUnlink.value = null
}

const handleUnlink = async () => {
  if (!providerToUnlink.value || !user.value) {
    return
  }

  try {
    isUnlinking.value = true
    const { error } = await unlinkIdentity({
      id: providerToUnlink.value.id,
      provider: providerToUnlink.value.provider,
      user_id: user.value.id,
    })

    if (error) {
      throw error
    }

    // Re-initialize auth to get updated user with identities
    await initialize()

    createToast({
      title: t('profilePage.oauth.success.title'),
      description: t('profilePage.oauth.success.description', { provider: getProviderName(providerToUnlink.value.provider) }),
      type: 'success',
    })

    closeUnlinkDialog()
  } catch (err: any) {
    createToast({
      title: t('profilePage.oauth.errors.title'),
      description: err.message || t('profilePage.oauth.errors.description'),
      type: 'error',
    })
  } finally {
    isUnlinking.value = false
  }
}
</script>

<template>
  <div>
    <p class="text-sm font-medium text-neutral-700 mb-3 block">{{ t('profilePage.oauth.label') }}</p>
    <div v-if="providers.length === 0" class="text-sm text-neutral-500">
      {{ t('profilePage.oauth.noProviders') }}
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="provider in providers"
        :key="provider.id"
        class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center"
          >
            <component :is="getProviderIcon(provider.provider)" class="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <p class="text-sm font-medium text-neutral-900">
              {{ getProviderName(provider.provider) }}
            </p>
            <p class="text-xs text-neutral-500">{{ t('profilePage.oauth.connectedVia') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="success" size="sm">{{ t('profilePage.oauth.connected') }}</Badge>
          <Button
            variant="ghost"
            size="sm"
            :disabled="isUnlinking"
            @click="openUnlinkDialog(provider)"
            class="text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="unlinkDialogOpen" size="md">
      <template #title>{{ t('profilePage.oauth.disconnectDialog.title') }}</template>
      <template #description>
        <span v-html="t('profilePage.oauth.disconnectDialog.description', { provider: providerToUnlink ? getProviderName(providerToUnlink.provider) : '' })"></span>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            :disabled="isUnlinking"
            @click="closeUnlinkDialog"
          >
            {{ t('profilePage.oauth.disconnectDialog.cancel') }}
          </Button>
          <Button type="button" variant="danger" :disabled="isUnlinking" @click="handleUnlink">
            {{ isUnlinking ? t('profilePage.oauth.disconnectDialog.disconnecting') : t('profilePage.oauth.disconnectDialog.disconnect') }}
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
