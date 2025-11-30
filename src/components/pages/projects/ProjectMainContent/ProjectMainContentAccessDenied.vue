<script setup lang="ts">
import { Button } from '@/components/ui'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

const router = useRouter()

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div
    class="animate-in fade-in p-6 rounded-lg max-w-full md:max-w-1/2 mx-auto bg-warning-50 border border-warning-400"
  >
    <div class="flex items-center flex-col gap-3">
      <span class="text-warning-800 font-medium text-lg">Access Denied</span>
      <p class="text-warning-600 text-sm text-center">
        This project is not public and you are not a member or owner of this project.
      </p>
      <Button variant="outline" @click="handleBack" class="mt-2"> Go to Dashboard </Button>
    </div>
  </div>
</template>
