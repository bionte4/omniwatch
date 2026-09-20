export const ROLES = {
  ADMIN: 'administrator',
  STATION_ADMIN: 'station_admin',
  TECHNICIAN: 'technician',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.STATION_ADMIN]: 'Admin Stasiun',
  [ROLES.TECHNICIAN]: 'Teknisi',
  [ROLES.OPERATOR]: 'Operator Piket',
  [ROLES.VIEWER]: 'Viewer',
};

/**
 * Capability matrix — keep checks centralized.
 */
export const PERMISSIONS = {
  muteAlarm: [ROLES.OPERATOR, ROLES.TECHNICIAN, ROLES.STATION_ADMIN, ROLES.ADMIN],
  testBroadcast: [ROLES.STATION_ADMIN, ROLES.ADMIN],
  openAdmin: [ROLES.STATION_ADMIN, ROLES.ADMIN],
  manageIntegrations: [ROLES.ADMIN],
  manageDataSource: [ROLES.ADMIN],
  manageThresholds: [ROLES.STATION_ADMIN, ROLES.ADMIN],
  manageEscalation: [ROLES.STATION_ADMIN, ROLES.ADMIN],
  manageWorkOrders: [
    ROLES.TECHNICIAN,
    ROLES.STATION_ADMIN,
    ROLES.ADMIN,
    ROLES.OPERATOR,
  ],
  createWorkOrder: [
    ROLES.TECHNICIAN,
    ROLES.STATION_ADMIN,
    ROLES.ADMIN,
    ROLES.OPERATOR,
  ],
  manageRegions: [ROLES.ADMIN],
  manageDevices: [ROLES.STATION_ADMIN, ROLES.ADMIN],
  manageBroadcast: [ROLES.STATION_ADMIN, ROLES.ADMIN],
  backupRestore: [ROLES.STATION_ADMIN, ROLES.ADMIN],
  openWorkOrderPanel: [
    ROLES.TECHNICIAN,
    ROLES.STATION_ADMIN,
    ROLES.ADMIN,
    ROLES.OPERATOR,
  ],
};

/**
 * Dummy credentials for local / demo OmniWatch login.
 */
export const DUMMY_USERS = [
  {
    username: 'admin',
    password: 'admin',
    displayName: 'Administrator BMKG',
    role: ROLES.ADMIN,
    stationId: null,
  },
  {
    username: 'adminpdg',
    password: 'adminpdg',
    displayName: 'Admin Stasiun Padang',
    role: ROLES.STATION_ADMIN,
    stationId: 'padang',
  },
  {
    username: 'teknisi',
    password: 'teknisi',
    displayName: 'Teknisi Lapangan',
    role: ROLES.TECHNICIAN,
    stationId: 'padang',
  },
  {
    username: 'operator',
    password: 'operator',
    displayName: 'Operator Piket',
    role: ROLES.OPERATOR,
    stationId: null,
  },
  {
    username: 'viewer',
    password: 'viewer',
    displayName: 'Viewer Monitoring',
    role: ROLES.VIEWER,
    stationId: null,
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
    stationId: user.stationId ?? null,
  };
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || '—';
}

export function hasPermission(user, permission) {
  if (!user?.role) return false;
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(user.role);
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

export function isStationAdmin(user) {
  return user?.role === ROLES.STATION_ADMIN || user?.role === ROLES.ADMIN;
}

/** Admin tabs visible for a given role */
export function getAdminTabsForRole(role) {
  if (role === ROLES.ADMIN) {
    return [
      'integrations',
      'datasource',
      'thresholds',
      'escalation',
      'workorders',
      'region',
      'devices',
      'broadcast',
      'backup',
    ];
  }
  if (role === ROLES.STATION_ADMIN) {
    return [
      'thresholds',
      'escalation',
      'workorders',
      'devices',
      'broadcast',
      'backup',
    ];
  }
  return ['workorders'];
}
