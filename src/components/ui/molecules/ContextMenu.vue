<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ref, onMounted, onBeforeUnmount, computed, type Component } from 'vue'

export interface ContextMenuItem {
  label: string
  value: string
  danger?: boolean
  icon?: Component
  submenu?: ContextMenuItem[]
  type?: 'item' | 'separator' | 'group'
}

interface Props {
  items: (
    | ContextMenuItem
    | { type: 'separator' }
    | { type: 'group'; label: string; items: ContextMenuItem[] }
  )[]
  class?: string
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

const isOpen = ref(false)
const position = ref({ x: 0, y: 0 })
const hoveredSubmenuIndex = ref<number | null>(null)
const submenuPosition = ref({ x: 0, y: 0 })

const openAt = (event: MouseEvent) => {
  event.preventDefault()

  const { clientX, clientY } = event
  position.value = { x: clientX, y: clientY }
  isOpen.value = true
  hoveredSubmenuIndex.value = null
}

const close = () => {
  isOpen.value = false
  hoveredSubmenuIndex.value = null
}

const handleGlobalClick = () => {
  if (!isOpen.value) return
  close()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    event.stopPropagation()
    close()
  }
}

const handleItemClick = (value: string) => {
  if (props.disabled) return
  emit('select', value)
  close()
}

const handleItemMouseEnter = (event: MouseEvent, itemIndex: number, item: ContextMenuItem) => {
  if (props.disabled) {
    hoveredSubmenuIndex.value = null
    return
  }

  if (!item.submenu || item.submenu.length === 0) {
    hoveredSubmenuIndex.value = null
    return
  }

  hoveredSubmenuIndex.value = itemIndex

  const menuElement = (event.currentTarget as HTMLElement).closest('.context-menu-content')
  if (menuElement) {
    const rect = menuElement.getBoundingClientRect()
    const itemRect = (event.currentTarget as HTMLElement).getBoundingClientRect()

    // Position submenu to the right of the item
    submenuPosition.value = {
      x: rect.right + 4,
      y: itemRect.top,
    }

    // Check if submenu would go off screen, adjust if needed
    const submenuWidth = 180
    const windowWidth = window.innerWidth
    if (submenuPosition.value.x + submenuWidth > windowWidth) {
      // Position to the left instead
      submenuPosition.value.x = rect.left - submenuWidth - 4
    }
  }
}

const handleItemMouseLeave = () => {
  // Small delay to allow moving to submenu
  setTimeout(() => {
    if (hoveredSubmenuIndex.value !== null) {
      const submenuElement = document.querySelector('.context-submenu')
      if (!submenuElement?.matches(':hover')) {
        hoveredSubmenuIndex.value = null
      }
    }
  }, 100)
}

const handleSubmenuMouseEnter = () => {
  // Keep submenu open when hovering over it
}

const handleSubmenuMouseLeave = () => {
  hoveredSubmenuIndex.value = null
}

const normalizedItems = computed(() => {
  const result: Array<{
    type: 'item' | 'separator' | 'group'
    item?: ContextMenuItem
    groupLabel?: string
    groupItems?: ContextMenuItem[]
  }> = []

  for (const item of props.items) {
    if ('type' in item) {
      if (item.type === 'separator') {
        result.push({ type: 'separator' })
      } else if (item.type === 'group') {
        const groupItem = item as { type: 'group'; label: string; items: ContextMenuItem[] }
        result.push({
          type: 'group',
          groupLabel: groupItem.label,
          groupItems: groupItem.items,
        })
      } else {
        result.push({ type: 'item', item: item as ContextMenuItem })
      }
    } else {
      result.push({ type: 'item', item: item as ContextMenuItem })
    }
  }

  return result
})

onMounted(() => {
  window.addEventListener('click', handleGlobalClick)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleGlobalClick)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="contents">
    <slot name="trigger" :onContextMenu="openAt" />

    <Teleport to="body">
      <div v-show="isOpen && !props.disabled" class="fixed inset-0 z-50" @click.stop="close">
        <Transition
          enter-active-class="transition-opacity"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isOpen"
            :class="
              cn(
                'context-menu-content absolute min-w-[180px] rounded-lg bg-white border border-neutral-200 shadow-lg py-1 text-sm',
                props.class,
              )
            "
            :style="{
              left: `${position.x}px`,
              top: `${position.y}px`,
              boxShadow: 'var(--shadow-soft-lg)',
            }"
            @click.stop
          >
            <template v-for="(normalizedItem, index) in normalizedItems" :key="index">
              <!-- Separator -->
              <div v-if="normalizedItem.type === 'separator'" class="my-1 h-px bg-neutral-200" />

              <!-- Group -->
              <template v-else-if="normalizedItem.type === 'group'">
                <div
                  v-if="normalizedItem.groupLabel"
                  class="px-2 py-1.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                >
                  {{ normalizedItem.groupLabel }}
                </div>
                <button
                  v-for="groupItem in normalizedItem.groupItems"
                  :key="groupItem.value"
                  type="button"
                  class="flex w-full items-center justify-between gap-2 text-sm px-2 py-1 text-left text-neutral-700 transition-colors hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
                  :class="groupItem.danger ? 'text-error-600 hover:bg-error-50' : ''"
                  @click="handleItemClick(groupItem.value)"
                  @mouseenter="(e) => handleItemMouseEnter(e, index, groupItem)"
                  @mouseleave="handleItemMouseLeave"
                >
                  <div class="flex items-center gap-2">
                    <component v-if="groupItem.icon" :is="groupItem.icon" class="size-4" />
                    <span>{{ groupItem.label }}</span>
                  </div>
                  <svg
                    v-if="groupItem.submenu && groupItem.submenu.length > 0"
                    class="size-4 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </template>

              <!-- Regular Item -->
              <button
                v-else-if="normalizedItem.item"
                type="button"
                class="flex w-full items-center justify-between gap-2 text-sm px-2 py-1 text-left text-neutral-700 transition-colors hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
                :class="normalizedItem.item.danger ? 'text-error-600 hover:bg-error-50' : ''"
                @click="
                  normalizedItem.item.submenu
                    ? undefined
                    : handleItemClick(normalizedItem.item.value)
                "
                @mouseenter="(e) => handleItemMouseEnter(e, index, normalizedItem.item!)"
                @mouseleave="handleItemMouseLeave"
              >
                <div class="flex items-center gap-2">
                  <component
                    v-if="normalizedItem.item.icon"
                    :is="normalizedItem.item.icon"
                    class="size-4"
                  />
                  <span>{{ normalizedItem.item.label }}</span>
                </div>
                <svg
                  v-if="normalizedItem.item.submenu && normalizedItem.item.submenu.length > 0"
                  class="size-4 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </template>

            <div v-if="$slots.footer" class="border-t border-neutral-200 mt-1 pt-0.5 px-2">
              <slot name="footer" />
            </div>
          </div>
        </Transition>

        <!-- Submenu -->
        <Transition
          enter-active-class="transition-opacity"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="hoveredSubmenuIndex !== null"
            class="context-submenu absolute min-w-[180px] rounded-lg bg-white border border-neutral-200 shadow-lg py-1 text-sm z-60"
            :style="{
              left: `${submenuPosition.x}px`,
              top: `${submenuPosition.y}px`,
              boxShadow: 'var(--shadow-soft-lg)',
            }"
            @mouseenter="handleSubmenuMouseEnter"
            @mouseleave="handleSubmenuMouseLeave"
            @click.stop
          >
            <button
              v-for="subItem in normalizedItems[hoveredSubmenuIndex]?.item?.submenu || []"
              :key="subItem.value"
              type="button"
              class="flex w-full items-center gap-2 text-sm px-2 py-1 text-left text-neutral-700 transition-colors hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
              :class="subItem.danger ? 'text-error-600 hover:bg-error-50' : ''"
              @click="handleItemClick(subItem.value)"
            >
              <component v-if="subItem.icon" :is="subItem.icon" class="size-4" />
              <span>{{ subItem.label }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>
