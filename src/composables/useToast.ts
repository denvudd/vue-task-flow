import { createToaster } from '@ark-ui/vue/toast'

export const toaster = createToaster({
  placement: 'bottom',
  overlap: true,
  gap: 24,
})

export function useToast() {
  const createToast = (options: {
    title?: string
    description?: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }) => {
    toaster.create({
      title: options.title,
      description: options.description,
      type: options.type || 'info',
      duration: options.duration ?? 5000,
    })
  }

  return {
    createToast,
    toaster,
  }
}




