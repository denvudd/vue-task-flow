<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import { ROUTES } from '@/lib/routing'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const router = useRouter()
const { createToast } = useToast()
const { t } = useI18n()

onMounted(() => {
  createToast({
    type: 'error',
    title: t('ticketDetails.notFound.title'),
    description: t('ticketDetails.notFound.description'),
  })
  router.replace(ROUTES.Project(props.projectId))
})
</script>

<template>
  <div class="py-8 text-center text-neutral-600 animate-in fade-in duration-300">
    {{ t('ticketDetails.notFound.message') }}
  </div>
</template>
