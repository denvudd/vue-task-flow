<script setup lang="ts">
import { Button } from '@/components/ui'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'

const router = useRouter()

const navigateToSignUp = () => {
  router.push(ROUTES.SignUp)
}
</script>

<template>
  <section
    class="relative overflow-hidden bg-gradient-to-br from-accent-600 to-accent-700 py-20 text-white md:py-32"
  >
    <div class="container relative z-10 mx-auto px-4">
      <div class="mx-auto max-w-4xl text-center">
        <!-- Main heading -->
        <h2 class="mb-6 text-3xl font-bold md:text-5xl">Готові почати?</h2>

        <!-- Description -->
        <p class="mb-8 text-xl text-accent-50 md:text-2xl">
          TaskFlow — це real-time система керування задачами та проєктами, створена для швидкої,
          прозорої та командної роботи.
        </p>

        <!-- CTA Button -->
        <Button variant="secondary" size="lg" @click="navigateToSignUp">
          Спробувати TaskFlow безкоштовно
        </Button>

        <!-- Additional info -->
        <p class="mt-6 text-sm text-accent-100">
          Реєстрація займає менше хвилини • Не потрібна кредитна картка
        </p>
      </div>
    </div>

    <!-- Decorative elements -->
    <div
      class="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-400 opacity-20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent-800 opacity-20 blur-3xl"
    ></div>
  </section>
</template>
