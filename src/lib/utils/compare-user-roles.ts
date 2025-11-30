import { ROLE_HIERARCHY, type ProjectRole } from '@/constants/projects'

/**
 * Compare two roles to determine which has more permissions
 * @returns positive if role1 > role2, negative if role1 < role2, 0 if equal
 */
export function compareUserRoles(role1: ProjectRole, role2: ProjectRole): number {
  const index1 = ROLE_HIERARCHY.indexOf(role1)
  const index2 = ROLE_HIERARCHY.indexOf(role2)

  return index1 - index2
}
