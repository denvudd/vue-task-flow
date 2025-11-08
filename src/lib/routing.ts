export const ROUTES = {
  Dashboard: '/dashboard',
  Profile: '/profile',
  Login: '/login',
  SignUp: '/sign-up',
  ForgotPassword: '/forgot-password',
  ResetPassword: '/reset-password',
  CreateProject: '/projects/create',
  Project: (projectId: string) => `/projects/${projectId}`,
}
