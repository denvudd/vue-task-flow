<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { Badge, Button, Card, Dialog } from '@/components/ui'
import { useToast } from '@/composables/useToast'
import { Monitor, Smartphone, Tablet, Globe, LogOut, Clock, Calendar } from 'lucide-vue-next'
import type { Component } from 'vue'

const { session, signOut } = useAuth()
const { createToast } = useToast()

const signOutDialogOpen = ref(false)
const isSigningOut = ref(false)

interface SessionInfo {
  createdAt: Date
  expiresAt: Date
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

  return {
    createdAt: new Date(session.value.created_at || Date.now()),
    expiresAt: new Date(session.value.expires_at || Date.now()),
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

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const isExpiringSoon = computed(() => {
  if (!sessionInfo.value) return false
  const expiresAt = sessionInfo.value.expiresAt
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
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
      title: 'Signed out',
      description: 'You have been successfully signed out.',
      type: 'success',
    })
    closeSignOutDialog()
  } catch (err: any) {
    createToast({
      title: 'Error signing out',
      description: err.message || 'Failed to sign out. Please try again.',
      type: 'error',
    })
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <div>
    <p class="text-sm font-medium text-neutral-700 mb-3 block">Active Sessions</p>

    <div v-if="!sessionInfo" class="text-sm text-neutral-500">No active session found</div>

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
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-neutral-900">
                  {{
                    sessionInfo.deviceType === 'desktop'
                      ? 'Desktop'
                      : sessionInfo.deviceType === 'mobile'
                        ? 'Mobile'
                        : sessionInfo.deviceType === 'tablet'
                          ? 'Tablet'
                          : 'Unknown Device'
                  }}
                </p>
                <Badge v-if="sessionInfo.isCurrent" variant="success" size="sm"> Current </Badge>
                <Badge v-if="isExpiringSoon" variant="warning" size="sm"> Expiring Soon </Badge>
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
            Sign Out
          </Button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-200">
          <div class="flex items-start gap-2">
            <Calendar class="w-4 h-4 text-neutral-400 mt-0.5" />
            <div>
              <p class="text-xs text-neutral-500 mb-0.5">Created</p>
              <p class="text-sm text-neutral-900">{{ formatDate(sessionInfo.createdAt) }}</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <Clock class="w-4 h-4 text-neutral-400 mt-0.5" />
            <div>
              <p class="text-xs text-neutral-500 mb-0.5">Expires</p>
              <p class="text-sm text-neutral-900">
                {{ formatDate(sessionInfo.expiresAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Dialog v-model:open="signOutDialogOpen" size="md">
      <template #title>Sign Out</template>
      <template #description>
        Are you sure you want to sign out? You will need to sign in again to access your account.
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            :disabled="isSigningOut"
            @click="closeSignOutDialog"
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" :disabled="isSigningOut" @click="handleSignOut">
            {{ isSigningOut ? 'Signing out...' : 'Sign Out' }}
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
