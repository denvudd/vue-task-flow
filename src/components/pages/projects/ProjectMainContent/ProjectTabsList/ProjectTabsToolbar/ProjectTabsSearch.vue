<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

const route = useRoute()
const router = useRouter()

const isExpanded = ref(false)
const searchValue = ref('')
const inputRef = ref<HTMLElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const initializeSearch = () => {
  const taskName = route.query.taskName as string | undefined
  searchValue.value = taskName || ''
  isExpanded.value = !!taskName
}

initializeSearch()

watch(
  () => route.query.taskName,
  (newValue) => {
    const taskName = newValue as string | undefined
    if (taskName !== searchValue.value) {
      searchValue.value = taskName || ''
      isExpanded.value = !!taskName
    }
  },
)

const updateQueryParams = (value: string) => {
  const query = { ...route.query }
  if (value.trim()) {
    query.taskName = value.trim()
  } else {
    delete query.taskName
  }

  router.replace({ query })
}

const debouncedUpdate = (value: string) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    updateQueryParams(value)
  }, 300)
}

watch(searchValue, (newValue) => {
  debouncedUpdate(newValue)
})

const handleExpand = (event?: Event) => {
  event?.stopPropagation()
  isExpanded.value = true
  nextTick(() => {
    setTimeout(() => {
      const input = inputRef.value?.querySelector('input') as HTMLInputElement | null
      input?.focus()
    }, 350)
  })
}

const handleCollapse = () => {
  if (!searchValue.value.trim()) {
    isExpanded.value = false
  }
}

const handleClear = () => {
  searchValue.value = ''
  isExpanded.value = false
  updateQueryParams('')
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const component = target.closest('.search-container')
  // Don't close if clicking on the button or input
  if (component && (target.closest('button') || target.closest('input'))) {
    return
  }
  if (!component && isExpanded.value && !searchValue.value.trim()) {
    isExpanded.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  document.removeEventListener('click', handleClickOutside)
})

const hasSearchValue = computed(() => !!searchValue.value.trim())
</script>

<template>
  <div class="search-container relative flex items-center">
    <Button
      variant="ghost"
      size="icon"
      tooltip="Search"
      :class="cn(hasSearchValue && 'border-primary-500 bg-primary-50')"
      @click="handleExpand"
    >
      <Search class="size-3.5" />
      <span
        v-if="hasSearchValue"
        class="flex h-2 w-2 items-center justify-center absolute top-1.5 right-1.5 rounded-full bg-primary-500 text-xs font-medium text-white"
      />
    </Button>

    <Transition name="search-expand">
      <div v-if="isExpanded" class="search-input-wrapper">
        <div ref="inputRef" class="relative">
          <Input
            v-model="searchValue"
            placeholder="Type to search..."
            :class="
              cn(
                'px-0 py-1 text-sm border bg-transparent border-none ring-0 outline-none focus:ring-0 focus:ring-transparent focus:border-none',
              )
            "
            @blur="handleCollapse"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-input-wrapper {
  overflow: hidden;
  flex-shrink: 0;
  width: 150px;
  margin-right: 0.5rem;
}

.search-expand-enter-active {
  transition:
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-expand-leave-active {
  transition:
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-expand-enter-from {
  opacity: 0;
  width: 0;
  margin-right: 0;
  transform: translateX(-10px);
}

.search-expand-enter-to {
  opacity: 150px;
  width: 150px;
  margin-right: 0.5rem;
  transform: translateX(0);
}

.search-expand-leave-from {
  opacity: 1;
  width: 150px;
  margin-right: 0.5rem;
  transform: translateX(0);
}

.search-expand-leave-to {
  opacity: 0;
  width: 0;
  margin-right: 0;
  transform: translateX(-10px);
}

.search-button-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-button-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-button-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.search-button-enter-to {
  opacity: 1;
  transform: scale(1);
}

.search-button-leave-from {
  opacity: 1;
  transform: scale(1);
}

.search-button-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
