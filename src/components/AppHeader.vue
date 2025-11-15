<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { Avatar, Menu } from '@/components/ui'
import { Menu as ArkMenu } from '@ark-ui/vue/menu'
import logo from '/images/logo.png'
import { ROUTES } from '@/lib/routing'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const { profile, signOut } = useAuth()

const menuOpen = ref(false)

const avatarUrl = computed(() => {
  const url = profile.value?.avatar_url
  if (!url) return null
  if (url.startsWith('http')) return url
  return supabase.storage.from('avatars').getPublicUrl(url).data.publicUrl
})

const displayName = computed(() => {
  return profile.value?.full_name || profile.value?.username || 'User'
})

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
            <span class="font-medium">{{ profile.full_name || profile.username }}</span>
            <span
              v-if="profile.role === 'admin'"
              class="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
            >
              Admin
            </span>
          </div>

          <Menu v-model:open="menuOpen">
            <template #trigger>
              <ArkMenu.Trigger as-child>
                <button
                  type="button"
                  class="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none rounded-full"
                >
                  <Avatar :src="avatarUrl" :name="displayName" size="md" />
                </button>
              </ArkMenu.Trigger>
            </template>

            <ArkMenu.Item value="profile" as-child>
              <button @click="navigateToProfile" class="w-full text-left">Edit Profile</button>
            </ArkMenu.Item>

            <ArkMenu.Item value="logout" as-child>
              <button @click="handleSignOut" class="w-full text-left">Logout</button>
            </ArkMenu.Item>
          </Menu>
        </div>
      </div>
    </div>
  </nav>
</template>
