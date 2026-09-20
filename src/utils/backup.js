/**
 * Backup / restore OmniWatch configuration (localStorage-backed settings).
 */

export const BACKUP_VERSION = 1;

const KEYS = {
  regions: 'omniwatch-regions-config',
  thresholds: 'omniwatch-alert-thresholds',
  integrations: 'omniwatch-device-integrations',
  escalation: 'omniwatch-escalation-policy',
  broadcast: 'omniwatch-broadcast-channels',
  dataSource: 'omniwatch-data-source',
  localDevices: 'omniwatch-local-devices',
  workOrders: 'omniwatch-work-orders',
};

function readKey(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeKey(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function collectBackupSnapshot(extra = {}) {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'OmniWatch',
    config: {
      regions: extra.regions ?? readKey(KEYS.regions),
      thresholds: extra.thresholds ?? readKey(KEYS.thresholds),
      integrations: extra.integrations ?? readKey(KEYS.integrations),
      escalation: extra.escalation ?? readKey(KEYS.escalation),
      broadcast: extra.broadcast ?? readKey(KEYS.broadcast),
      dataSource: extra.dataSource ?? readKey(KEYS.dataSource),
      localDevices: extra.localDevices ?? readKey(KEYS.localDevices),
      workOrders: extra.workOrders ?? readKey(KEYS.workOrders),
    },
  };
}

export function downloadBackupJson(snapshot, filename) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.href = url;
  a.download = filename || `omniwatch-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseBackupFileText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File bukan JSON valid.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Struktur backup tidak dikenali.' };
  }

  const config = parsed.config || parsed;
  if (!config || typeof config !== 'object') {
    return { ok: false, error: 'Tidak ada objek config di file backup.' };
  }

  return {
    ok: true,
    snapshot: {
      version: parsed.version || 1,
      exportedAt: parsed.exportedAt || null,
      config,
    },
  };
}

/**
 * Apply backup into localStorage. Returns list of applied section keys.
 */
export function applyBackupToStorage(config, { includeWorkOrders = true } = {}) {
  if (!config || typeof config !== 'object') {
    return { ok: false, error: 'Config kosong.', applied: [] };
  }

  const applied = [];

  const pairs = [
    ['regions', KEYS.regions],
    ['thresholds', KEYS.thresholds],
    ['integrations', KEYS.integrations],
    ['escalation', KEYS.escalation],
    ['broadcast', KEYS.broadcast],
    ['dataSource', KEYS.dataSource],
    ['localDevices', KEYS.localDevices],
  ];

  if (includeWorkOrders) {
    pairs.push(['workOrders', KEYS.workOrders]);
  }

  pairs.forEach(([field, storageKey]) => {
    if (config[field] !== undefined && config[field] !== null) {
      writeKey(storageKey, config[field]);
      applied.push(field);
    }
  });

  return { ok: true, applied };
}

export { KEYS as BACKUP_STORAGE_KEYS };
