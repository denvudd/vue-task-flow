<script setup lang="ts">
import { Card } from '@/components/ui'
import ProjectMembersDialog from './ProjectMembersDialog/ProjectMembersDialog.vue'
import ProjectInviteDialog from './ProjectInviteDialog/ProjectInviteDialog.vue'
import { useAuth } from '@/composables/useAuth'
import uniqolor from 'uniqolor'
import { computed } from 'vue'
import { useProjectContext } from '@/composables/useProjectContext'
import { useMediaQuery } from '@vueuse/core'

interface Props {
  projectId: string
  name: string
  projectKey: string | null
  description: string | null
  isOwner: boolean
  ownerId: string
}

const props = defineProps<Props>()

const { user } = useAuth()
const { isSidebarOpen } = useProjectContext()
const isDesktop = useMediaQuery('(min-width: 1024px)')

const projectColor = computed(() =>
  uniqolor(props.projectKey || props.projectId, {
    lightness: 70,
    saturation: 60,
  }),
)
</script>

<template>
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
      <div class="w-full">
        <div class="space-y-1">
          <div class="flex w-full items-center justify-between flex-wrap gap-x-2 gap-y-2">
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold text-neutral-900">{{ name }}</h1>
              <span
                v-if="projectKey"
                class="text-sm text-neutral-600 px-3 py-1 rounded font-medium"
                :style="{
                  backgroundColor: projectColor.color,
                  color: projectColor.isLight
                    ? 'var(--color-neutral-500)'
                    : 'var(--color-text-secondary)',
                }"
              >
                {{ projectKey }}
              </span>
            </div>
            <div v-if="isOwner && user" class="flex items-center gap-2">
              <ProjectMembersDialog
                :project-id="projectId"
                :project-name="name"
                :current-user-id="user?.id"
                :owner-id="ownerId"
              />
              <ProjectInviteDialog :project-id="projectId" :project-name="name" />
            </div>
          </div>
          <p v-if="description" class="text-neutral-600 mb-1">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
