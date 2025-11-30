<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { ROUTES } from '@/lib/routing'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const router = useRouter()
const { createToast } = useToast()

onMounted(() => {
  createToast({
    type: 'error',
    title: 'Ticket not found',
    description: 'The ticket you are looking for does not exist.',
  })
  router.replace(ROUTES.Project(props.projectId))
})
</script>

<template>
  <div class="py-8 text-center text-neutral-600 animate-in fade-in duration-300">
    Ticket not found
  </div>
</template>
