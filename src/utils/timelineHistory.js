/**
 * Deterministic historical status simulation for Timeline Playback.
 * Same device + same hour bucket → same status (stable while scrubbing).
 */

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hourBucket(date) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

/**
 * Simulated field status for a device at a historical timestamp.
 */
export function getSimulatedStatusAt(device, atTime) {
  const seed = hashString(`${device.id}|${hourBucket(atTime)}`);
  const roll = seed % 100;

  // Rough field distribution: mostly normal, occasional warning/offline
  if (roll < 72) return 'normal';
  if (roll < 90) return 'warning';
  return 'offline';
}

export function applyTimelineToDevices(devices, atTime, { isLive = false } = {}) {
  if (isLive) {
    return devices.map((d) => ({ ...d }));
  }

  return devices.map((device) => {
    const status = getSimulatedStatusAt(device, atTime);
    const metrics =
      status === 'normal'
        ? { battery: 75 + (hashString(device.id) % 25), signal: 70 + (hashString(device.id + 's') % 30) }
        : status === 'warning'
          ? { battery: 35 + (hashString(device.id) % 30), signal: 30 + (hashString(device.id + 'w') % 35) }
          : { battery: hashString(device.id) % 15, signal: 0 };

    return {
      ...device,
      status,
      lastUpdate: new Date(atTime).toISOString(),
      ...metrics,
      timelineMode: true,
    };
  });
}

export const TIMELINE_WINDOW_MS = 24 * 60 * 60 * 1000;
export const TIMELINE_STEP_MINUTES = 15;
export const TIMELINE_MAX_MINUTES = 24 * 60; // 1440

export function formatTimelineClock(date) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(date);
}
