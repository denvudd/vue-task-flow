import z from 'zod'

export const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .optional()
    .or(z.literal('')),
})
