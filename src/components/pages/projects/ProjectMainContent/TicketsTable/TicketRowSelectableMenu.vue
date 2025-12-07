<script setup lang="ts">
import { Button, Checkbox } from '@/components/ui'
import { GripVertical, Plus } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import type { CheckboxCheckedState } from '@ark-ui/vue/checkbox'
import { useProjectContext } from '@/composables/useProjectContext'

interface Props {
  ticketId: string
  hoveredDragHandle: boolean
  isDragging: boolean
  isOvered: boolean
  handleDragStart: (event: PointerEvent | KeyboardEvent) => void
}

const props = defineProps<Props>()

const { isAuthenticated } = useAuth()
const {
  selectedTicketIds,
  selectTicket,
  deselectTicket,
  selectAllTickets,
  clearSelection,
  cleanupSelection,
} = useProjectContext()

const emit = defineEmits<{
  (e: 'update:hovered-drag-handle', payload: boolean): void
}>()

const handleMouseEnter = () => {
  emit('update:hovered-drag-handle', true)
}

const handleMouseLeave = () => {
  emit('update:hovered-drag-handle', false)
}

const handleSelectionChange = (checked: CheckboxCheckedState) => {
  if (checked) {
    selectTicket(props.ticketId)
  } else {
    deselectTicket(props.ticketId)
  }
}
</script>

<template>
  <div v-if="isAuthenticated" class="sticky z-85 flex" :style="{ insetInlineStart: '36px' }">
    <div class="opacity-100 transition-opacity">
      <div class="absolute top-0.5" :style="{ insetInlineStart: '-36px' }">
        <div
          class="h-full opacity-0 group-hover:opacity-100 transition-opacity border-b border-transparent"
          :class="
            hoveredDragHandle || !!selectedTicketIds?.length
              ? 'opacity-100 bg-neutral-100 data-[part=control]:border-primary-600!'
              : ''
          "
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <div class="h-full">
            <div class="h-full flex items-center justify-center cursor-pointer z-1">
              <div class="size-9 flex items-center justify-center">
                <Checkbox
                  :checked="selectedTicketIds.includes(ticketId)"
                  @update:checked="handleSelectionChange"
                  control-class="size-4 group-hover:border-primary-600!"
                  @click.stop
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isAuthenticated" class="absolute z-85 flex left-0">
    <div class="opacity-100 transition-opacity">
      <div class="absolute top-2" :style="{ insetInlineStart: '-56px' }">
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
      <div class="absolute top-2" :style="{ insetInlineStart: '-76px' }">
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
