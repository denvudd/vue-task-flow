<script setup lang="ts">
import { Button } from '@/components/ui'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

interface Props {
  errorMessage: string | null
}

const props = defineProps<Props>()

const router = useRouter()

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div class="animate-in fade-in p-6 rounded-lg bg-error-50 border max-w-full md:max-w-1/2 mx-auto border-error-400">
    <div class="flex items-center flex-col gap-3">
      <span class="text-error-800 font-medium text-lg">Error loading project</span>
      <p class="text-error-600 text-sm text-center">
        {{ errorMessage || 'Failed to load project' }}
      </p>
      <Button variant="outline" @click="handleBack" class="mt-2"> Go to Dashboard </Button>
    </div>
  </div>
</template>
