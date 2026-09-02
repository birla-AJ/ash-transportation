export function homePathForRole(role) {
  if (role === 'super_admin') return '/super-admin-dashboard';
  if (role === 'sub_admin') return '/sub-admin-dashboard';
  return '/dashboard';
}
