<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import { Badge, Button, Card, Dialog } from '@/components/ui'
import { useToast } from '@/composables/useToast'
import { Monitor, Smartphone, Tablet, Globe, LogOut, Clock, Calendar } from 'lucide-vue-next'
import type { Component } from 'vue'

const { session, signOut } = useAuth()
console.log('🚀 ~ session:', session.value)
const { createToast } = useToast()
const { t } = useI18n()

const signOutDialogOpen = ref(false)
const isSigningOut = ref(false)

interface SessionInfo {
  expires_at: number
  userAgent: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  isCurrent: boolean
}

const sessionInfo = computed<SessionInfo | null>(() => {
  if (!session.value) {
    return null
  }

  const userAgent = navigator.userAgent
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown'

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    deviceType = 'tablet'
  } else if (
    /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
      userAgent,
    )
  ) {
    deviceType = 'mobile'
  } else if (/macintosh|windows|linux/i.test(userAgent)) {
    deviceType = 'desktop'
  }

  console.log(session.value.expires_at)

  return {
    expires_at: session.value.expires_at || Date.now(),
    userAgent,
    deviceType,
    isCurrent: true,
  }
})

const getDeviceIcon = (deviceType: string): Component => {
  const iconMap: Record<string, Component> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
    unknown: Globe,
  }
  return iconMap[deviceType] || Globe
}

const formatDate = (timestampSeconds: number): string => {
  const d = new Date(timestampSeconds * 1000)

  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

const isExpiringSoon = computed(() => {
  if (!sessionInfo.value) return false

  const expiresAtMs = sessionInfo.value.expires_at * 1000
  const now = Date.now()
  const diff = expiresAtMs - now
  const hoursUntilExpiry = diff / (1000 * 60 * 60)

  return hoursUntilExpiry < 24 && hoursUntilExpiry > 0
})

const openSignOutDialog = () => {
  signOutDialogOpen.value = true
}

const closeSignOutDialog = () => {
  signOutDialogOpen.value = false
}

const handleSignOut = async () => {
  try {
    isSigningOut.value = true
    await signOut()
    createToast({
      title: t('profilePage.sessions.success.title'),
      description: t('profilePage.sessions.success.description'),
      type: 'success',
    })
    closeSignOutDialog()
  } catch (err: any) {
    createToast({
      title: t('profilePage.sessions.errors.title'),
      description: err.message || t('profilePage.sessions.errors.description'),
      type: 'error',
    })
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <div>
    <p class="text-sm font-medium text-neutral-700 mb-3 block">
      {{ t('profilePage.sessions.label') }}
    </p>

    <div v-if="!sessionInfo" class="text-sm text-neutral-500">
      {{ t('profilePage.sessions.noSession') }}
    </div>

    <Card v-else class="border border-neutral-200">
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center"
            >
              <component
                :is="getDeviceIcon(sessionInfo.deviceType)"
                class="w-5 h-5 text-primary-700"
              />
            </div>
            <div>
              <div class="flex items-center gap-1">
                <p class="text-sm font-medium text-neutral-900">
                  {{
                    sessionInfo.deviceType === 'desktop'
                      ? t('profilePage.sessions.devices.desktop')
                      : sessionInfo.deviceType === 'mobile'
                        ? t('profilePage.sessions.devices.mobile')
                        : sessionInfo.deviceType === 'tablet'
                          ? t('profilePage.sessions.devices.tablet')
                          : t('profilePage.sessions.devices.unknown')
                  }}
                </p>
                <Badge v-if="sessionInfo.isCurrent" variant="success" size="sm">{{
                  t('profilePage.sessions.current')
                }}</Badge>
                <Badge v-if="isExpiringSoon" variant="warning" size="sm">{{
                  t('profilePage.sessions.expiringSoon')
                }}</Badge>
              </div>
              <p class="text-xs text-neutral-500 mt-0.5">
                {{ sessionInfo.userAgent.substring(0, 60)
                }}{{ sessionInfo.userAgent.length > 60 ? '...' : '' }}
              </p>
            </div>
          </div>
          <Button
            v-if="sessionInfo.isCurrent"
            variant="ghost"
            size="sm"
            :disabled="isSigningOut"
            @click="openSignOutDialog"
            class="text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            <LogOut class="w-4 h-4 mr-1.5" />
            {{ t('profilePage.sessions.signOut') }}
          </Button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-200">
          <div class="flex items-start gap-2">
            <Clock class="w-4 h-4 text-neutral-400 mt-0.5" />
            <div>
              <p class="text-xs text-neutral-500 mb-0.5">{{ t('profilePage.sessions.expires') }}</p>
              <p class="text-sm text-neutral-900">
                {{ formatDate(sessionInfo.expires_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Dialog v-model:open="signOutDialogOpen" size="md">
      <template #title>{{ t('profilePage.sessions.signOutDialog.title') }}</template>
      <template #description>
        {{ t('profilePage.sessions.signOutDialog.description') }}
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            :disabled="isSigningOut"
            @click="closeSignOutDialog"
          >
            {{ t('profilePage.sessions.signOutDialog.cancel') }}
          </Button>
          <Button type="button" variant="danger" :disabled="isSigningOut" @click="handleSignOut">
            {{
              isSigningOut
                ? t('profilePage.sessions.signOutDialog.signingOut')
                : t('profilePage.sessions.signOutDialog.signOut')
            }}
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
