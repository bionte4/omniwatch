import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SLA_TARGET_PCT,
  computeUptimeFromSamples,
  seedIncidentCount,
  seedMttrMinutes,
  seedUptime,
} from '../data/sla';

const STORAGE_KEY = 'omniwatch-sla-samples';
const MAX_SAMPLES = 500;
const SAMPLE_MS = 15000;

function loadSamples() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function pruneOld(samplesByRegion, maxAgeMs) {
  const cutoff = Date.now() - maxAgeMs;
  const next = {};
  Object.entries(samplesByRegion).forEach(([regionId, list]) => {
    next[regionId] = (list || []).filter(
      (s) => new Date(s.at).getTime() >= cutoff,
    );
  });
  return next;
}

/**
 * Tracks regional device availability samples for SLA cards (24h / 7d).
 */
export default function useSlaTracker(devices = [], regionId) {
  const [samplesByRegion, setSamplesByRegion] = useState(() => loadSamples());
  const devicesRef = useRef(devices);

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplesByRegion));
    } catch {
      /* ignore */
    }
  }, [samplesByRegion]);

  // Periodic sample of current region fleet status
  useEffect(() => {
    const takeSample = () => {
      const list = devicesRef.current || [];
      if (!list.length || !regionId) return;

      const offlineCount = list.filter((d) => d.status === 'offline').length;
      const warningCount = list.filter((d) => d.status === 'warning').length;
      // Fleet sample: offline if majority offline, else worst status
      let status = 'normal';
      if (offlineCount > 0) status = 'offline';
      else if (warningCount > 0) status = 'warning';

      // Prefer per-device samples for finer uptime
      const now = new Date().toISOString();
      const deviceSamples = list.map((d) => ({
        deviceId: d.id,
        status: d.status,
        at: now,
      }));

      setSamplesByRegion((prev) => {
        const pruned = pruneOld(prev, 7 * 24 * 60 * 60 * 1000);
        const existing = pruned[regionId] || [];
        const merged = [...existing, ...deviceSamples].slice(-MAX_SAMPLES);
        return { ...pruned, [regionId]: merged };
      });

      return { status, offlineCount };
    };

    takeSample();
    const id = window.setInterval(takeSample, SAMPLE_MS);
    return () => window.clearInterval(id);
  }, [regionId]);

  const metrics = useMemo(() => {
    const all = samplesByRegion[regionId] || [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    const last24 = all.filter((s) => now - new Date(s.at).getTime() <= dayMs);
    const last7d = all.filter((s) => now - new Date(s.at).getTime() <= weekMs);

    const live24 = computeUptimeFromSamples(last24);
    const live7d = computeUptimeFromSamples(last7d);

    const uptime24h = live24 ?? seedUptime(regionId, '24h');
    const uptime7d = live7d ?? seedUptime(regionId, '7d');

    const offlineSamples24 = last24.filter((s) => s.status === 'offline').length;
    const incidents24h =
      last24.length > 0
        ? Math.max(1, Math.round(offlineSamples24 / Math.max(1, devices.length || 1)))
        : seedIncidentCount(regionId, '24h');

    return {
      regionId,
      targetPct: SLA_TARGET_PCT,
      uptime24h,
      uptime7d,
      mttrMinutes: seedMttrMinutes(regionId),
      incidents24h,
      sampleCount24h: last24.length,
      sampleCount7d: last7d.length,
      usingLiveSamples: last24.length >= 4,
    };
  }, [samplesByRegion, regionId, devices.length]);

  return metrics;
}
