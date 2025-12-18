<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUpdateProject, useProject } from '@/composables/useProjects'
import { Button, Card, Field, FieldInput, FieldTextarea } from '@/components/ui'
import { createProjectSchema } from '@/validation/projects'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

const projectId = computed(() => route.params.id as string)

const {
  data: project,
  isLoading: projectLoading,
  isError: hasProjectError,
  error: projectError,
} = useProject(projectId)

const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject()

const error = ref<string | null>(null)
const success = ref(false)

const { handleSubmit, errors, defineField, isFieldTouched, isFieldValid } = useForm({
  validationSchema: toTypedSchema(createProjectSchema),
  validateOnMount: false,
})

const [name, nameAttrs] = defineField('name', {
  validateOnModelUpdate: true,
})
const [description, descriptionAttrs] = defineField('description', {
  validateOnModelUpdate: true,
})
const [key, keyAttrs] = defineField('key', {
  validateOnModelUpdate: true,
})

const nameValid = computed(() => isFieldValid('name') && isFieldTouched('name'))
const descriptionValid = computed(
  () => isFieldValid('description') && isFieldTouched('description'),
)
const keyValid = computed(() => isFieldValid('key') && isFieldTouched('key'))

const isKeyManuallyEdited = ref(false)

// Load project data into form
watch(
  project,
  (newProject) => {
    if (newProject) {
      name.value = newProject.name || ''
      description.value = newProject.description || ''
      key.value = newProject.key || ''
      isKeyManuallyEdited.value = !!newProject.key
    }
  },
  { immediate: true },
)

watch(name, (newName) => {
  if (!isKeyManuallyEdited.value && newName) {
    key.value = newName.substring(0, 3).toUpperCase()
  }
})

const handleKeyInput = () => {
  if (key.value) {
    isKeyManuallyEdited.value = true
  } else {
    isKeyManuallyEdited.value = false
  }
}

const onSubmit = handleSubmit(async (formValues) => {
  error.value = null

  if (!user.value?.id) {
    error.value = 'You must be logged in to update a project'
    return
  }

  if (!project.value) {
    error.value = 'Project not found'
    return
  }

  if (project.value.owner_id !== user.value.id) {
    error.value = 'You do not have permission to edit this project'
    return
  }

  try {
    await updateProject({
      projectId: projectId.value,
      updates: {
        name: formValues.name,
        description: formValues.description || null,
        key: formValues.key || null,
      },
    })

    success.value = true

    setTimeout(() => {
      router.push(ROUTES.Dashboard)
    }, 1500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update project'
  }
})

const handleBack = () => {
  router.push(ROUTES.Dashboard)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 p-4 md:p-8">
    <div class="max-w-2xl mx-auto">
      <div>
        <Button variant="ghost" size="sm" @click="handleBack" class="mb-4">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <div v-if="projectLoading" class="flex justify-center items-center py-8">
          <div class="text-neutral-600">Loading project...</div>
        </div>

        <div
          v-else-if="hasProjectError"
          class="text-center py-8 bg-error-50 border border-error-200 rounded-lg"
        >
          <p class="text-error-600">
            {{ projectError instanceof Error ? projectError.message : 'Failed to load project' }}
          </p>
          <Button variant="outline" @click="handleBack" class="mt-4">Back to Dashboard</Button>
        </div>

        <div v-else-if="!project" class="text-center py-8">
          <p class="text-neutral-600">Project not found</p>
          <Button variant="outline" @click="handleBack" class="mt-4">Back to Dashboard</Button>
        </div>

        <template v-else>
          <h1 class="text-3xl font-bold text-neutral-900">Edit Project</h1>
          <p class="text-neutral-600 mt-2 mb-6">Update the project details below</p>
          <form @submit.prevent="onSubmit" class="space-y-6">
            <div v-if="success" class="p-4 rounded-lg bg-success-50 border border-success-200">
              <p class="text-sm text-success-700 font-medium">
                ✓ Project updated successfully! Redirecting...
              </p>
            </div>

            <div v-if="error" class="p-4 rounded-lg bg-error-50 border border-error-200">
              <p class="text-sm text-error-600">{{ error }}</p>
            </div>

            <Field
              label="Project Name"
              :helper-text="errors.name || 'Enter a descriptive name for your project'"
              :error-text="errors.name"
              :invalid="!!errors.name"
              required
            >
              <FieldInput
                v-model="name"
                type="text"
                placeholder="My Awesome Project"
                :disabled="isUpdating || success"
                :invalid="!!errors.name"
                :valid="nameValid"
                @blur="nameAttrs.onBlur"
              />
            </Field>

            <Field
              label="Project Key"
              :helper-text="
                errors.key || 'Short identifier (3-10 uppercase letters/numbers, e.g., PROJ, DEV)'
              "
              :error-text="errors.key"
              :invalid="!!errors.key"
            >
              <FieldInput
                v-model="key"
                type="text"
                placeholder="PROJ"
                :disabled="isUpdating || success"
                :invalid="!!errors.key"
                :valid="keyValid"
                @input="handleKeyInput"
                @blur="keyAttrs.onBlur"
                maxlength="10"
                class="uppercase"
              />
            </Field>

            <Field
              label="Description"
              :helper-text="errors.description || 'Describe what this project is about (optional)'"
              :error-text="errors.description"
              :invalid="!!errors.description"
            >
              <FieldTextarea
                v-model="description"
                placeholder="This project aims to..."
                :disabled="isUpdating || success"
                :invalid="!!errors.description"
                :valid="descriptionValid"
                @blur="descriptionAttrs.onBlur"
              />
            </Field>

            <div class="flex justify-between items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                :disabled="isUpdating || success"
                @click="handleBack"
              >
                Cancel
              </Button>
              <Button type="submit" :disabled="isUpdating || success">
                {{ isUpdating ? 'Updating...' : 'Update Project' }}
              </Button>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

