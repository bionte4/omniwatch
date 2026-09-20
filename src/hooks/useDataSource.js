import { useCallback, useEffect, useState } from 'react';
import { resolveWsUrl } from '../config/ws';

const STORAGE_KEY = 'omniwatch-data-source';

export const DATA_SOURCE_MODES = {
  SIMULATION: 'simulation',
  GATEWAY: 'gateway',
};

const DEFAULTS = {
  mode: DATA_SOURCE_MODES.SIMULATION,
  gatewayUrl: '',
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Choose between built-in simulation WS and a custom field gateway URL.
 */
export default function useDataSource() {
  const [config, setConfig] = useState(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }, [config]);

  const save = useCallback((patch) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const activeWsUrl =
    config.mode === DATA_SOURCE_MODES.GATEWAY && config.gatewayUrl?.trim()
      ? config.gatewayUrl.trim()
      : resolveWsUrl();

  return {
    config,
    save,
    mode: config.mode,
    gatewayUrl: config.gatewayUrl,
    activeWsUrl,
    isGateway: config.mode === DATA_SOURCE_MODES.GATEWAY,
  };
}
