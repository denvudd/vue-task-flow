export const ROUTES = {
  Home: '/',
  Dashboard: '/dashboard',
  Profile: '/profile',
  Login: '/login',
  SignUp: '/sign-up',
  ForgotPassword: '/forgot-password',
  ResetPassword: '/reset-password',
  AuthCallback: '/auth/callback',
  CreateProject: '/projects/create',
  EditProject: (projectId: string) => `/projects/${projectId}/edit`,
  Project: (projectId: string) => `/projects/${projectId}`,
  Ticket: (projectId: string, ticketId: string) => `/projects/${projectId}/tickets/${ticketId}`,
} as const
