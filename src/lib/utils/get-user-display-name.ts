export const getUserDisplayName = (user: { full_name: string | null; username: string | null }) => {
  return user.full_name || user.username || 'Unknown User'
}
