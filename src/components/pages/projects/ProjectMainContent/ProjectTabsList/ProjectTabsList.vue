<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TabsList, TabsTrigger } from '@/components/ui'
import { useProjectContext } from '@/composables/useProjectContext'
import { SquareKanban, TableIcon } from 'lucide-vue-next'
import { ProjectTabsToolbar } from './ProjectTabsToolbar'
import type { Tables } from '@/types/supabase'
import { useAuth } from '@/composables/useAuth'
import ProjectTabsSelecionToolbar from './ProjectTabsSelecionToolbar.vue'
import { useMediaQuery } from '@vueuse/core'

interface Props {
  tickets: Tables<'tickets'>[] | null | undefined
}

const props = withDefaults(defineProps<Props>(), {
  tickets: () => [],
})

const isDesktop = useMediaQuery('(min-width: 1024px)')
const { isSidebarOpen } = useProjectContext()
const { t } = useI18n()
</script>

<template>
  <ProjectTabsSelecionToolbar />
  <div
    class="px-4 sm:px-8 lg:px-24"
    :class="{ 'shrink-0 z-86 pe-4': isSidebarOpen }"
    :style="{
      insetInlineStart: isSidebarOpen ? '0' : 'auto',
      position: isSidebarOpen ? 'sticky' : 'relative',
    }"
  >
    <div
      class="w-full flex items-center"
      :style="{
        insetInlineStart: isSidebarOpen && isDesktop ? '96px' : 'auto',
      }"
    >
      <div class="flex items-center justify-between flex-wrap sm:flex-nowrap gap-2 w-full">
        <TabsList class="w-fit!">
          <TabsTrigger value="table">
            <TableIcon class="size-4" />
            {{ t('projectTabs.table') }}
          </TabsTrigger>
          <TabsTrigger value="board">
            <SquareKanban class="size-4" />
            {{ t('projectTabs.board') }}
          </TabsTrigger>
        </TabsList>
        <ProjectTabsToolbar :tickets="tickets || []" />
      </div>
    </div>
  </div>
</template>
