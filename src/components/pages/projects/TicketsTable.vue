<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Button,
  Editable,
  FieldSelect,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
} from '@/components/ui'
import type { Tables } from '@/types/supabase'
import type { SelectItem } from '@/components/ui'
import { Calendar, Edit2 } from 'lucide-vue-next'

interface Props {
  tickets: Tables<'tickets'>[] | null | undefined
  isLoading: boolean
  statusOptions: SelectItem[]
  priorityOptions: SelectItem[]
  typeOptions: SelectItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:title', payload: { ticket: Tables<'tickets'>; value: string }): void
  (
    e: 'update:status',
    payload: { ticket: Tables<'tickets'>; details: { items: SelectItem[]; value: string[] } },
  ): void
  (
    e: 'update:priority',
    payload: { ticket: Tables<'tickets'>; details: { items: SelectItem[]; value: string[] } },
  ): void
  (
    e: 'update:type',
    payload: { ticket: Tables<'tickets'>; details: { items: SelectItem[]; value: string[] } },
  ): void
  (e: 'edit', ticket: Tables<'tickets'>): void
}>()

const hoveredRowId = ref<string | null>(null)

const hasTickets = computed(() => (props.tickets?.length ?? 0) > 0)

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="text-neutral-600">Loading tickets...</div>
    </div>

    <div v-else-if="!hasTickets" class="py-16 text-center">
      <p class="text-neutral-600">No tickets yet. Create your first ticket!</p>
    </div>

    <div v-else>
      <Table density="comfortable">
        <TableHeader>
          <TableRow :hover="false">
            <TableHeadCell>Title</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Priority</TableHeadCell>
            <TableHeadCell>Type</TableHeadCell>
            <TableHeadCell>Due Date</TableHeadCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="ticket in tickets"
            :key="ticket.id"
            class="group"
            @mouseenter="hoveredRowId = ticket.id"
            @mouseleave="hoveredRowId = null"
          >
            <TableCell class="relative">
              <Editable
                :value="ticket.title"
                :placeholder="`Enter title (current: ${ticket.title || 'empty'})`"
                @value-commit="(e) => emit('update:title', { ticket, value: e.value })"
              />
            </TableCell>
            <TableCell>
              <FieldSelect
                :items="statusOptions"
                :value="ticket.status ? [ticket.status] : []"
                @on-value-change="
                  (details: { items: SelectItem[]; value: string[] }) =>
                    emit('update:status', { ticket, details })
                "
                class="min-w-[120px]"
              />
            </TableCell>
            <TableCell>
              <FieldSelect
                :items="priorityOptions"
                :value="ticket.priority ? [ticket.priority] : []"
                @on-value-change="
                  (details: { items: SelectItem[]; value: string[] }) =>
                    emit('update:priority', { ticket, details })
                "
                class="min-w-[120px]"
              />
            </TableCell>
            <TableCell>
              <FieldSelect
                :items="typeOptions"
                :value="ticket.type ? [ticket.type] : []"
                @on-value-change="
                  (details: { items: SelectItem[]; value: string[] }) =>
                    emit('update:type', { ticket, details })
                "
                class="min-w-[120px]"
              />
            </TableCell>
            <TableCell class="relative">
              <div class="flex items-center gap-1">
                <Calendar class="w-4 h-4" />
                {{ formatDate(ticket.due_date) }}
              </div>

              <Button
                v-if="hoveredRowId === ticket.id"
                variant="ghost"
                size="sm"
                class="opacity-0 group-hover:opacity-100 h-8 transition-opacity absolute top-1/2 -translate-y-1/2 right-4"
                @click="emit('edit', ticket)"
              >
                <Edit2 class="size-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

