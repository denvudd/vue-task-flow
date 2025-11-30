export const PROJECT_ROLES = {
  VIEWER: 'viewer',
  COMMENTER: 'commenter',
  EDITOR: 'editor',
} as const

export type ProjectRole = (typeof PROJECT_ROLES)[keyof typeof PROJECT_ROLES]

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  [PROJECT_ROLES.VIEWER]: 'Can view',
  [PROJECT_ROLES.COMMENTER]: 'Can comment',
  [PROJECT_ROLES.EDITOR]: 'Can edit',
}

export const PROJECT_ROLE_DESCRIPTIONS: Record<ProjectRole, string> = {
  [PROJECT_ROLES.VIEWER]: '',
  [PROJECT_ROLES.COMMENTER]: 'Suggest and comment',
  [PROJECT_ROLES.EDITOR]: 'Edit, suggest, and comment',
}

export const PROJECT_JOIN_STATUS = {
  JOINED: 'joined',
  ROLE_UPGRADED: 'role_upgraded',
  ALREADY_MEMBER: 'already_member',
} as const

export type ProjectJoinStatus = (typeof PROJECT_JOIN_STATUS)[keyof typeof PROJECT_JOIN_STATUS]

export const ROLE_HIERARCHY: ProjectRole[] = [
  PROJECT_ROLES.VIEWER,
  PROJECT_ROLES.COMMENTER,
  PROJECT_ROLES.EDITOR,
]

export const PROJECT_VISIBILITIES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const

export type ProjectVisibility = (typeof PROJECT_VISIBILITIES)[keyof typeof PROJECT_VISIBILITIES]
