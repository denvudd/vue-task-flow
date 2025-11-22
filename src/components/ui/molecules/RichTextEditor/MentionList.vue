<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Avatar } from '../../atoms'

interface MentionItem {
  id: string
  label: string
  avatar?: string | null
}

interface Props {
  items: MentionItem[]
  command: (item: MentionItem) => void
}

const props = defineProps<Props>()

const selectedIndex = ref(0)

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  },
)

const selectItem = (index: number) => {
  const item = props.items[index]
  if (item) {
    props.command({ id: item.id, label: item.label })
  }
}

const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
}

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

const enterHandler = () => {
  selectItem(selectedIndex.value)
}

const onKeyDown = ({ event }: { event: KeyboardEvent }): boolean => {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    downHandler()
    return true
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    enterHandler()
    return true
  }

  return false
}

defineExpose({
  onKeyDown,
})
</script>

<template>
  <div class="mention-list">
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        :class="['mention-list-item', { 'is-selected': index === selectedIndex }]"
        @click="selectItem(index)"
        type="button"
      >
        <Avatar :src="item.avatar" :name="item.label" />
        <span class="mention-list-label">{{ item.label }}</span>
      </button>
    </template>
    <div v-else class="mention-list-empty">No users found</div>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

.mention-list {
  @apply bg-white rounded-lg shadow-lg border border-neutral-200;
  @apply px-0;
  max-height: 280px;
  overflow-y: auto;
  min-width: 200px;
}

.mention-list-item {
  @apply flex items-center gap-2 w-full px-2 py-1;
  @apply text-left text-sm font-medium;
  @apply hover:bg-neutral-100 transition-colors;
  @apply cursor-pointer;
  border: none;
  background: transparent;
}

.mention-list-item.is-selected {
  @apply bg-primary-50 text-primary-700;
}

.mention-list-avatar {
  @apply w-6 h-6 rounded-full bg-neutral-200;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.mention-list-avatar-placeholder {
  @apply w-8 h-8 rounded-full bg-primary-500 text-white;
  @apply flex items-center justify-center font-medium text-sm;
  flex-shrink: 0;
}

.mention-list-label {
  @apply flex-1 truncate;
}

.mention-list-empty {
  @apply px-3 py-2 text-sm text-neutral-500 text-center;
}
</style>
