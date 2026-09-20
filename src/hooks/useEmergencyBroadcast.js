import { useCallback, useEffect, useRef, useState } from 'react';

const CHANNELS_KEY = 'omniwatch-broadcast-channels';
const MAX_LOGS = 40;

const DEFAULT_CHANNELS = {
  telegramEnabled: true,
  telegramTarget: 'Grup Petugas Piket',
  whatsappEnabled: true,
  whatsappTarget: '+6281234567890',
  autoBroadcast: true,
};

function loadChannels() {
  try {
    const raw = localStorage.getItem(CHANNELS_KEY);
    if (!raw) return { ...DEFAULT_CHANNELS };
    return { ...DEFAULT_CHANNELS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CHANNELS };
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

function buildMessages(channels, payload) {
  const { deviceName, deviceId, status, reason } = payload;
  const time = formatClock();
  const statusTag = (status || 'CRITICAL').toUpperCase();
  const body = `[${time}] [DARURAT ${statusTag}] ${deviceName || 'Perangkat'} (${deviceId || '—'}) — ${reason || 'Anomali kritis terdeteksi'}`;

  const entries = [];

  if (channels.telegramEnabled && channels.telegramTarget?.trim()) {
    entries.push({
      channel: 'telegram',
      target: channels.telegramTarget.trim(),
      message: `Pesan terkirim via Telegram ke ${channels.telegramTarget.trim()}`,
      detail: body,
    });
  }

  if (channels.whatsappEnabled && channels.whatsappTarget?.trim()) {
    entries.push({
      channel: 'whatsapp',
      target: channels.whatsappTarget.trim(),
      message: `Pesan terkirim via WhatsApp ke ${channels.whatsappTarget.trim()}`,
      detail: body,
    });
  }

  if (!entries.length) {
    entries.push({
      channel: 'none',
      target: '—',
      message: 'Broadcast dilewati — belum ada channel aktif terdaftar',
      detail: body,
    });
  }

  return entries;
}

/**
 * Simulated emergency broadcast (Telegram / WhatsApp) — no real API calls.
 */
export default function useEmergencyBroadcast() {
  const [channels, setChannels] = useState(() => loadChannels());
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const sentAlertIdsRef = useRef(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
    } catch {
      /* ignore */
    }
  }, [channels]);

  const saveChannels = useCallback((next) => {
    setChannels((prev) => ({ ...prev, ...next }));
  }, []);

  const simulateBroadcast = useCallback(
    (payload, { force = false, channelsOnly = null } = {}) => {
      if (!force && !channels.autoBroadcast) {
        return [];
      }

      let entries = buildMessages(channels, payload);
      if (channelsOnly?.length) {
        const allow = new Set(channelsOnly);
        entries = entries.filter((e) => allow.has(e.channel));
        if (!entries.length) {
          entries = [
            {
              channel: channelsOnly[0],
              target:
                channelsOnly[0] === 'telegram'
                  ? channels.telegramTarget
                  : channels.whatsappTarget,
              message: `Pesan terkirim via ${channelsOnly[0] === 'telegram' ? 'Telegram' : 'WhatsApp'} (escalation)`,
              detail: `[Escalation] ${payload.reason || payload.deviceName || ''}`,
            },
          ];
        }
      }

      const stamped = entries.map((entry) => ({
        id: `bc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        time: formatClock(),
        ...entry,
        ...payload,
      }));

      setBroadcastLogs((prev) => [...stamped, ...prev].slice(0, MAX_LOGS));
      return stamped;
    },
    [channels],
  );

  /** Fire a single simulated channel (used by escalation policy). */
  const simulateChannel = useCallback(
    (payload) => {
      const channel = payload.channel === 'whatsapp' ? 'whatsapp' : 'telegram';
      return simulateBroadcast(
        {
          deviceName: payload.deviceName,
          deviceId: payload.deviceId,
          status: payload.status,
          reason: payload.reason,
        },
        { force: true, channelsOnly: [channel] },
      );
    },
    [simulateBroadcast],
  );

  const testBroadcast = useCallback(() => {
    return simulateBroadcast(
      {
        deviceName: 'OmniWatch Test Beacon',
        deviceId: 'TEST-ALERT',
        status: 'offline',
        reason: 'Uji Manual — Test Broadcast Alert dari Header',
      },
      { force: true },
    );
  }, [simulateBroadcast]);

  /**
   * Legacy auto-broadcast — disabled when escalation engine handles routing.
   * Kept for Test Broadcast + manual force.
   */
  const processAlertBroadcasts = useCallback(
    (alerts = [], { skip = false } = {}) => {
      if (skip || !channels.autoBroadcast) return;

      alerts.forEach((alert) => {
        if (!alert?.id) return;
        if (sentAlertIdsRef.current.has(alert.id)) return;
        if (alert.status !== 'offline' && alert.status !== 'warning') return;

        sentAlertIdsRef.current.add(alert.id);
        simulateBroadcast({
          deviceName: alert.deviceName,
          deviceId: alert.deviceId,
          status: alert.status,
          reason:
            alert.status === 'offline'
              ? 'Perangkat Offline — koneksi terputus'
              : 'Anomali kritis / Warning terdeteksi',
        });
      });
    },
    [channels.autoBroadcast, simulateBroadcast],
  );

  const clearBroadcastLogs = useCallback(() => {
    setBroadcastLogs([]);
  }, []);

  return {
    channels,
    saveChannels,
    broadcastLogs,
    simulateBroadcast,
    simulateChannel,
    testBroadcast,
    processAlertBroadcasts,
    clearBroadcastLogs,
  };
}
