// Project member roles
export const PROJECT_ROLES = {
  VIEWER: 'viewer',
  COMMENTER: 'commenter',
  EDITOR: 'editor',
} as const

export type ProjectRole = (typeof PROJECT_ROLES)[keyof typeof PROJECT_ROLES]

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  [PROJECT_ROLES.VIEWER]: 'Viewer',
  [PROJECT_ROLES.COMMENTER]: 'Commenter',
  [PROJECT_ROLES.EDITOR]: 'Editor',
}

export const PROJECT_ROLE_DESCRIPTIONS: Record<ProjectRole, string> = {
  [PROJECT_ROLES.VIEWER]: 'Can view project and tickets',
  [PROJECT_ROLES.COMMENTER]: 'Can view and comment on tickets',
  [PROJECT_ROLES.EDITOR]: 'Can view, comment, and edit tickets',
}

// Role hierarchy for comparison (higher index = more permissions)
export const ROLE_HIERARCHY: ProjectRole[] = [
  PROJECT_ROLES.VIEWER,
  PROJECT_ROLES.COMMENTER,
  PROJECT_ROLES.EDITOR,
]

/**
 * Compare two roles to determine which has more permissions
 * @returns positive if role1 > role2, negative if role1 < role2, 0 if equal
 */
export function compareRoles(role1: ProjectRole, role2: ProjectRole): number {
  const index1 = ROLE_HIERARCHY.indexOf(role1)
  const index2 = ROLE_HIERARCHY.indexOf(role2)
  return index1 - index2
}

/**
 * Get the higher of two roles
 */
export function getHigherRole(role1: ProjectRole, role2: ProjectRole): ProjectRole {
  return compareRoles(role1, role2) >= 0 ? role1 : role2
}



