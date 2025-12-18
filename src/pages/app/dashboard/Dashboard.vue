<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import DashboardProjects from '../../../components/pages/dashboard/DashboardProjects.vue'
import ProfileDetails from '../../../components/pages/profile/ProfileDetails.vue'

const { profile, loading } = useAuth()
const { t } = useI18n()

const displayName = computed(() => profile.value?.full_name || profile.value?.username || '')
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="text-neutral-600">{{ t('dashboard.loading') }}</div>
  </div>

  <div v-else class="space-y-6">
    <div>
      <h2 class="text-3xl font-bold text-neutral-900 mb-2">
        {{ t('dashboard.welcomeTitle', { name: displayName }) }}
      </h2>
      <p class="text-neutral-600">{{ t('dashboard.welcomeSubtitle') }}</p>
    </div>

    <ProfileDetails />

    <DashboardProjects />
  </div>
</template>
