import { useCallback, useEffect, useRef, useState } from 'react';

const PREF_KEY = 'omniwatch-desktop-notify';

function loadPref() {
  try {
    return localStorage.getItem(PREF_KEY) !== '0';
  } catch {
    return true;
  }
}

/**
 * Web Notification for critical Offline alerts.
 */
export default function useDesktopNotifications({ enabled = true } = {}) {
  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );
  const [prefEnabled, setPrefEnabled] = useState(() => loadPref());
  const seenRef = useRef(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, prefEnabled ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [prefEnabled]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') setPrefEnabled(true);
      return result;
    } catch {
      setPermission('denied');
      return 'denied';
    }
  }, []);

  const togglePref = useCallback(() => {
    setPrefEnabled((v) => !v);
  }, []);

  const notifyOffline = useCallback(
    (alert) => {
      if (!enabled || !prefEnabled) return;
      if (typeof Notification === 'undefined') return;
      if (Notification.permission !== 'granted') return;
      if (!alert?.id || alert.status !== 'offline') return;
      if (seenRef.current.has(alert.id)) return;
      seenRef.current.add(alert.id);

      // Cap memory of seen ids
      if (seenRef.current.size > 200) {
        const arr = [...seenRef.current];
        seenRef.current = new Set(arr.slice(-100));
      }

      const title = 'OmniWatch — Offline Kritis';
      const body = `${alert.deviceName || alert.deviceId || 'Perangkat'} terputus dari jaringan monitoring.`;

      try {
        const n = new Notification(title, {
          body,
          tag: `offline-${alert.deviceId || alert.id}`,
          renotify: true,
          requireInteraction: false,
          silent: false,
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch {
        /* ignore */
      }
    },
    [enabled, prefEnabled],
  );

  const processAlerts = useCallback(
    (alerts = []) => {
      alerts.forEach((alert) => {
        if (alert.status === 'offline') notifyOffline(alert);
      });
    },
    [notifyOffline],
  );

  return {
    supported: typeof Notification !== 'undefined',
    permission,
    prefEnabled,
    requestPermission,
    togglePref,
    processAlerts,
    notifyOffline,
  };
}
