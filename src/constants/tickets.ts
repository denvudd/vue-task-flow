/**
 * Ticket statuses
 */
export const TICKET_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  ARCHIVED: 'archived',
} as const

export type TicketStatus = (typeof TICKET_STATUSES)[keyof typeof TICKET_STATUSES]

export const TICKET_STATUS_OPTIONS = [
  { label: 'To Do', value: TICKET_STATUSES.TODO },
  { label: 'In Progress', value: TICKET_STATUSES.IN_PROGRESS },
  { label: 'Review', value: TICKET_STATUSES.REVIEW },
  { label: 'Done', value: TICKET_STATUSES.DONE },
  { label: 'Archived', value: TICKET_STATUSES.ARCHIVED },
]

/**
 * Ticket priorities
 */
export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

export type TicketPriority = (typeof TICKET_PRIORITIES)[keyof typeof TICKET_PRIORITIES]

export const TICKET_PRIORITY_OPTIONS = [
  { label: 'Low', value: TICKET_PRIORITIES.LOW },
  { label: 'Medium', value: TICKET_PRIORITIES.MEDIUM },
  { label: 'High', value: TICKET_PRIORITIES.HIGH },
  { label: 'Urgent', value: TICKET_PRIORITIES.URGENT },
]

/**
 * Ticket types
 */
export const TICKET_TYPES = {
  TASK: 'task',
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
} as const

export type TicketType = (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES]

export const TICKET_TYPE_OPTIONS = [
  { label: 'Task', value: TICKET_TYPES.TASK },
  { label: 'Bug', value: TICKET_TYPES.BUG },
  { label: 'Feature', value: TICKET_TYPES.FEATURE },
  { label: 'Improvement', value: TICKET_TYPES.IMPROVEMENT },
]

