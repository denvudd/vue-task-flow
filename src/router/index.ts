import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'
import { ROUTES } from '@/lib/routing'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: ROUTES.Dashboard,
          name: 'Dashboard',
          component: () => import('@/pages/app/dashboard/Dashboard.vue'),
        },
        {
          path: ROUTES.Profile,
          name: 'Profile',
          component: () => import('@/pages/app/profile/Profile.vue'),
        },
        {
          path: ROUTES.CreateProject,
          name: 'CreateProject',
          component: () => import('@/pages/app/projects/create/ProjectsCreate.vue'),
        },
      ],
    },
    {
      path: ROUTES.Login,
      name: 'Login',
      component: () => import('@/pages/auth/Login.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: ROUTES.SignUp,
      name: 'SignUp',
      component: () => import('@/pages/auth/SignUp.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: ROUTES.ForgotPassword,
      name: 'ForgotPassword',
      component: () => import('@/pages/auth/ForgotPassword.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: ROUTES.ResetPassword,
      name: 'ResetPassword',
      component: () => import('@/pages/auth/ResetPassword.vue'),
    },
  ],
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not already initialized
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  // If route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // If route requires guest (not authenticated)
  if (requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
