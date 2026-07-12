export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.EMPLOYEE]: 1,
};

export const canAccess = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

export const hasMinimumRole = (userRole, minimumRole) => {
  if (!userRole || !minimumRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
};

export const PAGE_ACCESS = {
  '/dashboard': [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  '/environmental': [ROLES.ADMIN, ROLES.MANAGER],
  '/environmental/goals': [ROLES.ADMIN, ROLES.MANAGER],
  '/environmental/vendors': [ROLES.ADMIN, ROLES.MANAGER],
  '/social': [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  '/social/participations': [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  '/challenges': [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  '/gamification/leaderboard': [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  '/gamification/badges': [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  '/gamification/rewards': [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  '/governance/policies': [ROLES.ADMIN, ROLES.MANAGER],
  '/governance/compliance': [ROLES.ADMIN, ROLES.MANAGER],
  '/reports': [ROLES.ADMIN, ROLES.MANAGER],
  '/analytics': [ROLES.ADMIN, ROLES.MANAGER],
};
