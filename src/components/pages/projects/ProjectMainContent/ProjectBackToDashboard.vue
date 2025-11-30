<script setup lang="ts">
import { Button } from '@/components/ui'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

const router = useRouter()

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <Button variant="ghost" size="sm" @click="handleBack" class="my-4">
    <ArrowLeft class="w-4 h-4 mr-2" />
    Back to Dashboard
  </Button>
</template>
