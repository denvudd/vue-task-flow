<script setup lang="ts">
import { Button } from '@/components/ui'
import { SquareCheck, GripVertical, Plus } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

interface Props {
  hoveredDragHandle: boolean
  isDragging: boolean
  isOvered: boolean
  handleDragStart: (event: PointerEvent | KeyboardEvent) => void
}

const props = defineProps<Props>()

const { isAuthenticated } = useAuth()

const emit = defineEmits<{
  (e: 'update:hovered-drag-handle', payload: boolean): void
}>()

const handleMouseEnter = () => {
  emit('update:hovered-drag-handle', true)
}

const handleMouseLeave = () => {
  emit('update:hovered-drag-handle', false)
}
</script>

<template>
  <div v-if="isAuthenticated" class="sticky z-85 flex" :style="{ insetInlineStart: '36px' }">
    <div class="opacity-100 transition-opacity">
      <div class="absolute top-1.5" :style="{ insetInlineStart: '-30px' }">
        <div
          class="transition-opacity"
          :class="hoveredDragHandle ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <Button variant="ghost" size="icon" @pointerdown="handleDragStart" class="p-1!">
            <SquareCheck class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isAuthenticated" class="absolute z-85 flex left-0">
    <div class="opacity-100 transition-opacity">
      <div class="absolute top-1.5" :style="{ insetInlineStart: '-50px' }">
        <div class="transition-opacity opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            @pointerdown="handleDragStart"
            class="cursor-grab! p-1!"
            :tooltip="isDragging || isOvered ? undefined : 'Drag to move'"
          >
            <GripVertical class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isAuthenticated" class="absolute z-85 flex left-0">
    <div class="opacity-100 transition-opacity">
      <div class="absolute top-1.5" :style="{ insetInlineStart: '-70px' }">
        <div class="transition-opacity opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            @pointerdown="handleDragStart"
            class="p-1!"
            :tooltip="isDragging || isOvered ? undefined : 'Click to add below'"
          >
            <Plus class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
