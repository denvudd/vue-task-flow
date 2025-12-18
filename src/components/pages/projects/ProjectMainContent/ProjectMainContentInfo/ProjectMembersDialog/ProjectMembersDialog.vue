<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, Button } from '@/components/ui'
import { useProjectMembers } from '@/composables/useMembers'
import { Users } from 'lucide-vue-next'
import ProjectMemberRow from './ProjectMemberRow.vue'

interface Props {
  projectId: string
  projectName: string
  currentUserId: string
  ownerId: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const isOpen = ref(false)

const { data: membersResponse, isLoading } = useProjectMembers(computed(() => props.projectId))

const members = computed(() => membersResponse.value?.data || [])

const owner = computed(() => members.value.find((m) => m.user_id === props.ownerId))
const regularMembers = computed(() => members.value.filter((m) => m.user_id !== props.ownerId))

const open = () => {
  isOpen.value = true
}
</script>

<template>
  <div>
    <slot name="trigger" :open="open">
      <Button variant="outline" size="sm" @click="open">
        <Users class="w-4 h-4 mr-2" />
        {{ t('projectMembers.triggerButton') }}
      </Button>
    </slot>

    <Dialog v-model:open="isOpen" size="xl">
      <template #title>{{ t('projectMembers.title', { projectName }) }}</template>
      <template #description>
        {{ t('projectMembers.description') }}
      </template>

      <div class="space-y-6">
        <div v-if="isLoading" class="text-center py-8 text-neutral-600">{{ t('projectMembers.loading') }}</div>

        <div v-else class="space-y-6">
          <!-- Owner section -->
          <div v-if="owner" class="space-y-3">
            <h3 class="text-sm font-semibold text-neutral-700 uppercase tracking-wide">{{ t('projectMembers.ownerSection') }}</h3>
            <ProjectMemberRow
              :member="owner"
              :project-id="projectId"
              :current-user-id="currentUserId"
              :owner-id="ownerId"
            />
          </div>

          <div v-if="regularMembers.length > 0" class="space-y-3">
            <h3 class="text-sm font-semibold text-neutral-700">
              {{ t('projectMembers.membersSection', { count: regularMembers.length }) }}
            </h3>
            <div class="space-y-3">
              <ProjectMemberRow
                v-for="member in regularMembers"
                :key="member.user_id"
                :member="member"
                :project-id="projectId"
                :current-user-id="currentUserId"
                :owner-id="ownerId"
              />
            </div>
          </div>

          <div
            v-if="!owner && regularMembers.length === 0"
            class="text-center py-8 text-neutral-600"
          >
            {{ t('projectMembers.noMembers') }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
