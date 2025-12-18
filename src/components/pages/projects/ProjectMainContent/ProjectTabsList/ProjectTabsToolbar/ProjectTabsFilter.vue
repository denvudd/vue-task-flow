<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import {
  Popover,
  Field,
  FieldInput,
  TicketStatusMultiSelect,
  TicketPriorityMultiSelect,
  TicketTypeMultiSelect,
  Button,
} from '@/components/ui'
import { ListFilter, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { TicketStatus, TicketPriority, TicketType } from '@/constants/tickets'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const isOpen = ref(false)
const searchQuery = ref('')

const filters = ref({
  status: [] as TicketStatus[],
  priority: [] as TicketPriority[],
  type: [] as TicketType[],
  taskName: '' as string,
  dueDate: '' as string,
})

const parseArrayParam = (
  param: LocationQueryValue | LocationQueryValue[] | undefined,
): string[] => {
  if (!param || param === null) return []

  if (Array.isArray(param)) {
    return param.filter((p): p is string => p !== null && typeof p === 'string')
  }

  if (typeof param === 'string') return [param]

  return []
}

const initializeFilters = () => {
  const query = route.query
  filters.value = {
    status: parseArrayParam(query.status) as TicketStatus[],
    priority: parseArrayParam(query.priority) as TicketPriority[],
    type: parseArrayParam(query.type) as TicketType[],
    taskName: (query.taskName as string) || '',
    dueDate: (query.dueDate as string) || '',
  }
}

initializeFilters()

watch(
  () => route.query,
  () => {
    initializeFilters()
  },
  { deep: true },
)

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.status.length > 0 ||
    filters.value.priority.length > 0 ||
    filters.value.type.length > 0 ||
    filters.value.taskName ||
    filters.value.dueDate
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status.length > 0) count++
  if (filters.value.priority.length > 0) count++
  if (filters.value.type.length > 0) count++
  if (filters.value.taskName) count++
  if (filters.value.dueDate) count++
  return count
})

const updateQueryParams = () => {
  const query = { ...route.query }
  if (filters.value.status.length > 0) {
    query.status = filters.value.status
  } else {
    delete query.status
  }

  if (filters.value.priority.length > 0) {
    query.priority = filters.value.priority
  } else {
    delete query.priority
  }

  if (filters.value.type.length > 0) {
    query.type = filters.value.type
  } else {
    delete query.type
  }

  if (filters.value.taskName) {
    query.taskName = filters.value.taskName
  } else {
    delete query.taskName
  }

  if (filters.value.dueDate) {
    query.dueDate = filters.value.dueDate
  } else {
    delete query.dueDate
  }

  router.replace({ query })
}

const clearFilters = () => {
  filters.value = {
    status: [],
    priority: [],
    type: [],
    taskName: '',
    dueDate: '',
  }
  updateQueryParams()
}

const clearStatus = () => {
  filters.value.status = []
  updateQueryParams()
}

const clearPriority = () => {
  filters.value.priority = []
  updateQueryParams()
}

const clearType = () => {
  filters.value.type = []
  updateQueryParams()
}

const clearTaskName = () => {
  filters.value.taskName = ''
  updateQueryParams()
}

const clearDueDate = () => {
  filters.value.dueDate = ''
  updateQueryParams()
}

watch(
  () => filters.value,
  () => {
    updateQueryParams()
  },
  { deep: true },
)

const filterSections = computed(() => [
  { key: 'status', label: t('projectFilter.labels.status') },
  { key: 'priority', label: t('projectFilter.labels.priority') },
  { key: 'type', label: t('projectFilter.labels.type') },
  { key: 'taskName', label: t('projectFilter.labels.taskName') },
  { key: 'dueDate', label: t('projectFilter.labels.dueDate') },
])

const visibleSections = computed(() => {
  if (!searchQuery.value.trim()) {
    return filterSections.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return filterSections.value.filter((section) => section.label.toLowerCase().includes(query))
})

const shouldShowSection = (key: string) => {
  return visibleSections.value.some((section) => section.key === key)
}

watch(isOpen, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
  }
})
</script>

<template>
  <Popover
    v-model:open="isOpen"
    :positioning="{
      placement: 'bottom',
      offset: { mainAxis: 8 },
    }"
  >
    <template #trigger>
      <Button
        variant="ghost"
        size="icon"
        :tooltip="t('projectFilter.tooltip')"
        :class="cn(hasActiveFilters && 'border-primary-500 bg-primary-50 relative')"
      >
        <ListFilter class="size-3.5" />
        <Transition
          v-if="activeFiltersCount > 0"
          enter-active-class="transition-opacity"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <span
            class="flex h-2 w-2 items-center justify-center absolute top-1.5 right-1.5 rounded-full bg-primary-500 text-xs font-medium text-white"
          />
        </Transition>
      </Button>
    </template>

    <div class="space-y-2">
      <Field>
        <div class="relative">
          <FieldInput
            v-model="searchQuery"
            :placeholder="t('projectFilter.searchPlaceholder')"
            inputClass="px-1.5! py-[3px]"
          />
        </div>
      </Field>

      <Field v-if="shouldShowSection('status')">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-neutral-700 mb-1">{{ t('projectFilter.labels.status') }}</label>
          <Button v-if="filters.status.length > 0" variant="ghost" size="icon" @click="clearStatus">
            <X class="w-3 h-3" />
          </Button>
        </div>
        <TicketStatusMultiSelect
          :value="filters.status"
          @update:value="(val) => (filters.status = val)"
        />
      </Field>

      <Field v-if="shouldShowSection('priority')">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-neutral-700 mb-1">{{ t('projectFilter.labels.priority') }}</label>
          <Button
            v-if="filters.priority.length > 0"
            variant="ghost"
            size="icon"
            class="h-6 px-2 text-xs"
            @click="clearPriority"
          >
            <X class="w-3 h-3" />
          </Button>
        </div>
        <TicketPriorityMultiSelect
          :value="filters.priority"
          @update:value="(val) => (filters.priority = val)"
        />
      </Field>

      <Field v-if="shouldShowSection('type')">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-neutral-700 mb-1">{{ t('projectFilter.labels.type') }}</label>
          <Button
            v-if="filters.type.length > 0"
            variant="ghost"
            size="icon"
            class="h-6 px-2 text-xs"
            @click="clearType"
          >
            <X class="w-3 h-3" />
          </Button>
        </div>
        <TicketTypeMultiSelect
          :value="filters.type"
          @update:value="(val) => (filters.type = val)"
        />
      </Field>

      <Field v-if="shouldShowSection('taskName')">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-neutral-700 mb-1">{{ t('projectFilter.labels.taskName') }}</label>
          <Button
            v-if="filters.taskName"
            variant="ghost"
            size="icon"
            class="h-6 px-2 text-xs"
            @click="clearTaskName"
          >
            <X class="w-3 h-3" />
          </Button>
        </div>
        <FieldInput
          v-model="filters.taskName"
          :placeholder="t('projectFilter.placeholders.taskName')"
          inputClass="px-1.5! py-[3px]"
        />
      </Field>

      <Field v-if="shouldShowSection('dueDate')">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-medium text-neutral-700 mb-1">{{ t('projectFilter.labels.dueDate') }}</label>
          <Button
            v-if="filters.dueDate"
            variant="ghost"
            size="icon"
            class="h-6 px-2 text-xs"
            @click="clearDueDate"
          >
            <X class="w-3 h-3" />
          </Button>
        </div>
        <FieldInput
          v-model="filters.dueDate"
          type="date"
          :placeholder="t('projectFilter.placeholders.dueDate')"
          inputClass="px-1.5! py-[3px]"
        />
      </Field>

      <div
        v-if="searchQuery.trim() && visibleSections.length === 0"
        class="py-8 text-center text-sm text-neutral-500"
      >
        {{ t('projectFilter.noResults', { query: searchQuery }) }}
      </div>
    </div>

    <template #footer v-if="hasActiveFilters">
      <div class="flex justify-between items-center w-full">
        <Button v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearFilters">
          <X class="w-3 h-3 mr-1" />
          {{ t('projectFilter.clearAll') }}
        </Button>
        <div v-else></div>
      </div>
    </template>
  </Popover>
</template>
