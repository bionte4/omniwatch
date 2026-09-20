export const ROLES = {
  ADMIN: 'administrator',
  OPERATOR: 'operator',
};

/**
 * Dummy credentials for local / demo OmniWatch login.
 * Username / Password → Role
 */
export const DUMMY_USERS = [
  {
    username: 'admin',
    password: 'admin',
    displayName: 'Administrator BMKG',
    role: ROLES.ADMIN,
  },
  {
    username: 'operator',
    password: 'operator',
    displayName: 'Operator Piket',
    role: ROLES.OPERATOR,
  },
];

export function authenticate(username, password) {
  const user = DUMMY_USERS.find(
    (u) =>
      u.username.toLowerCase() === String(username).trim().toLowerCase() &&
      u.password === String(password),
  );

  if (!user) return null;

  return {
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}
