import {
  Circle,
  CircleDashed,
  Eye,
  CheckCircle2,
  Archive,
  ArrowDown,
  Equal,
  ArrowUp,
  Flame,
  CheckSquare,
  Bug,
  Sparkles,
  TrendingUp,
} from 'lucide-vue-next'

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
  {
    label: 'To Do',
    value: TICKET_STATUSES.TODO,
    icon: Circle,
    color: 'text-neutral-700',
    bgColor: 'bg-neutral-100',
  },
  {
    label: 'In Progress',
    value: TICKET_STATUSES.IN_PROGRESS,
    icon: CircleDashed,
    color: 'text-info-700',
    bgColor: 'bg-info-100',
  },
  {
    label: 'Review',
    value: TICKET_STATUSES.REVIEW,
    icon: Eye,
    color: 'text-warning-700',
    bgColor: 'bg-warning-100',
  },
  {
    label: 'Done',
    value: TICKET_STATUSES.DONE,
    icon: CheckCircle2,
    color: 'text-success-700',
    bgColor: 'bg-success-100',
  },
  {
    label: 'Archived',
    value: TICKET_STATUSES.ARCHIVED,
    icon: Archive,
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-200',
  },
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
  {
    label: 'Low',
    value: TICKET_PRIORITIES.LOW,
    icon: ArrowDown,
    color: 'text-success-700',
    bgColor: 'bg-success-100',
  },
  {
    label: 'Medium',
    value: TICKET_PRIORITIES.MEDIUM,
    icon: Equal,
    color: 'text-warning-700',
    bgColor: 'bg-warning-100',
  },
  {
    label: 'High',
    value: TICKET_PRIORITIES.HIGH,
    icon: ArrowUp,
    color: 'text-error-600',
    bgColor: 'bg-error-100',
  },
  {
    label: 'Urgent',
    value: TICKET_PRIORITIES.URGENT,
    icon: Flame,
    color: 'text-error-700',
    bgColor: 'bg-error-200',
  },
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
  {
    label: 'Task',
    value: TICKET_TYPES.TASK,
    icon: CheckSquare,
    color: 'text-primary-700',
    bgColor: 'bg-primary-100',
  },
  {
    label: 'Bug',
    value: TICKET_TYPES.BUG,
    icon: Bug,
    color: 'text-error-700',
    bgColor: 'bg-error-100',
  },
  {
    label: 'Feature',
    value: TICKET_TYPES.FEATURE,
    icon: Sparkles,
    color: 'text-accent-700',
    bgColor: 'bg-accent-100',
  },
  {
    label: 'Improvement',
    value: TICKET_TYPES.IMPROVEMENT,
    icon: TrendingUp,
    color: 'text-info-700',
    bgColor: 'bg-info-100',
  },
]
