/**
 * SLA / uptime helpers for OmniWatch station metrics.
 */

export const SLA_TARGET_PCT = 99.0;

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Seeded baseline uptime (%) so cards look realistic before live samples accumulate.
 */
export function seedUptime(regionId, windowKey) {
  const seed = hashString(`${regionId}|${windowKey}`);
  const base = 96.5 + (seed % 280) / 100; // 96.5 – 99.3
  return Number(Math.min(99.9, base).toFixed(2));
}

export function seedMttrMinutes(regionId) {
  const seed = hashString(`${regionId}|mttr`);
  return 8 + (seed % 35); // 8–42 menit
}

export function seedIncidentCount(regionId, windowKey) {
  const seed = hashString(`${regionId}|incidents|${windowKey}`);
  return 1 + (seed % 9);
}

/**
 * Compute uptime from discrete status samples.
 * Sample shape: { status: 'normal'|'warning'|'offline', at: ISO string }
 * Offline counts against availability; warning still counts as up.
 */
export function computeUptimeFromSamples(samples = []) {
  if (!samples.length) return null;
  const up = samples.filter((s) => s.status !== 'offline').length;
  return Number(((up / samples.length) * 100).toFixed(2));
}

export function slaTone(pct, target = SLA_TARGET_PCT) {
  if (pct == null) return 'neutral';
  if (pct >= target) return 'normal';
  if (pct >= target - 2) return 'warning';
  return 'offline';
}

export function formatUptime(pct) {
  if (pct == null || Number.isNaN(pct)) return '—';
  return `${Number(pct).toFixed(2)}%`;
}
