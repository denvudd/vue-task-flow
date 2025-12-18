<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, Button, Field, Toggle, buttonVariants } from '@/components/ui'
import { useProjectInviteLinks, useCreateInviteLink } from '@/composables/useInvites'
import { Plus, Share2, Eye, LockKeyhole } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import InviteLinkRow from './InviteLinkRow.vue'
import {
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
  PROJECT_ROLE_DESCRIPTIONS,
  PROJECT_VISIBILITIES,
  type ProjectRole,
  type ProjectVisibility,
} from '@/constants/projects'
import { ROUTES } from '@/lib/routing'
import { useProjectContext } from '@/composables/useProjectContext'
import { useUpdateProject } from '@/composables/useProjects'

interface Props {
  projectId: string
  projectName: string
}

const props = defineProps<Props>()

const { createToast } = useToast()
const { t } = useI18n()
const { project, isOwner } = useProjectContext()
const { mutateAsync: updateProject, isPending: isUpdatingVisibility } = useUpdateProject()

const isOpen = ref(false)
const showCreateForm = ref(false)
const selectedRole = ref<ProjectRole>(PROJECT_ROLES.VIEWER)

const { data: inviteLinksResponse, isLoading } = useProjectInviteLinks(
  computed(() => props.projectId),
)
const { mutateAsync: createInviteLink, isPending: isCreating } = useCreateInviteLink()

const inviteLinks = computed(() => inviteLinksResponse.value?.data || [])

const baseUrl = computed(() => {
  return `${window.location.origin}${ROUTES.Project(props.projectId)}`
})

const projectVisibility = computed(() => {
  return (project.value?.visibility as ProjectVisibility) || PROJECT_VISIBILITIES.PRIVATE
})

const isProjectPrivate = computed(() => {
  return projectVisibility.value === PROJECT_VISIBILITIES.PRIVATE
})

const handleVisibilityChange = async (pressed: boolean) => {
  const newVisibility = pressed
    ? (PROJECT_VISIBILITIES.PRIVATE as ProjectVisibility)
    : (PROJECT_VISIBILITIES.PUBLIC as ProjectVisibility)
  if (newVisibility === projectVisibility.value) return

  try {
    await updateProject({
      projectId: props.projectId,
      updates: { visibility: newVisibility },
    })
  } catch (err) {
    console.error('Failed to update visibility:', err)
    createToast({
      title: t('projectInvite.errors.updateVisibilityFailed'),
      type: 'error',
    })
  }
}

const handleCreateLink = async () => {
  try {
    await createInviteLink({
      projectId: props.projectId,
      role: selectedRole.value,
    })
    createToast({
      title: t('projectInvite.success.linkCreated'),
      description: t('projectInvite.success.linkCreatedDescription'),
      type: 'success',
    })
    showCreateForm.value = false
    selectedRole.value = PROJECT_ROLES.VIEWER
  } catch (err) {
    console.error('Failed to create invite link:', err)
    createToast({
      title: t('projectInvite.errors.createFailed'),
      type: 'error',
    })
  }
}

const handleCancelCreate = () => {
  showCreateForm.value = false
  selectedRole.value = PROJECT_ROLES.VIEWER
}

const open = () => {
  isOpen.value = true
}
</script>

<template>
  <div>
    <slot name="trigger" :open="open">
      <Button variant="outline" size="sm" @click="open">
        <Share2 class="w-4 h-4 mr-2" />
        {{ t('projectInvite.triggerButton') }}
      </Button>
    </slot>

    <Dialog v-model:open="isOpen" size="xl">
      <template #title>{{ t('projectInvite.title', { projectName }) }}</template>

      <div class="space-y-4 sm:space-y-6">
        <Field v-if="isOwner">
          <div
            class="flex items-start flex-wrap sm:flex-nowrap flex-col sm:flex-row justify-between w-full gap-3"
          >
            <div class="span-y-1">
              <p class="text-sm font-medium text-neutral-700">
                {{ t('projectInvite.visibility.label') }}
              </p>
              <p class="text-xs text-neutral-600">
                {{
                  isProjectPrivate
                    ? t('projectInvite.visibility.privateDescription')
                    : t('projectInvite.visibility.publicDescription')
                }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-neutral-700">{{
                isProjectPrivate
                  ? t('projectInvite.visibility.private')
                  : t('projectInvite.visibility.public')
              }}</span>
              <Toggle
                :pressed="isProjectPrivate"
                :disabled="isUpdatingVisibility"
                :class="buttonVariants({ variant: 'outline', size: 'icon' })"
                :tooltip="
                  isProjectPrivate
                    ? t('projectInvite.visibility.makePublic')
                    : t('projectInvite.visibility.makePrivate')
                "
                @pressed-change="handleVisibilityChange"
              >
                <span class="sr-only">{{
                  isProjectPrivate
                    ? t('projectInvite.visibility.makePublic')
                    : t('projectInvite.visibility.makePrivate')
                }}</span>
                <Eye v-if="!isProjectPrivate" class="size-4 text-neutral-700" />
                <LockKeyhole v-else class="size-4 text-neutral-700" />
              </Toggle>
            </div>
          </div>
        </Field>

        <!-- Info message for public projects -->
        <div
          v-if="!isProjectPrivate"
          class="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600"
        >
          <p class="font-medium mb-1">{{ t('projectInvite.publicInfo.title') }}</p>
          <p>{{ t('projectInvite.publicInfo.description') }}</p>
        </div>

        <!-- Create new link form -->
        <div
          v-if="showCreateForm && isProjectPrivate"
          class="p-2 sm:p-4 bg-neutral-50 rounded-lg border border-neutral-200"
        >
          <Field :label="t('projectInvite.createForm.label')" class="mb-4">
            <div class="space-y-2">
              <label
                v-for="role in Object.values(PROJECT_ROLES)"
                :key="role"
                class="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                :class="{
                  'bg-primary-50 border-primary-300': selectedRole === role,
                }"
              >
                <input type="radio" :value="role" v-model="selectedRole" />
                <div class="flex-1">
                  <div class="font-medium text-sm text-neutral-900">
                    {{ PROJECT_ROLE_LABELS[role] }}
                  </div>
                  <div class="text-xs text-neutral-600">
                    {{ PROJECT_ROLE_DESCRIPTIONS[role] }}
                  </div>
                </div>
              </label>
            </div>
          </Field>

          <div class="flex justify-end gap-2">
            <Button variant="outline" size="sm" @click="handleCancelCreate" :disabled="isCreating">
              {{ t('projectInvite.createForm.cancel') }}
            </Button>
            <Button @click="handleCreateLink" size="sm" :disabled="isCreating">
              {{
                isCreating
                  ? t('projectInvite.createForm.creating')
                  : t('projectInvite.createForm.create')
              }}
            </Button>
          </div>
        </div>

        <div v-if="isProjectPrivate" class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="font-semibold">{{ t('projectInvite.inviteLinks.title') }}</h3>
            <Button
              v-if="!showCreateForm && isProjectPrivate"
              variant="outline"
              @click="showCreateForm = true"
              size="sm"
            >
              <Plus class="w-4 h-4 mr-1" />
              {{ t('projectInvite.inviteLinks.new') }}
            </Button>
          </div>

          <div v-if="isLoading" class="text-center py-8 text-neutral-600">
            {{ t('projectInvite.inviteLinks.loading') }}
          </div>

          <div v-else-if="inviteLinks.length === 0" class="text-center py-8 text-neutral-600">
            {{ t('projectInvite.inviteLinks.noLinks') }}
          </div>

          <div v-else class="space-y-3">
            <InviteLinkRow
              v-for="link in inviteLinks"
              :key="link.id"
              :link="link"
              :base-url="baseUrl"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
