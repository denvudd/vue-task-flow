import { z } from 'zod'
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_TYPES,
  type TicketStatus,
  type TicketPriority,
  type TicketType,
} from '@/constants/tickets'

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  key: z
    .string()
    .regex(/^[A-Z0-9]{3,10}$/, 'Key must be 3-10 uppercase letters or numbers')
    .optional(),
})

export type CreateProjectForm = z.infer<typeof createProjectSchema>

export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  status: z
    .enum([TICKET_STATUSES.TODO, TICKET_STATUSES.IN_PROGRESS, TICKET_STATUSES.REVIEW, TICKET_STATUSES.DONE, TICKET_STATUSES.ARCHIVED] as [TicketStatus, ...TicketStatus[]])
    .optional(),
  priority: z
    .enum([TICKET_PRIORITIES.LOW, TICKET_PRIORITIES.MEDIUM, TICKET_PRIORITIES.HIGH, TICKET_PRIORITIES.URGENT] as [TicketPriority, ...TicketPriority[]])
    .optional(),
  type: z
    .enum([TICKET_TYPES.TASK, TICKET_TYPES.BUG, TICKET_TYPES.FEATURE, TICKET_TYPES.IMPROVEMENT] as [TicketType, ...TicketType[]])
    .optional(),
  due_date: z.string().optional(),
})

export type CreateTicketForm = z.infer<typeof createTicketSchema>

export const updateTicketSchema = createTicketSchema.partial().extend({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
})

export type UpdateTicketForm = z.infer<typeof updateTicketSchema>
