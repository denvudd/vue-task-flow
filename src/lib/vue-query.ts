import { VueQueryPlugin } from '@tanstack/vue-query'
import type { VueQueryPluginOptions } from '@tanstack/vue-query'

/**
 * Vue Query configuration
 */
export const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        // Time before data is considered stale
        staleTime: 1000 * 60 * 5, // 5 minutes

        // Time before inactive queries are garbage collected
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)

        // Retry failed requests
        retry: 1,

        // Refetch on window focus
        refetchOnWindowFocus: false,

        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  },
}

export { VueQueryPlugin }
