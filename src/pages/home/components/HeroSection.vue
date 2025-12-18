<script setup lang="ts">
import { Button } from '@/components/ui'
import { useRouter } from 'vue-router'
import { ROUTES } from '@/lib/routing'
import SplitText from './animations/SplitText.vue'
import GradientText from './animations/GradientText.vue'
import FadeContent from './animations/FadeContent.vue'
import { useAuth } from '@/composables/useAuth'
const router = useRouter()

const { isAuthenticated } = useAuth()

const navigateToSignUp = () => {
  if (isAuthenticated.value) {
    router.push(ROUTES.Dashboard)
  } else {
    router.push(ROUTES.SignUp)
  }
}

const navigateToLogin = () => {
  if (isAuthenticated.value) {
    router.push(ROUTES.Dashboard)
  } else {
    router.push(ROUTES.Login)
  }
}
</script>

<template>
  <section class="relative overflow-hidden from-primary-50 via-white to-accent-50 py-20 md:py-32">
    <div class="container mx-auto px-4">
      <div class="mx-auto max-w-4xl text-center">
        <!-- Logo -->
        <div class="mb-8 flex justify-center">
          <img src="/images/logo.png" alt="TaskFlow Logo" class="h-16 md:h-20" />
        </div>

        <!-- Main heading -->
        <h1 class="mb-6 text-4xl font-bold text-primary-900 md:text-5xl lg:text-6xl">
          <SplitText
            text="Керуйте проєктами"
            class-name="text-4xl font-bold text-primary-900 md:text-5xl lg:text-6xl"
            :delay="100"
            :duration="0.6"
            ease="power3.out"
            split-type="chars"
            :from="{ opacity: 0, y: 40 }"
            :to="{ opacity: 1, y: 0 }"
            :threshold="0.1"
            root-margin="-100px"
            text-align="center"
          />
          <GradientText
            text="в реальному часі"
            :colors="['#ffaa40', '#9c40ff', '#ffaa40']"
            :animation-speed="8"
            :show-border="false"
            class-name="your-custom-class"
          />
        </h1>

        <!-- CTA Buttons -->
        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="primary" size="lg" @click="navigateToSignUp">
            Почати безкоштовно
          </Button>
          <Button variant="secondary" size="lg" @click="navigateToLogin"> Увійти </Button>
        </div>

        <!-- Features badges -->
        <div class="mt-12 flex flex-wrap items-center justify-center gap-4">
          <FadeContent
            :blur="true"
            :duration="1000"
            :delay="200"
            :threshold="0.1"
            :initial-opacity="0"
            easing="ease-out"
            class="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft"
          >
            <span class="text-2xl">🔄</span>
            <span class="text-sm font-medium text-primary-800">Real-time синхронізація</span>
          </FadeContent>
          <FadeContent
            :blur="true"
            :duration="1000"
            :delay="200"
            :threshold="0.1"
            :initial-opacity="0"
            easing="ease-out"
            class="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft"
          >
            <span class="text-2xl">💬</span>
            <span class="text-sm font-medium text-primary-800">Коментарі до задач</span>
          </FadeContent>
          <FadeContent
            :blur="true"
            :duration="1000"
            :delay="200"
            :threshold="0.1"
            :initial-opacity="0"
            easing="ease-out"
            class="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft"
          >
            <span class="text-2xl">📱</span>
            <span class="text-sm font-medium text-primary-800">Адаптивний дизайн</span>
          </FadeContent>
        </div>
      </div>
    </div>

    <!-- Decorative elements -->
    <div
      class="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent-200 opacity-20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary-200 opacity-20 blur-3xl"
    ></div>
  </section>
</template>
