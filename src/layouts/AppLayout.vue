<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/ui/organisms/AppHeader.vue'

const route = useRoute()

const mainClass = computed(() => {
  const isFullWidth = route.meta.fullWidth === true
  return isFullWidth ? 'max-w-full mx-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <AppHeader />

    <main :class="mainClass">
      <router-view />
    </main>
  </div>
</template>
