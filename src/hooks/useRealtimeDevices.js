import { useEffect, useRef, useState } from 'react';
import { STATUS_META } from '../data/mockDevices';
import { resolveWsUrl } from '../config/ws';

const HIGHLIGHT_MS = 8000;
const MAX_ALERTS = 50;
const RECONNECT_MS = 3000;

function formatClock(date = new Date()) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

function buildAlert(device, previousStatus, nextStatus) {
  const time = formatClock();
  const tag = nextStatus.toUpperCase();
  let detail;

  if (nextStatus === 'warning') {
    detail = `${device.type} ${device.name} terdeteksi Warning - Lonjakan pembacaan`;
  } else if (nextStatus === 'offline') {
    detail = `${device.type} ${device.name} terputus`;
  } else {
    detail = `${device.type} ${device.name} kembali Normal`;
  }

  return {
    id: `${device.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    deviceId: device.id,
    deviceName: device.name,
    deviceType: device.type,
    region: device.region,
    status: nextStatus,
    previousStatus,
    time,
    timestamp: new Date().toISOString(),
    message: `[${time}] [${tag}] ${detail}`,
    color: STATUS_META[nextStatus]?.color ?? '#94a3b8',
  };
}

function normalizeDevices(payload) {
  if (!payload) return null;

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload.devices)) return payload.devices;

  if (payload.device && payload.device.id) return null; // single update handled separately

  return null;
}

function diffAlertsAndHighlights(prevDevices, nextDevices) {
  const prevMap = new Map(prevDevices.map((d) => [d.id, d]));
  const alerts = [];
  const highlightIds = [];

  nextDevices.forEach((device) => {
    const prev = prevMap.get(device.id);
    if (!prev) return;
    if (prev.status === device.status) return;

    alerts.push(buildAlert(device, prev.status, device.status));
    if (device.status === 'warning' || device.status === 'offline') {
      highlightIds.push(device.id);
    }
  });

  return { alerts, highlightIds };
}

/**
 * Live device state via WebSocket.
 * Expects server messages like:
 *   { "type": "devices", "devices": [ ... ] }
 *   { "type": "device_update", "device": { ... } }
 *   or a raw JSON array of devices
 */
export default function useRealtimeDevices(initialDevices = [], wsUrl) {
  const resolvedUrl = resolveWsUrl(wsUrl);
  const [devices, setDevices] = useState(() =>
    initialDevices.map((d) => ({ ...d })),
  );
  const [alerts, setAlerts] = useState([]);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [lastSync, setLastSync] = useState(() => new Date().toISOString());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const devicesRef = useRef(devices);
  const highlightTimers = useRef(new Map());
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const intentionalCloseRef = useRef(false);

  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  useEffect(() => {
    const timers = highlightTimers.current;
    const targetUrl = resolvedUrl;

    const applyHighlights = (ids) => {
      if (!ids.length) return;
      setHighlightedIds((prev) => [...new Set([...prev, ...ids])]);
      ids.forEach((id) => {
        const existing = timers.get(id);
        if (existing) clearTimeout(existing);
        timers.set(
          id,
          setTimeout(() => {
            setHighlightedIds((prev) => prev.filter((x) => x !== id));
            timers.delete(id);
          }, HIGHLIGHT_MS),
        );
      });
    };

    const applyDeviceList = (nextList) => {
      if (!Array.isArray(nextList) || !nextList.length) return;

      const prev = devicesRef.current;
      const { alerts: newAlerts, highlightIds } = diffAlertsAndHighlights(
        prev,
        nextList,
      );

      devicesRef.current = nextList;
      setDevices(nextList);
      setLastSync(new Date().toISOString());

      if (newAlerts.length) {
        setAlerts((prevAlerts) =>
          [...newAlerts, ...prevAlerts].slice(0, MAX_ALERTS),
        );
      }
      applyHighlights(highlightIds);
    };

    const applySingleDevice = (device) => {
      if (!device?.id) return;
      const prev = devicesRef.current;
      const next = prev.map((d) => (d.id === device.id ? { ...d, ...device } : d));
      const exists = prev.some((d) => d.id === device.id);
      const nextList = exists ? next : [...prev, device];
      applyDeviceList(nextList);
    };

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data?.type === 'device_update' && data.device) {
          applySingleDevice(data.device);
          return;
        }

        if (data?.type === 'alert' && data.alert) {
          setAlerts((prevAlerts) =>
            [data.alert, ...prevAlerts].slice(0, MAX_ALERTS),
          );
          return;
        }

        const list = normalizeDevices(data);
        if (list) {
          applyDeviceList(list);
        }
      } catch (err) {
        console.warn('[OmniWatch] Gagal parse pesan WebSocket:', err);
      }
    };

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const connect = () => {
      clearReconnectTimer();
      intentionalCloseRef.current = false;

      // Avoid duplicate sockets
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      setConnectionStatus('connecting');

      let socket;
      try {
        socket = new WebSocket(targetUrl);
      } catch (err) {
        console.warn('[OmniWatch] WebSocket gagal dibuat:', err);
        setConnectionStatus('disconnected');
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_MS);
        return;
      }

      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('connected');
        try {
          socket.send(JSON.stringify({ type: 'subscribe', channel: 'devices' }));
        } catch {
          /* ignore send errors on open */
        }
      };

      socket.onmessage = handleMessage;

      socket.onerror = () => {
        // onclose will follow; mark disconnected for UI feedback
        setConnectionStatus('disconnected');
      };

      socket.onclose = () => {
        setConnectionStatus('disconnected');
        socketRef.current = null;

        if (!intentionalCloseRef.current) {
          reconnectTimerRef.current = setTimeout(connect, RECONNECT_MS);
        }
      };
    };

    connect();

    return () => {
      intentionalCloseRef.current = true;
      clearReconnectTimer();

      const socket = socketRef.current;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
        socketRef.current = null;
      }

      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [resolvedUrl]);

  return {
    devices,
    alerts,
    highlightedIds,
    lastSync,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    intervalMs: null,
    wsUrl: resolvedUrl,
    clearAlerts: () => setAlerts([]),
  };
}
