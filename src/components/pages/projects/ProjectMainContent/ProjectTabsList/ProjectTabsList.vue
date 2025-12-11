<script setup lang="ts">
import { TabsList, TabsTrigger } from '@/components/ui'
import { useProjectContext } from '@/composables/useProjectContext'
import { SquareKanban, TableIcon } from 'lucide-vue-next'
import { ProjectTabsToolbar } from './ProjectTabsToolbar'
import type { Tables } from '@/types/supabase'
import { useAuth } from '@/composables/useAuth'
import ProjectTabsSelecionToolbar from './ProjectTabsSelecionToolbar.vue'

interface Props {
  tickets: Tables<'tickets'>[]
}

const props = defineProps<Props>()

const { isAuthenticated } = useAuth()
const { isSidebarOpen, project } = useProjectContext()
</script>

<template>
  <ProjectTabsSelecionToolbar />
  <div
    class="px-24"
    :class="{ 'shrink-0 z-86 pe-4': isSidebarOpen }"
    :style="{
      insetInlineStart: isSidebarOpen ? '0' : 'auto',
      position: isSidebarOpen ? 'sticky' : 'relative',
    }"
  >
    <div
      class="w-full flex items-center"
      :style="{
        insetInlineStart: isSidebarOpen ? '96px' : 'auto',
      }"
    >
      <div class="flex items-center justify-between w-full">
        <TabsList>
          <TabsTrigger value="table">
            <TableIcon class="size-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="board">
            <SquareKanban class="size-4" />
            Board
          </TabsTrigger>
        </TabsList>
        <ProjectTabsToolbar :tickets="tickets" />
      </div>
    </div>
  </div>
</template>
