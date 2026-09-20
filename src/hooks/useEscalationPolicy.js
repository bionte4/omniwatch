import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_ESCALATION_POLICY,
  mergeEscalationPolicy,
} from '../data/escalation';

const STORAGE_KEY = 'omniwatch-escalation-policy';
const CHECK_MS = 10000;

function loadPolicy() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ESCALATION_POLICY };
    return mergeEscalationPolicy(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_ESCALATION_POLICY };
  }
}

function formatClock() {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
}

/**
 * Escalation engine:
 * - Warning → Telegram (via simulateChannel)
 * - Offline immediate → Telegram
 * - Offline lasting > N minutes → WhatsApp on-call (once)
 * - Optional auto work-order on first offline
 */
export default function useEscalationPolicy({
  simulateChannel,
  onAutoWorkOrder,
} = {}) {
  const [policy, setPolicy] = useState(() => loadPolicy());
  const [escalationLogs, setEscalationLogs] = useState([]);
  const offlineSinceRef = useRef(new Map()); // deviceId → timestamp ms
  const escalatedRef = useRef(new Set()); // deviceId already WhatsApp-escalated
  const warnedAlertRef = useRef(new Set());
  const offlineHandledRef = useRef(new Set()); // alert ids for WO / immediate TG

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
    } catch {
      /* ignore */
    }
  }, [policy]);

  const savePolicy = useCallback((next) => {
    setPolicy((prev) => mergeEscalationPolicy({ ...prev, ...next }));
  }, []);

  const resetPolicy = useCallback(() => {
    setPolicy({ ...DEFAULT_ESCALATION_POLICY });
  }, []);

  const pushLog = useCallback((message, level = 'info', extra = {}) => {
    setEscalationLogs((prev) =>
      [
        {
          id: `esc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          time: formatClock(),
          timestamp: new Date().toISOString(),
          message,
          level,
          ...extra,
        },
        ...prev,
      ].slice(0, 40),
    );
  }, []);

  const fireChannel = useCallback(
    (channel, payload, label) => {
      simulateChannel?.({
        channel,
        ...payload,
        reason: payload.reason || label,
      });
      pushLog(label, 'info', {
        channel,
        deviceId: payload.deviceId,
      });
    },
    [simulateChannel, pushLog],
  );

  /**
   * Call on each alert batch (live mode).
   */
  const processAlerts = useCallback(
    (alerts = [], devices = []) => {
      if (!policy.enabled) return;

      // Track currently offline devices from live device list
      const now = Date.now();
      const offlineIds = new Set(
        devices.filter((d) => d.status === 'offline').map((d) => d.id),
      );

      offlineIds.forEach((id) => {
        if (!offlineSinceRef.current.has(id)) {
          offlineSinceRef.current.set(id, now);
        }
      });
      // Clear recovered
      [...offlineSinceRef.current.keys()].forEach((id) => {
        if (!offlineIds.has(id)) {
          offlineSinceRef.current.delete(id);
          escalatedRef.current.delete(id);
        }
      });

      alerts.forEach((alert) => {
        if (!alert?.id) return;

        if (alert.status === 'warning' && policy.warningToTelegram) {
          if (warnedAlertRef.current.has(alert.id)) return;
          warnedAlertRef.current.add(alert.id);
          fireChannel(
            'telegram',
            {
              deviceName: alert.deviceName,
              deviceId: alert.deviceId,
              status: 'warning',
              reason: 'Escalation L1 — Warning → Telegram grup piket',
            },
            `Escalation Warning → Telegram: ${alert.deviceName || alert.deviceId}`,
          );
        }

        if (alert.status === 'offline') {
          if (offlineHandledRef.current.has(alert.id)) return;
          offlineHandledRef.current.add(alert.id);

          if (!offlineSinceRef.current.has(alert.deviceId)) {
            offlineSinceRef.current.set(alert.deviceId, now);
          }

          if (policy.offlineImmediateTelegram) {
            fireChannel(
              'telegram',
              {
                deviceName: alert.deviceName,
                deviceId: alert.deviceId,
                status: 'offline',
                reason: 'Escalation L1 — Offline → Telegram (segera)',
              },
              `Escalation Offline → Telegram: ${alert.deviceName || alert.deviceId}`,
            );
          }

          if (policy.autoCreateWorkOrderOnOffline) {
            onAutoWorkOrder?.(alert);
            pushLog(
              `Work order otomatis dibuat: ${alert.deviceName || alert.deviceId}`,
              'warn',
              { deviceId: alert.deviceId },
            );
          }
        }
      });
    },
    [policy, fireChannel, onAutoWorkOrder, pushLog],
  );

  // Periodic check for Offline duration → WhatsApp
  useEffect(() => {
    const tick = () => {
      if (!policy.enabled || !policy.offlineEscalateWhatsApp) return;
      const thresholdMs = Math.max(0.25, Number(policy.offlineEscalateAfterMinutes) || 2) * 60 * 1000;
      const now = Date.now();

      offlineSinceRef.current.forEach((since, deviceId) => {
        if (escalatedRef.current.has(deviceId)) return;
        if (now - since < thresholdMs) return;

        escalatedRef.current.add(deviceId);
        fireChannel(
          'whatsapp',
          {
            deviceId,
            deviceName: deviceId,
            status: 'offline',
            reason: `Escalation L2 — Offline > ${policy.offlineEscalateAfterMinutes} menit → WhatsApp on-call`,
          },
          `Escalation L2 WhatsApp on-call: ${deviceId} (offline > ${policy.offlineEscalateAfterMinutes} mnt)`,
        );
      });
    };

    const id = window.setInterval(tick, CHECK_MS);
    tick();
    return () => window.clearInterval(id);
  }, [policy, fireChannel]);

  return {
    policy,
    savePolicy,
    resetPolicy,
    escalationLogs,
    processAlerts,
  };
}
