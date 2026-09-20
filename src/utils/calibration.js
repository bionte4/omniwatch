/**
 * Deterministic next-calibration schedule for field devices.
 */

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const INTERVAL_DAYS = {
  Seismometer: 180,
  AWS: 90,
  'Tide Gauge': 120,
  Accelerograph: 180,
  ARG: 90,
};

/**
 * @returns {{ nextDate: Date, daysLeft: number, overdue: boolean, intervalDays: number }}
 */
export function getCalibrationInfo(device, now = new Date()) {
  if (!device?.id) {
    return { nextDate: null, daysLeft: null, overdue: false, intervalDays: 90 };
  }

  const intervalDays = INTERVAL_DAYS[device.type] || 90;
  const seed = hashString(device.id);
  // Spread next cal across ±interval from a fixed epoch so it stays stable
  const epoch = new Date('2026-01-01T00:00:00+07:00').getTime();
  const offsetDays = seed % intervalDays;
  let next = new Date(epoch + offsetDays * 86400000);

  while (next.getTime() < now.getTime() - intervalDays * 86400000) {
    next = new Date(next.getTime() + intervalDays * 86400000);
  }
  // Find next upcoming (or most recent overdue within interval)
  while (next.getTime() < now.getTime()) {
    const candidate = new Date(next.getTime() + intervalDays * 86400000);
    if (candidate.getTime() > now.getTime()) break;
    next = candidate;
  }
  // If still in past, it's overdue until next cycle
  if (next.getTime() < now.getTime()) {
    next = new Date(next.getTime() + intervalDays * 86400000);
  }

  // Prefer showing the nearest deadline: if last slot was within grace, mark overdue
  const prev = new Date(next.getTime() - intervalDays * 86400000);
  const usePrev = now.getTime() - prev.getTime() < 14 * 86400000 && prev.getTime() <= now.getTime();
  const target = usePrev ? prev : next;
  const daysLeft = Math.ceil((target.getTime() - now.getTime()) / 86400000);

  return {
    nextDate: target,
    daysLeft,
    overdue: daysLeft < 0,
    dueSoon: daysLeft >= 0 && daysLeft <= 14,
    intervalDays,
  };
}

export function formatCalibrationDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}
