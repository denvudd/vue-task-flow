<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Select, createListCollection } from '@ark-ui/vue/select'
import { Popover, Field, FieldInput, FieldSelect, Button } from '@/components/ui'
import { ChevronDownIcon, CheckIcon } from 'lucide-vue-next'
import {
  ArrowUpDown,
  X,
  ArrowUp,
  ArrowDown,
  Plus,
  GripVertical,
  CaseSensitive,
  Loader,
  CircleChevronDown,
  Flag,
  Calendar,
  Clock,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const route = useRoute()
const router = useRouter()

const isOpen = ref(false)

type SortField = 'title' | 'status' | 'priority' | 'type' | 'due_date' | 'created_at' | 'updated_at'

type SortOrder = 'asc' | 'desc'

interface SortRule {
  id: string
  field: SortField | ''
  order: SortOrder
}

const sortOptions = [
  { key: 'title', label: 'Task Name', icon: CaseSensitive },
  { key: 'status', label: 'Status', icon: Loader },
  { key: 'priority', label: 'Priority', icon: CircleChevronDown },
  { key: 'type', label: 'Type', icon: Flag },
  { key: 'due_date', label: 'Due Date', icon: Calendar },
  { key: 'created_at', label: 'Created At', icon: Clock },
  { key: 'updated_at', label: 'Updated At', icon: Clock },
]

const sortOrderOptions = [
  { label: 'Ascending', value: 'asc', icon: ArrowUp },
  { label: 'Descending', value: 'desc', icon: ArrowDown },
]

const sortRules = ref<SortRule[]>([])

let nextId = 0

const initializeSort = () => {
  const query = route.query
  const sortByParam = query.sortBy
  const sortOrderParam = query.sortOrder

  if (sortByParam && sortOrderParam) {
    const fields = Array.isArray(sortByParam) ? sortByParam : [sortByParam]
    const orders = Array.isArray(sortOrderParam) ? sortOrderParam : [sortOrderParam]

    sortRules.value = fields
      .map((field, index) => ({
        id: `rule-${nextId++}`,
        field: field as SortField,
        order: (orders[index] || 'asc') as SortOrder,
      }))
      .filter((rule) => rule.field && sortOptions.some((opt) => opt.key === rule.field))
  } else {
    sortRules.value = []
  }
}

initializeSort()

watch(
  () => route.query,
  () => {
    initializeSort()
  },
  { deep: true },
)

const hasActiveSort = computed(() => {
  return sortRules.value.length > 0 && sortRules.value.some((rule) => rule.field)
})

const updateQueryParams = () => {
  const query = { ...route.query }
  const activeRules = sortRules.value.filter((rule) => rule.field)

  if (activeRules.length > 0) {
    query.sortBy = activeRules.map((rule) => rule.field)
    query.sortOrder = activeRules.map((rule) => rule.order)
  } else {
    delete query.sortBy
    delete query.sortOrder
  }

  router.replace({ query })
}

const clearSort = () => {
  sortRules.value = []
  updateQueryParams()
}

const addSortRule = () => {
  sortRules.value.push({
    id: `rule-${nextId++}`,
    field: '',
    order: 'asc',
  })
}

const removeSortRule = (id: string) => {
  const index = sortRules.value.findIndex((rule) => rule.id === id)
  if (index !== -1) {
    sortRules.value.splice(index, 1)
    updateQueryParams()
  }
}

const updateSortRule = (id: string, updates: Partial<SortRule>) => {
  const rule = sortRules.value.find((r) => r.id === id)
  if (rule) {
    Object.assign(rule, updates)
    updateQueryParams()
  }
}

watch(
  () => sortRules.value,
  () => {
    updateQueryParams()
  },
  { deep: true },
)

const sortOrderSelectItems = computed(() => {
  return sortOrderOptions.map((option) => ({
    label: option.label,
    value: option.value,
  }))
})

const sortOrderCollection = computed(() => {
  return createListCollection({
    items: sortOrderOptions.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  })
})

const getOrderIcon = (order: SortOrder) => {
  const option = sortOrderOptions.find((opt) => opt.value === order)
  return option?.icon || null
}

const getOrderLabel = (order: SortOrder) => {
  const option = sortOrderOptions.find((opt) => opt.value === order)
  return option?.label || ''
}

const getAvailableFields = (currentRuleId: string) => {
  const usedFields = sortRules.value
    .filter((rule) => rule.id !== currentRuleId && rule.field)
    .map((rule) => rule.field)

  return sortOptions.filter((option) => !usedFields.includes(option.key as SortField))
}

const getFieldIcon = (field: SortField | '') => {
  if (!field) return null
  const option = sortOptions.find((opt) => opt.key === field)
  return option?.icon || null
}

const getSelectedFieldLabel = (field: SortField | '') => {
  if (!field) return ''
  const option = sortOptions.find((opt) => opt.key === field)
  return option?.label || ''
}
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
        tooltip="Sort"
        :class="cn(hasActiveSort && 'border-primary-500 bg-primary-50 relative')"
      >
        <ArrowUpDown class="size-3.5" />
        <Transition
          v-if="hasActiveSort"
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
        <TransitionGroup
          v-if="sortRules.length > 0"
          name="sort-rules"
          class="space-y-3"
          tag="div"
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
          move-class="transition-transform duration-200 ease-out"
        >
          <div
            v-for="(rule, index) in sortRules"
            :key="rule.id"
            class="flex items-center gap-2 p-2 min-w-2xs border border-neutral-200 rounded-lg bg-neutral-50"
          >
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                <component
                  v-if="getFieldIcon(rule.field)"
                  :is="getFieldIcon(rule.field)"
                  class="size-3.5"
                />
                <span>Sort {{ index + 1 }}</span>
              </div>
              <Field>
                <div class="relative">
                  <Select.Root
                    :collection="
                      createListCollection({
                        items: getAvailableFields(rule.id).map((option) => ({
                          label: option.label,
                          value: option.key,
                        })),
                      })
                    "
                    :value="rule.field ? [rule.field] : []"
                    @value-change="
                      (details) =>
                        updateSortRule(rule.id, {
                          field: (details.value[0] as SortField) || '',
                        })
                    "
                  >
                    <Select.Trigger
                      class="w-full text-xs transition-colors focus:outline-none flex items-center justify-between gap-2 border border-neutral-200 rounded-md px-2 py-1"
                    >
                      <Select.ValueText placeholder="Select field...">
                        <div v-if="rule.field" class="flex items-center gap-1.5">
                          <component
                            :is="getFieldIcon(rule.field)"
                            v-if="getFieldIcon(rule.field)"
                            class="size-3.5"
                          />
                          <span>{{ getSelectedFieldLabel(rule.field) }}</span>
                        </div>
                        <span v-else class="text-neutral-400">Select field...</span>
                      </Select.ValueText>
                      <Select.Indicator>
                        <ChevronDownIcon class="size-4" />
                      </Select.Indicator>
                    </Select.Trigger>

                    <Teleport to="body">
                      <Select.Positioner>
                        <Select.Content
                          class="z-50 rounded-lg border border-neutral-300 bg-white shadow-lg overflow-hidden min-w-fit"
                        >
                          <Select.ItemGroup>
                            <Select.Item
                              v-for="option in getAvailableFields(rule.id)"
                              :key="option.key"
                              :item="{ label: option.label, value: option.key }"
                            >
                              <Select.ItemText class="text-xs flex items-center gap-1.5">
                                <component :is="option.icon" class="size-3.5" />
                                <span>{{ option.label }}</span>
                              </Select.ItemText>
                              <Select.ItemIndicator class="text-primary-600">
                                <CheckIcon class="size-4" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          </Select.ItemGroup>
                        </Select.Content>
                      </Select.Positioner>
                    </Teleport>

                    <Select.HiddenSelect />
                  </Select.Root>
                </div>
              </Field>
              <Field v-if="rule.field">
                <div class="relative">
                  <Select.Root
                    :collection="sortOrderCollection"
                    :value="[rule.order]"
                    @value-change="
                      (details) =>
                        updateSortRule(rule.id, {
                          order: (details.value[0] as SortOrder) || 'asc',
                        })
                    "
                  >
                    <Select.Trigger
                      class="w-full text-xs transition-colors focus:outline-none flex items-center justify-between gap-2 border border-neutral-200 rounded-md px-2 py-1"
                    >
                      <Select.ValueText placeholder="Select order...">
                        <div class="flex items-center gap-1.5">
                          <component
                            :is="getOrderIcon(rule.order)"
                            v-if="getOrderIcon(rule.order)"
                            class="size-3.5"
                          />
                          <span>{{ getOrderLabel(rule.order) }}</span>
                        </div>
                      </Select.ValueText>
                      <Select.Indicator>
                        <ChevronDownIcon class="size-4" />
                      </Select.Indicator>
                    </Select.Trigger>

                    <Teleport to="body">
                      <Select.Positioner>
                        <Select.Content
                          class="z-50 rounded-lg border border-neutral-300 bg-white shadow-lg overflow-hidden min-w-fit"
                        >
                          <Select.ItemGroup>
                            <Select.Item
                              v-for="option in sortOrderOptions"
                              :key="option.value"
                              :item="{ label: option.label, value: option.value }"
                            >
                              <Select.ItemText class="text-xs flex items-center gap-1.5">
                                <component :is="option.icon" class="size-3.5" />
                                <span>{{ option.label }}</span>
                              </Select.ItemText>
                              <Select.ItemIndicator class="text-primary-600">
                                <CheckIcon class="size-4" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          </Select.ItemGroup>
                        </Select.Content>
                      </Select.Positioner>
                    </Teleport>

                    <Select.HiddenSelect />
                  </Select.Root>
                </div>
              </Field>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="mt-6 h-8 w-8"
              @click="removeSortRule(rule.id)"
            >
              <X class="w-3 h-3" />
            </Button>
          </div>
        </TransitionGroup>
      <div v-else>
        <div class="flex flex-col items-center text-center gap-2 px-2 py-1">
          <p class="text-sm text-neutral-500">No sort rules added</p>
          <Button variant="ghost" size="sm" @click="addSortRule">
            <Plus class="w-4 h-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </div>
    </div>

    <template #footer v-if="!!sortRules.length">
      <div class="flex justify-between items-center w-full">
        <Button v-if="hasActiveSort" variant="ghost" size="sm" @click="clearSort">
          Clear All
        </Button>
        <Button
          v-if="sortRules.length < sortOptions.length"
          variant="ghost"
          size="sm"
          @click="addSortRule"
        >
          <Plus class="w-4 h-4 mr-1" />
          Add Rule
        </Button>
      </div>
    </template>
  </Popover>
</template>
