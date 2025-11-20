<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCreateProject } from '@/composables/useProjects'
import { Button, Card, Field, FieldInput, FieldTextarea } from '@/components/ui'
import { createProjectSchema } from '@/validation/projects'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { ROUTES } from '@/lib/routing'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const { user } = useAuth()

const { mutateAsync: createProject, isPending: isCreating } = useCreateProject()

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
    error.value = 'You must be logged in to create a project'
    return
  }

  try {
    await createProject({
      name: formValues.name,
      description: formValues.description || null,
      key: formValues.key || null,
      owner_id: user.value.id,
    })

    success.value = true

    setTimeout(() => {
      router.push(ROUTES.Dashboard)
    }, 1500)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create project'
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
        <h1 class="text-3xl font-bold text-neutral-900">Create New Project</h1>
        <p class="text-neutral-600 mt-2 mb-6">Fill in the details below to create a new project</p>
        <form @submit.prevent="onSubmit" class="space-y-6">
          <div v-if="success" class="p-4 rounded-lg bg-success-50 border border-success-200">
            <p class="text-sm text-success-700 font-medium">
              ✓ Project created successfully! Redirecting...
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
              :disabled="isCreating || success"
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
              :disabled="isCreating || success"
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
              :disabled="isCreating || success"
              :invalid="!!errors.description"
              :valid="descriptionValid"
              @blur="descriptionAttrs.onBlur"
            />
          </Field>

          <div class="flex justify-between items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              :disabled="isCreating || success"
              @click="handleBack"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isCreating || success">
              {{ isCreating ? 'Creating...' : 'Create Project' }}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>
