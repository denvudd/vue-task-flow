<script setup lang="ts">
import { Skeleton } from '@/components/ui'
import { CircleChevronDown, Flag, Loader } from 'lucide-vue-next'
</script>

<template>
  <Skeleton class="w-1/3 h-12" />

  <div class="space-y-6 mt-2.5">
    <div class="flex items-center gap-4">
      <div class="flex flex-col gap-1 items-start">
        <div class="flex items-center gap-1 text-sm font-medium text-neutral-700">
          <Loader class="size-3.5" />
          Status
        </div>
        <Skeleton class="w-[180px] h-5" />
      </div>

      <div class="flex flex-col gap-1 items-start">
        <div class="flex items-center gap-1 text-sm font-medium text-neutral-700">
          <CircleChevronDown class="size-3.5" />
          Priority
        </div>
        <Skeleton class="w-[180px] h-5" />
      </div>

      <div class="flex flex-col gap-1 items-start">
        <div class="flex items-center gap-1 text-sm font-medium text-neutral-700">
          <Flag class="size-3.5" />
          Type
        </div>
        <Skeleton class="w-[180px] h-5" />
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <Skeleton class="w-1/2 h-8 mb-2" />
      <Skeleton class="w-11/12 h-5" />
      <Skeleton class="w-10/12 h-5" />
      <Skeleton class="w-11/12 h-5" />
      <Skeleton class="w-full h-[280px]" />
      <Skeleton class="w-11/12 h-8 my-2" />
      <Skeleton class="w-10/12 h-5" />
      <Skeleton class="w-10/12 h-5" />
      <Skeleton class="w-11/12 h-5" />
      <Skeleton class="w-10/12 h-5" />
    </div>
  </div>
</template>
