/**
 * Offline device cache — LocalStorage primary, IndexedDB fallback mirror.
 */

const LS_KEY = 'omniwatch-device-cache-v1';
const IDB_NAME = 'omniwatch-offline';
const IDB_STORE = 'snapshots';
const IDB_KEY = 'latest-devices';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(value) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, IDB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore IDB errors */
  }
}

async function idbGet() {
  try {
    const db = await openDb();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return value;
  } catch {
    return null;
  }
}

export function saveDeviceCache(devices, meta = {}) {
  if (!Array.isArray(devices) || !devices.length) return;

  const payload = {
    savedAt: new Date().toISOString(),
    devices,
    meta,
  };

  try {
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }

  idbSet(payload);
}

export function loadDeviceCacheSync() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.devices) || !parsed.devices.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function loadDeviceCache() {
  const fromLs = loadDeviceCacheSync();
  if (fromLs) return fromLs;
  return idbGet();
}
