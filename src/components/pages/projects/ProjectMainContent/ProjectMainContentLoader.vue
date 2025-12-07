<script setup lang="ts">
import {
  Skeleton,
  Card,
  Table,
  TableHeader,
  TableRow,
  TableHeadCell,
  TableBody,
  TableCell,
} from '@/components/ui'
</script>

<template>
  <div class="space-y-6 px-24">
    <div>
      <div class="space-y-6">
        <div class="flex flex-col">
          <div class="space-y-2 w-full">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3 w-full">
                <Skeleton class="w-1/2 h-9 shrink-0" />
                <Skeleton class="w-14 h-7" />
              </div>

              <div class="flex items-center gap-2">
                <Skeleton class="w-[101px] h-7" />
                <Skeleton class="w-[80px] h-7" />
              </div>
            </div>
            <Skeleton class="w-11/12 h-5" />
            <Skeleton class="w-10/12 h-5" />
            <Skeleton class="w-11/12 h-5" />
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-neutral-900">Tickets</h2>
          <Skeleton class="w-16 h-7" />
        </div>

        <div
          class="inline-flex items-center gap-1 border-b border-neutral-200 relative w-full"
        >
          <div class="px-4 py-2">
            <Skeleton class="w-10 h-4" />
          </div>
          <div class="px-4 py-2">
            <Skeleton class="w-10 h-4" />
          </div>
        </div>

        <div class="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeadCell>
                  <Skeleton class="w-10/12 h-4" />
                </TableHeadCell>
                <TableHeadCell>
                  <Skeleton class="w-9/12 h-4" />
                </TableHeadCell>
                <TableHeadCell>
                  <Skeleton class="w-8/12 h-4" />
                </TableHeadCell>
                <TableHeadCell>
                  <Skeleton class="w-10/12 h-4" />
                </TableHeadCell>
                <TableHeadCell>
                  <Skeleton class="w-10/12 h-4" />
                </TableHeadCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="i in 10" :key="i">
                <TableCell>
                  <Skeleton class="w-full h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton class="w-full h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton class="w-full h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton class="w-full h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton class="w-full h-4" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </div>
</template>
