import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'omniwatch-wall-display';

function loadWallPref() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Wall / command-center display mode + browser fullscreen.
 */
export default function useWallDisplay() {
  const [wallMode, setWallMode] = useState(() => loadWallPref());
  const [isFullscreen, setIsFullscreen] = useState(
    () => Boolean(document.fullscreenElement),
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, wallMode ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [wallMode]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      if (!document.fullscreenElement) {
        // Keep wall layout even if user exits OS fullscreen with Esc
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* permission / unsupported */
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  }, []);

  const enableWall = useCallback(async () => {
    setWallMode(true);
    await enterFullscreen();
  }, [enterFullscreen]);

  const disableWall = useCallback(async () => {
    setWallMode(false);
    await exitFullscreen();
  }, [exitFullscreen]);

  const toggleWall = useCallback(async () => {
    if (wallMode) {
      await disableWall();
    } else {
      await enableWall();
    }
  }, [wallMode, enableWall, disableWall]);

  return {
    wallMode,
    isFullscreen,
    enableWall,
    disableWall,
    toggleWall,
  };
}
