<template>
  <div class="relative">
    <div class="space-y-4">
      <div v-for="i in 3" :key="i" class="flex gap-2 animate-pulse">
        <div class="w-6 h-6 rounded-full bg-neutral-200"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-neutral-200 rounded w-1/4"></div>
          <div class="h-20 bg-neutral-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
</template>

