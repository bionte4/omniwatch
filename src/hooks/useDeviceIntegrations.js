import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONNECTOR_STATUS,
  DEFAULT_INTEGRATIONS,
  createEmptyIntegration,
} from '../data/integrations';

const STORAGE_KEY = 'omniwatch-device-integrations';

function loadIntegrations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INTEGRATIONS.map((i) => ({ ...i }));
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) {
      return DEFAULT_INTEGRATIONS.map((i) => ({ ...i }));
    }
    return parsed;
  } catch {
    return DEFAULT_INTEGRATIONS.map((i) => ({ ...i }));
  }
}

function jitter(base, spread) {
  return Math.max(0, Math.round(base + (Math.random() * spread * 2 - spread)));
}

/**
 * Admin device integration connectors (MQTT / HTTP / etc.) — simulated health.
 */
export default function useDeviceIntegrations() {
  const [integrations, setIntegrations] = useState(() => loadIntegrations());
  const [activityLog, setActivityLog] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
    } catch {
      /* ignore */
    }
  }, [integrations]);

  // Soft live health drift for enabled connectors
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIntegrations((prev) =>
        prev.map((item) => {
          if (!item.enabled || item.status === CONNECTOR_STATUS.TESTING) {
            return item;
          }
          if (item.status === CONNECTOR_STATUS.DISCONNECTED) {
            return item;
          }

          const latencyMs = jitter(item.latencyMs || 80, 25);
          const messagesPerMin = jitter(item.messagesPerMin || 5, 4);
          const errorRate = Number(
            Math.max(0, (item.errorRate || 1) + (Math.random() * 0.8 - 0.4)).toFixed(1),
          );

          let status = CONNECTOR_STATUS.CONNECTED;
          if (errorRate > 8 || latencyMs > 400) {
            status = CONNECTOR_STATUS.DEGRADED;
          }

          return {
            ...item,
            latencyMs,
            messagesPerMin,
            errorRate,
            status,
            lastSeen: new Date().toISOString(),
          };
        }),
      );
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pushLog = useCallback((message, level = 'info') => {
    setActivityLog((prev) =>
      [
        {
          id: `ilog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          time: new Date().toISOString(),
          message,
          level,
        },
        ...prev,
      ].slice(0, 30),
    );
  }, []);

  const upsertIntegration = useCallback(
    (integration) => {
      setIntegrations((prev) => {
        const exists = prev.some((i) => i.id === integration.id);
        if (exists) {
          pushLog(`Integrasi diperbarui: ${integration.name || integration.id}`);
          return prev.map((i) => (i.id === integration.id ? { ...i, ...integration } : i));
        }
        pushLog(`Integrasi ditambahkan: ${integration.name || integration.id}`);
        return [{ ...integration }, ...prev];
      });
    },
    [pushLog],
  );

  const removeIntegration = useCallback(
    (id) => {
      setIntegrations((prev) => {
        const target = prev.find((i) => i.id === id);
        pushLog(`Integrasi dihapus: ${target?.name || id}`, 'warn');
        return prev.filter((i) => i.id !== id);
      });
    },
    [pushLog],
  );

  const testPing = useCallback(
    (id) => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: CONNECTOR_STATUS.TESTING } : i,
        ),
      );

      const target = integrations.find((i) => i.id === id);
      pushLog(`Test ping → ${target?.name || id}…`);

      window.setTimeout(() => {
        const ok = Math.random() > 0.15;
        setIntegrations((prev) =>
          prev.map((i) => {
            if (i.id !== id) return i;
            if (!ok) {
              return {
                ...i,
                status: CONNECTOR_STATUS.DISCONNECTED,
                latencyMs: 0,
                messagesPerMin: 0,
                errorRate: Number((15 + Math.random() * 10).toFixed(1)),
              };
            }
            return {
              ...i,
              status: CONNECTOR_STATUS.CONNECTED,
              lastSeen: new Date().toISOString(),
              latencyMs: jitter(40, 30),
              messagesPerMin: jitter(12, 6),
              errorRate: Number((Math.random() * 2).toFixed(1)),
              enabled: true,
            };
          }),
        );
        pushLog(
          ok
            ? `Test ping berhasil: ${target?.name || id}`
            : `Test ping gagal: ${target?.name || id}`,
          ok ? 'info' : 'error',
        );
      }, 900);
    },
    [integrations, pushLog],
  );

  const reconnect = useCallback(
    (id) => {
      const target = integrations.find((i) => i.id === id);
      pushLog(`Reconnect → ${target?.name || id}…`);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: CONNECTOR_STATUS.TESTING, enabled: true }
            : i,
        ),
      );

      window.setTimeout(() => {
        setIntegrations((prev) =>
          prev.map((i) => {
            if (i.id !== id) return i;
            return {
              ...i,
              status: CONNECTOR_STATUS.CONNECTED,
              lastSeen: new Date().toISOString(),
              latencyMs: jitter(55, 20),
              messagesPerMin: jitter(10, 5),
              errorRate: Number((Math.random() * 1.5).toFixed(1)),
            };
          }),
        );
        pushLog(`Reconnect sukses: ${target?.name || id}`);
      }, 1100);
    },
    [integrations, pushLog],
  );

  const toggleEnabled = useCallback(
    (id, enabled) => {
      setIntegrations((prev) =>
        prev.map((i) => {
          if (i.id !== id) return i;
          return {
            ...i,
            enabled,
            status: enabled ? CONNECTOR_STATUS.CONNECTED : CONNECTOR_STATUS.DISCONNECTED,
            lastSeen: enabled ? new Date().toISOString() : i.lastSeen,
          };
        }),
      );
      pushLog(
        enabled ? `Konektor diaktifkan: ${id}` : `Konektor dimatikan: ${id}`,
        enabled ? 'info' : 'warn',
      );
    },
    [pushLog],
  );

  return {
    integrations,
    activityLog,
    upsertIntegration,
    removeIntegration,
    testPing,
    reconnect,
    toggleEnabled,
    createEmptyIntegration,
  };
}
