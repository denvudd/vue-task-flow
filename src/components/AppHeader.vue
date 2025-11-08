<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui'
import logo from '/images/logo.png'
import { ROUTES } from '@/lib/routing'

const router = useRouter()
const { profile, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  router.push(ROUTES.Login)
}

const navigateToProfile = () => {
  router.push(ROUTES.Profile)
}

const navigateToHome = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <nav class="bg-white shadow-sm border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <button
            @click="navigateToHome"
            class="text-xl font-bold text-primary-900 hover:text-primary-700 transition-colors cursor-pointer"
          >
            <img :src="logo" alt="Task Flow" class="max-w-36 h-auto" />
          </button>
        </div>

        <div class="flex items-center gap-4">
          <div v-if="profile" class="text-sm text-neutral-600">
            <span class="font-medium">{{ profile.username }}</span>
            <span
              v-if="profile.role === 'admin'"
              class="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
            >
              Admin
            </span>
          </div>

          <Button variant="outline" size="sm" @click="navigateToProfile"> Edit Profile </Button>

          <Button variant="outline" size="sm" @click="handleSignOut"> Sign Out </Button>
        </div>
      </div>
    </div>
  </nav>
</template>
