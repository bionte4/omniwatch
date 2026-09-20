import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THRESHOLDS } from '../data/thresholds';

const STORAGE_KEY = 'omniwatch-alert-thresholds';

function loadThresholds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_THRESHOLDS);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_THRESHOLDS), ...parsed };
  } catch {
    return structuredClone(DEFAULT_THRESHOLDS);
  }
}

export default function useThresholds() {
  const [thresholds, setThresholds] = useState(() => loadThresholds());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thresholds));
    } catch {
      /* ignore */
    }
  }, [thresholds]);

  const updateType = useCallback((type, patch) => {
    setThresholds((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...patch,
        warning: Number(patch.warning ?? prev[type]?.warning),
        critical: Number(patch.critical ?? prev[type]?.critical),
      },
    }));
  }, []);

  const saveAll = useCallback((next) => {
    setThresholds({ ...structuredClone(DEFAULT_THRESHOLDS), ...next });
  }, []);

  const resetDefaults = useCallback(() => {
    setThresholds(structuredClone(DEFAULT_THRESHOLDS));
  }, []);

  return { thresholds, updateType, saveAll, resetDefaults };
}
