import { z } from 'zod'

export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  type: z.string().max(50).optional(),
  assignee_id: z.string().uuid('Invalid user ID').optional().nullable(),
  due_date: z.string().optional().nullable(),
})

export type CreateTicketForm = z.infer<typeof createTicketSchema>

