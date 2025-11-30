<script setup lang="ts">
import { Card } from '@/components/ui'
import ProjectMembersDialog from './ProjectMembersDialog/ProjectMembersDialog.vue'
import ProjectInviteDialog from './ProjectInviteDialog/ProjectInviteDialog.vue'
import { useAuth } from '@/composables/useAuth'
import uniqolor from 'uniqolor'
import { computed } from 'vue'

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

const projectColor = computed(() =>
  uniqolor(props.projectKey || props.projectId, {
    lightness: 70,
    saturation: 60,
  }),
)
</script>

<template>
  <Card>
    <div class="space-y-6">
      <div class="flex items-start justify-between">
        <div class="space-y-2">
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
          <p v-if="description" class="text-neutral-600 text-lg">
            {{ description }}
          </p>
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
    </div>
  </Card>
</template>
