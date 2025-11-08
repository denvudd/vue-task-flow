import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string('Password is required').min(6, 'Password must be at least 6 characters'),
})

export const signUpSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z.string('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string('Confirm Password is required')
      .min(1, 'Confirm Password is required'),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
