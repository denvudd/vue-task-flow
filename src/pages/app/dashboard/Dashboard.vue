<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import DashboardProjects from './DashboardProjects.vue'
import ProfileDetails from '../profile/ProfileDetails.vue'

const { profile, loading } = useAuth()
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
    <div class="text-neutral-600">Loading...</div>
  </div>

  <div v-else class="space-y-6">
    <div>
      <h2 class="text-3xl font-bold text-neutral-900 mb-2">
        Welcome, {{ profile?.full_name || profile?.username }}!
      </h2>
      <p class="text-neutral-600">We're glad to have you here.</p>
    </div>

    <ProfileDetails />

    <DashboardProjects />
  </div>
</template>
