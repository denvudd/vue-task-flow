import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './lib/i18n'
import { VueQueryPlugin, vueQueryOptions } from './lib/vue-query'
import { useAuthStore } from './stores/auth'
import VueDnDKitPlugin from '@vue-dnd-kit/core'
import VueDnDKitDevtools from '@vue-dnd-kit/devtools'
import './style.css'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(VueQueryPlugin, vueQueryOptions)
app.use(VueDnDKitPlugin)
app.use(VueDnDKitDevtools)

// Initialize auth state before mounting

const authStore = useAuthStore()

// For callback routes, delay auth initialization to let component handle hash first
const isCallbackRoute = window.location.pathname === '/auth/callback'
if (isCallbackRoute) {
  app.mount('#app')
} else {
  authStore.initialize().finally(() => {
    app.mount('#app')
  })
}
