<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

const router = useRouter()

const currentYear = new Date().getFullYear()

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <footer class="border-t border-neutral-200 bg-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid gap-8 md:grid-cols-4">
        <!-- Logo and description -->
        <div class="md:col-span-2">
          <div class="mb-4 flex items-center gap-2">
            <img src="/images/logo-icon.png" alt="TaskFlow" class="h-8 w-8" />
            <span class="text-xl font-bold text-primary-900">TaskFlow</span>
          </div>
          <p class="mb-4 text-primary-600">
            Real-time система керування задачами та проєктами для швидкої, прозорої та командної роботи.
          </p>
        </div>

        <!-- Quick links -->
        <div>
          <h3 class="mb-4 font-bold text-primary-900">Швидкі посилання</h3>
          <ul class="space-y-2">
            <li>
              <button
                class="text-primary-600 transition-colors hover:text-accent-600"
                @click="navigateTo(ROUTES.Login)"
              >
                Увійти
              </button>
            </li>
            <li>
              <button
                class="text-primary-600 transition-colors hover:text-accent-600"
                @click="navigateTo(ROUTES.SignUp)"
              >
                Зареєструватися
              </button>
            </li>
            <li>
              <button
                class="text-primary-600 transition-colors hover:text-accent-600"
                @click="navigateTo(ROUTES.Dashboard)"
              >
                Dashboard
              </button>
            </li>
          </ul>
        </div>

        <!-- Features -->
        <div>
          <h3 class="mb-4 font-bold text-primary-900">Можливості</h3>
          <ul class="space-y-2 text-primary-600">
            <li>Керування проєктами</li>
            <li>Управління задачами</li>
            <li>Real-time оновлення</li>
            <li>Коментарі</li>
            <li>Фільтрація та пошук</li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-primary-600">
        <p>&copy; {{ currentYear }} TaskFlow. Всі права захищені.</p>
      </div>
    </div>
  </footer>
</template>

