<script setup lang="ts">
interface Value {
  icon: string
  title: string
  description: string
}

const values: Value[] = [
  {
    icon: '🎯',
    title: 'Менше контекстних перемикань',
    description: 'Вся інформація про задачі та проєкти в одному місці',
  },
  {
    icon: '👁️',
    title: 'Прозорий стан задач',
    description: 'Завжди знайте, що відбувається в проєкті',
  },
  {
    icon: '⚡',
    title: 'Швидка взаємодія',
    description: 'Real-time оновлення без затримок',
  },
  {
    icon: '✨',
    title: 'Простий інтерфейс',
    description: 'Зрозумілий UI без перевантаження',
  },
]
</script>

<template>
  <section class="bg-gradient-to-br from-primary-900 to-primary-800 py-20 text-white md:py-32">
    <div class="container mx-auto px-4">
      <!-- Section header -->
      <div class="mb-16 text-center">
        <h2 class="mb-4 text-3xl font-bold md:text-5xl">
          Цінність продукту
        </h2>
        <p class="mx-auto max-w-2xl text-lg text-primary-100">
          TaskFlow створений для того, щоб зробити вашу роботу простішою та ефективнішою
        </p>
      </div>

      <!-- Values grid -->
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="value in values"
          :key="value.title"
          class="group text-center"
        >
          <!-- Icon -->
          <div class="mb-4 flex justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-5xl backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
              {{ value.icon }}
            </div>
          </div>

          <!-- Title -->
          <h3 class="mb-2 text-xl font-bold">
            {{ value.title }}
          </h3>

          <!-- Description -->
          <p class="text-primary-200">
            {{ value.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

