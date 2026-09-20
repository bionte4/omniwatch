export const WO_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

export const WO_STATUS_META = {
  open: {
    label: 'Open',
    className:
      'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300',
  },
  in_progress: {
    label: 'Proses',
    className:
      'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300',
  },
  done: {
    label: 'Selesai',
    className:
      'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
};

export const ASSIGNEE_OPTIONS = [
  { id: 'padang', name: 'Budi Santoso', region: 'padang' },
  { id: 'mentawai', name: 'Rina Marlina', region: 'mentawai' },
  { id: 'bukittinggi', name: 'Andi Pratama', region: 'bukittinggi' },
  { id: 'oncall', name: 'On-call Piket', region: 'all' },
];

export function createWorkOrderFromAlert(alert, extras = {}) {
  const region = alert.region || extras.regionId || 'padang';
  const assignee =
    ASSIGNEE_OPTIONS.find((a) => a.region === region) || ASSIGNEE_OPTIONS[3];

  return {
    id: `wo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: `Perbaikan ${alert.deviceType || 'Perangkat'} Offline`,
    deviceId: alert.deviceId || '',
    deviceName: alert.deviceName || alert.deviceId || '—',
    region,
    status: WO_STATUS.OPEN,
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    notes: alert.message || 'Perangkat offline — perlu pengecekan lapangan.',
    photoNote: '',
    alertId: alert.id || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extras,
  };
}
