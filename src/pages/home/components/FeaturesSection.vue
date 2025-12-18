<script setup lang="ts">
import AnimatedContent from './animations/AnimatedContent.vue'

interface Feature {
  icon: string
  title: string
  description: string
  highlights: string[]
}

const features: Feature[] = [
  {
    icon: '📁',
    title: 'Керування проєктами',
    description: 'Повний контроль над вашими проєктами',
    highlights: [
      'Створення та редагування проєктів',
      "Прив'язка задач до конкретних проєктів",
      'Гнучка структура для масштабування під команди будь-якого розміру',
    ],
  },
  {
    icon: '✅',
    title: 'Управління задачами',
    description: 'Ефективна робота з задачами',
    highlights: [
      'Додавання, редагування та видалення задач',
      'Підтримка статусів задач (To Do / In Progress / Done або кастомних)',
      'Зміна статусу задачі без перезавантаження сторінки',
      'Оптимістичні оновлення для миттєвого UI-відгуку',
    ],
  },
  {
    icon: '🔄',
    title: 'Оновлення в реальному часі',
    description: 'Завжди актуальна інформація',
    highlights: [
      'Синхронізація статусів задач між користувачами',
      'Миттєве відображення змін без ручного оновлення сторінки',
      'Актуальний стан проєкту для всієї команди',
    ],
  },
  {
    icon: '💬',
    title: 'Коментарі до задач',
    description: 'Контекстна комунікація',
    highlights: [
      'Додавання коментарів безпосередньо до задач',
      'Збереження історії обговорень',
      'Контекстна комунікація всередині задачі',
    ],
  },
  {
    icon: '🔍',
    title: 'Фільтрація та пошук',
    description: 'Швидкий доступ до потрібної інформації',
    highlights: [
      'Фільтрація задач за статусом, виконавцем, датами, пріоритетом',
      'Швидкий пошук по назві або опису задач',
    ],
  },
  {
    icon: '📱',
    title: 'Адаптивний інтерфейс',
    description: 'Працюйте з будь-якого пристрою',
    highlights: [
      'Повна підтримка мобільних, планшетів та десктопів',
      'Зручна навігація на малих екранах',
      'Оптимізований UX для touch-пристроїв',
    ],
  },
]
</script>

<template>
  <section class="bg-white py-20 md:py-32">
    <div class="container mx-auto px-4">
      <!-- Section header -->
      <div class="mb-16 text-center">
        <h2 class="mb-4 text-3xl font-bold text-primary-900 md:text-5xl">🔹 Основні можливості</h2>
        <p class="mx-auto max-w-2xl text-lg text-primary-600">
          Все необхідне для ефективного керування проєктами та задачами
        </p>
      </div>

      <!-- Features grid -->
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <AnimatedContent
          v-for="feature in features"
          :distance="100"
          direction="vertical"
          :reverse="false"
          :duration="0.8"
          ease="power3.out"
          :initial-opacity="0"
          :animate-opacity="true"
          :scale="1"
          :threshold="0.1"
          :delay="0"
          :key="feature.title"
          class="group rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-lg"
        >
          <!-- Icon -->
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 text-4xl transition-transform duration-300 group-hover:scale-110"
          >
            {{ feature.icon }}
          </div>

          <!-- Title -->
          <h3 class="mb-2 text-xl font-bold text-primary-900">
            {{ feature.title }}
          </h3>

          <!-- Description -->
          <p class="mb-4 text-primary-600">
            {{ feature.description }}
          </p>

          <!-- Highlights -->
          <ul class="space-y-2">
            <li
              v-for="highlight in feature.highlights"
              :key="highlight"
              class="flex items-start gap-2 text-sm text-primary-700"
            >
              <span class="mt-1 text-accent-600">▸</span>
              <span>{{ highlight }}</span>
            </li>
          </ul>
        </AnimatedContent>
      </div>
    </div>
  </section>
</template>
