<script setup lang="ts">
import { Button } from '@/components/ui'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

const router = useRouter()
const { t } = useI18n()

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-24 mb-4">
    <Button variant="ghost" size="sm" @click="handleBack">
      <ArrowLeft class="w-4 h-4 mr-2" />
      {{ t('projectMainContent.backToDashboard') }}
    </Button>
  </div>
</template>
