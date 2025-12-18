<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useProjectContext } from '@/composables/useProjectContext'
import ProjectTabsCreateTicketDialog from './ProjectTabsCreateTicketDialog.vue'
import ProjectTabsFilter from './ProjectTabsFilter.vue'
import ProjectTabsSort from './ProjectTabsSort.vue'
import ProjectTabsSearch from './ProjectTabsSearch.vue'
import type { Tables } from '@/types/supabase'

interface Props {
  tickets: Tables<'tickets'>[]
}

const props = defineProps<Props>()

const { isAuthenticated } = useAuth()
const { project, isUserEditor } = useProjectContext()
</script>

<template>
  <div class="flex items-center">
    <ProjectTabsFilter />
    <ProjectTabsSort />
    <ProjectTabsSearch />
    <ProjectTabsCreateTicketDialog
      v-if="isAuthenticated && isUserEditor"
      :tickets="tickets"
      :project-id="project?.id"
    />
  </div>
</template>
