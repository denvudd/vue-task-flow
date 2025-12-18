<script setup lang="ts">
interface Audience {
  icon: string
  title: string
  description: string
}

const audiences: Audience[] = [
  {
    icon: '👥',
    title: 'Невеликі та середні команди',
    description: 'Ідеально підходить для команд від 3 до 50 осіб',
  },
  {
    icon: '🚀',
    title: 'Стартапи',
    description: 'Швидкий старт без складного налаштування',
  },
  {
    icon: '💼',
    title: 'Фрілансери',
    description: 'Керуйте всіма проєктами в одному місці',
  },
  {
    icon: '🏢',
    title: 'Внутрішні команди компаній',
    description: 'Координація роботи відділів та департаментів',
  },
]
</script>

<template>
  <section class="bg-neutral-50 py-20 md:py-32">
    <div class="container mx-auto px-4">
      <!-- Section header -->
      <div class="mb-16 text-center">
        <h2 class="mb-4 text-3xl font-bold text-primary-900 md:text-5xl">
          🎯 Для кого TaskFlow
        </h2>
        <p class="mx-auto max-w-2xl text-lg text-primary-600">
          TaskFlow створений для команд, які цінують простоту, швидкість та прозорість
        </p>
      </div>

      <!-- Audience grid -->
      <div class="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <div
          v-for="audience in audiences"
          :key="audience.title"
          class="group flex gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft transition-all duration-300 hover:border-accent-300 hover:shadow-soft-lg"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 text-3xl transition-transform duration-300 group-hover:scale-110">
              {{ audience.icon }}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 class="mb-2 text-xl font-bold text-primary-900">
              {{ audience.title }}
            </h3>
            <p class="text-primary-600">
              {{ audience.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

