import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center cursor-pointer justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500',
        secondary:
          'bg-primary-100 text-primary-700 hover:bg-primary-200 active:bg-primary-300 focus-visible:ring-primary-500',
        ghost:
          'bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 focus-visible:ring-neutral-300',
        outline:
          'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 focus-visible:ring-neutral-300',
        danger:
          'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
