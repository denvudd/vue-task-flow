<script setup lang="ts">
import { Button } from '@/components/ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

const router = useRouter()
const { t } = useI18n()

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div
    class="animate-in fade-in p-6 rounded-lg max-w-full md:max-w-1/2 mx-auto bg-warning-50 border border-warning-400"
  >
    <div class="flex items-center flex-col gap-3">
      <span class="text-warning-800 font-medium text-lg">{{ t('projectMainContent.accessDenied.title') }}</span>
      <p class="text-warning-600 text-sm text-center">
        {{ t('projectMainContent.accessDenied.message') }}
      </p>
      <Button variant="outline" @click="handleBack" class="mt-2">{{ t('projectMainContent.accessDenied.goToDashboard') }}</Button>
    </div>
  </div>
</template>
