<script setup lang="ts">
import { Button } from '@/components/ui'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

interface Props {
  errorMessage: string | null
}

const props = defineProps<Props>()

const router = useRouter()
const { t } = useI18n()

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div class="animate-in fade-in p-6 rounded-lg bg-error-50 border max-w-full md:max-w-1/2 mx-auto border-error-400">
    <div class="flex items-center flex-col gap-3">
      <span class="text-error-800 font-medium text-lg">{{ t('projectMainContent.error.title') }}</span>
      <p class="text-error-600 text-sm text-center">
        {{ errorMessage || t('projectMainContent.error.message') }}
      </p>
      <Button variant="outline" @click="handleBack" class="mt-2">{{ t('projectMainContent.error.goToDashboard') }}</Button>
    </div>
  </div>
</template>
