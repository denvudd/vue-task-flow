import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'
import { ROUTES } from '@/lib/routing'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES.Home,
      name: 'Home',
      component: () => import('@/pages/home/Home.vue'),
    },
    {
      path: ROUTES.Dashboard,
      name: 'Dashboard',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/app/dashboard/Dashboard.vue'),
        },
      ],
    },
    {
      path: ROUTES.Profile,
      name: 'Profile',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/app/profile/Profile.vue'),
        },
      ],
    },
    {
      path: ROUTES.CreateProject,
      name: 'CreateProject',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/app/projects/create/ProjectsCreate.vue'),
        },
      ],
    },
    {
      path: '/projects/:id/edit',
      name: 'EditProject',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/app/projects/edit/ProjectsEdit.vue'),
        },
      ],
    },
    {
      path: '/projects/:id',
      name: 'Project',
      component: AppLayout,
      meta: { requiresAuth: false, fullWidth: true, withoutHeader: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/app/projects/view/ProjectView.vue'),
        },
      ],
    },
    {
      path: '/projects/:projectId/tickets/:ticketId',
      name: 'Ticket',
      component: AppLayout,
      meta: { requiresAuth: false, fullWidth: true, withoutHeader: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/app/projects/view/TicketView.vue'),
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
    {
      path: ROUTES.AuthCallback,
      name: 'AuthCallback',
      component: () => import('@/pages/auth/AuthCallback.vue'),
      meta: { skipAuthCheck: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.skipAuthCheck) {
    next()
    return
  }

  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
