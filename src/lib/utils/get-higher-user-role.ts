import type { ProjectRole } from '@/constants/projects'
import { compareUserRoles } from './compare-user-roles'

export function getHigherUserRole(role1: ProjectRole, role2: ProjectRole): ProjectRole {
  return compareUserRoles(role1, role2) >= 0 ? role1 : role2
}
