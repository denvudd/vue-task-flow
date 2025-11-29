<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button, Avatar, Badge, FieldSelect } from '@/components/ui'
import type { SelectItem } from '@/components/ui/atoms/FieldSelect.vue'
import { Trash2, Check, X, Edit } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useRemoveProjectMember, useUpdateProjectMemberRole } from '@/composables/useMembers'
import { PROJECT_ROLES, PROJECT_ROLE_LABELS, type ProjectRole } from '@/constants/projects'

interface Props {
  member: any // project_members with user:profiles
  projectId: string
  currentUserId: string
  ownerId: string
}

const props = defineProps<Props>()

const { createToast } = useToast()
const { mutateAsync: removeMember, isPending: isRemoving } = useRemoveProjectMember()
const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateProjectMemberRole()

const isEditingRole = ref(false)
const selectedRole = ref<ProjectRole>(props.member.role as ProjectRole)

const isOwner = computed(() => props.member.user_id === props.ownerId)
const isCurrentUser = computed(() => props.member.user_id === props.currentUserId)

// Prepare role options for FieldSelect
const roleItems = computed<SelectItem[]>(() =>
  Object.values(PROJECT_ROLES).map((role) => ({
    label: PROJECT_ROLE_LABELS[role],
    value: role,
  })),
)

// Convert selectedRole to array format for FieldSelect
const selectedRoleValue = computed(() => [selectedRole.value])

const handleRemove = async () => {
  if (!confirm('Are you sure you want to remove this member from the project?')) {
    return
  }

  try {
    await removeMember({
      projectId: props.projectId,
      userId: props.member.user_id,
    })
    createToast({
      title: 'Member removed',
      description: 'The member has been removed from the project',
      type: 'success',
    })
  } catch (err) {
    console.error('Failed to remove member:', err)
    createToast({
      title: 'Failed to remove member',
      type: 'error',
    })
  }
}

const startEditRole = () => {
  selectedRole.value = props.member.role as ProjectRole
  isEditingRole.value = true
}

const cancelEditRole = () => {
  isEditingRole.value = false
  selectedRole.value = props.member.role as ProjectRole
}

const saveRole = async () => {
  if (selectedRole.value === props.member.role) {
    isEditingRole.value = false
    return
  }

  try {
    await updateRole({
      projectId: props.projectId,
      userId: props.member.user_id,
      role: selectedRole.value,
    })
    createToast({
      title: 'Role updated',
      description: `Role changed to "${PROJECT_ROLE_LABELS[selectedRole.value]}"`,
      type: 'success',
    })
    isEditingRole.value = false
  } catch (err) {
    console.error('Failed to update role:', err)
    createToast({
      title: 'Failed to update role',
      type: 'error',
    })
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 p-4 border border-neutral-200 rounded-lg">
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <Avatar
        :src="member.user?.avatar_url"
        :name="member.user?.full_name || member.user?.username || 'Unknown User'"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <div class="font-medium text-neutral-900 truncate">
            {{ member.user?.full_name || member.user?.username || 'Unknown User' }}
          </div>
          <Badge v-if="isOwner" variant="primary" size="sm">Owner</Badge>
          <Badge v-if="isCurrentUser && !isOwner" variant="info" size="sm">You</Badge>
        </div>
        <div class="text-sm text-neutral-600">Joined {{ formatDate(member.joined_at) }}</div>
      </div>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <!-- Role display/edit -->
      <div v-if="!isEditingRole" class="flex items-center gap-2">
        <Badge variant="secondary">
          {{ PROJECT_ROLE_LABELS[member.role as ProjectRole] }}
        </Badge>
        <Button
          v-if="!isOwner"
          variant="ghost"
          size="icon"
          @click="startEditRole"
          :disabled="isRemoving"
        >
          <Edit class="size-4" />
        </Button>
      </div>

      <div v-else class="flex items-center gap-1">
        <div>
          <FieldSelect
            :items="roleItems"
            :value="selectedRoleValue"
            :on-value-change="
              (details) => {
                if (details.value[0]) {
                  selectedRole = details.value[0] as ProjectRole
                }
              }
            "
            placeholder="Select role"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          @click="saveRole"
          :disabled="isUpdatingRole"
          title="Save"
        >
          <Check class="w-4 h-4 text-success-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          @click="cancelEditRole"
          :disabled="isUpdatingRole"
          title="Cancel"
        >
          <X class="w-4 h-4 text-neutral-600" />
        </Button>
      </div>

      <Button
        v-if="!isOwner && !isEditingRole"
        variant="ghost"
        size="icon"
        @click="handleRemove"
        :disabled="isRemoving || isEditingRole"
        title="Remove member"
      >
        <Trash2 class="w-4 h-4 text-error-600" />
      </Button>
    </div>
  </div>
</template>
