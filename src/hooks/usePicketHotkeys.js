import { useEffect, useRef } from 'react';

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Picket hotkeys for OmniWatch command center.
 *
 * M — mute/unmute
 * C — clear alert log
 * [ / ] or ← / → — loncat stasiun
 * F — toggle wall display
 * ? — toggle hotkey help
 * Esc — exit wall mode
 */
export default function usePicketHotkeys({
  enabled = true,
  onToggleMute,
  onClearAlerts,
  onCycleRegion,
  onToggleWall,
  onExitWall,
  onToggleHelp,
  canMute = true,
}) {
  const handlersRef = useRef({});

  useEffect(() => {
    handlersRef.current = {
      onToggleMute,
      onClearAlerts,
      onCycleRegion,
      onToggleWall,
      onExitWall,
      onToggleHelp,
      canMute,
    };
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const onKeyDown = (event) => {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const h = handlersRef.current;
      const key = event.key;

      if (key === '?' || (event.shiftKey && key === '/')) {
        event.preventDefault();
        h.onToggleHelp?.();
        return;
      }

      if (key === 'Escape') {
        h.onExitWall?.();
        return;
      }

      const lower = key.toLowerCase();

      if (lower === 'm' && h.canMute) {
        event.preventDefault();
        h.onToggleMute?.();
        return;
      }

      if (lower === 'c') {
        event.preventDefault();
        h.onClearAlerts?.();
        return;
      }

      if (lower === 'f') {
        event.preventDefault();
        h.onToggleWall?.();
        return;
      }

      if (key === '[' || key === 'ArrowLeft') {
        event.preventDefault();
        h.onCycleRegion?.(-1);
        return;
      }

      if (key === ']' || key === 'ArrowRight') {
        event.preventDefault();
        h.onCycleRegion?.(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
