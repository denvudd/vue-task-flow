<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { Upload, X, Edit2 } from 'lucide-vue-next'
import Button from '../atoms/Button.vue'
import Dialog from './Dialog.vue'

interface Props {
  modelValue?: File | null
  currentAvatarUrl?: string | null
  disabled?: boolean
  invalid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  invalid: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const showCropper = ref(false)
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)
const isDragging = ref(false)

const displayPreview = computed(() => {
  if (previewUrl.value) return previewUrl.value
  if (props.currentAvatarUrl) return props.currentAvatarUrl
  return null
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      selectedFile.value = null
      previewUrl.value = null
      showCropper.value = false
    }
  },
)

const handleFileSelect = (file: File | null) => {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    emit('update:modelValue', null)
    emit('error', 'Please select a valid image file')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    emit('update:modelValue', null)
    emit('error', 'Image size must be less than 5MB')
    return
  }

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
    showCropper.value = true
  }
  reader.readAsDataURL(file)
}

const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  handleFileSelect(file)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  if (props.disabled) return

  const file = event.dataTransfer?.files[0] || null
  handleFileSelect(file)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (!props.disabled) {
    isDragging.value = true
  }
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleRemove = () => {
  selectedFile.value = null
  previewUrl.value = null
  showCropper.value = false
  emit('update:modelValue', null)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleEdit = () => {
  if (selectedFile.value) {
    showCropper.value = true
  } else if (fileInput.value) {
    fileInput.value.click()
  }
}

const getCroppedImage = (): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!cropperRef.value) {
      reject(new Error('Cropper not initialized'))
      return
    }

    const result = cropperRef.value.getResult()
    if (!result) {
      reject(new Error('Failed to get cropped image'))
      return
    }

    const canvas = result.canvas
    if (!canvas || typeof canvas.toBlob !== 'function') {
      reject(new Error('Invalid canvas result'))
      return
    }

    canvas.toBlob(
      (blob: Blob | null) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }

        const file = new File([blob], selectedFile.value?.name || 'avatar.jpg', {
          type: blob.type || 'image/jpeg',
        })
        resolve(file)
      },
      'image/jpeg',
      0.9,
    )
  })
}

const handleCrop = async () => {
  try {
    const croppedFile = await getCroppedImage()
    selectedFile.value = croppedFile

    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(croppedFile)

    showCropper.value = false
    emit('update:modelValue', croppedFile)
  } catch (error) {
    console.error('Error cropping image:', error)
  }
}

const handleCancelCrop = () => {
  showCropper.value = false
}
</script>

<template>
  <div class="space-y-4">
    <Dialog v-model:open="showCropper" :lazy-mount="true" :unmount-on-exit="true" size="2xl">
      <template #title>Edit Avatar</template>
      <template #description>
        Adjust the image to your liking. You can move and resize the selection area.
      </template>
      <div style="height: 400px" class="mb-4">
        <Cropper
          v-if="previewUrl"
          ref="cropperRef"
          :src="previewUrl"
          :stencil-props="{
            aspectRatio: 1,
            movable: true,
            resizable: true,
          }"
          class="cropper"
        />
      </div>
      <template #footer>
        <Button variant="outline" @click="handleCancelCrop">Cancel</Button>
        <Button @click="handleCrop">Apply</Button>
      </template>
    </Dialog>

    <div
      class="relative"
      :class="{
        'opacity-50 pointer-events-none': disabled,
      }"
    >
      <div
        class="border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer"
        :class="{
          'border-primary-400 bg-primary-50': isDragging && !disabled,
          'border-error-500 bg-error-50': invalid && !isDragging,
          'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50':
            !isDragging && !invalid && !disabled,
        }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="!disabled && fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          :disabled="disabled"
          @change="handleInputChange"
        />

        <div v-if="displayPreview" class="flex flex-col items-center gap-4">
          <div class="relative">
            <img
              :src="displayPreview"
              alt="Avatar preview"
              class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <div class="flex gap-2">
            <Button
              v-if="!disabled"
              type="button"
              variant="outline"
              size="sm"
              @click.stop="handleEdit"
            >
              <Edit2 class="w-4 h-4 mr-2" />
              Change Avatar
            </Button>
            <Button
              v-if="previewUrl && !disabled"
              type="button"
              variant="outline"
              size="sm"
              @click.stop="handleRemove"
            >
              <X class="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>

        <div v-else class="flex flex-col items-center gap-3">
          <div class="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center">
            <Upload class="w-8 h-8 text-neutral-400" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-neutral-700">
              Drop an image here or click to upload
            </p>
            <p class="text-xs text-neutral-500 mt-1">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cropper {
  height: 100%;
  background: #f5f5f5;
}
</style>
