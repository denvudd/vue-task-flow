import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  key: z
    .string()
    .regex(/^[A-Z0-9]{3,10}$/, 'Key must be 3-10 uppercase letters or numbers')
    .optional(),
})

export type CreateProjectForm = z.infer<typeof createProjectSchema>
