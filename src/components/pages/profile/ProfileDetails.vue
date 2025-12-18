<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import { Card } from '@/components/ui'

const { user, profile, loading } = useAuth()
const { t } = useI18n()
</script>

<template>
  <Card>
    <div class="space-y-4">
      <div class="flex items-center gap-1.5">
        <h3 class="text-xl font-semibold text-neutral-900">{{ t('profile.title') }}</h3>
        <div
          :class="[
            'rounded-md px-2 text-xs font-medium text-white p-0.5',
            {
              'bg-success-500': user?.email_confirmed_at,
              'bg-error-500': !user?.email_confirmed_at,
            },
          ]"
        >
          {{ user?.email_confirmed_at ? t('profile.verified') : t('profile.unverified') }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-neutral-700">{{ t('profile.email') }}</label>
          <p class="text-neutral-900">{{ user?.email }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-neutral-700">{{ t('profile.username') }}</label>
          <p class="text-neutral-900">{{ profile?.username || t('profile.notSet') }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-neutral-700">{{ t('profile.fullName') }}</label>
          <p class="text-neutral-900">{{ profile?.full_name || t('profile.notSet') }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-neutral-700">{{ t('profile.memberSince') }}</label>
          <p class="text-neutral-900">
            {{
              profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : t('profile.unknown')
            }}
          </p>
        </div>
      </div>
    </div>
  </Card>
</template>
