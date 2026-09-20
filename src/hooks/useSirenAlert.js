import { useCallback, useEffect, useRef, useState } from 'react';

const MUTE_KEY = 'omniwatch-alarm-muted';

/**
 * Web Audio API siren/beep for warning & offline status changes.
 * Requires a user gesture before browsers allow audio (toggle unmute).
 */
export default function useSirenAlert() {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef(null);
  const lastPlayedRef = useRef(0);

  const ensureContext = useCallback(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  }, []);

  const resumeContext = useCallback(async () => {
    const ctx = ensureContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* autoplay policy */
      }
    }
    return ctx;
  }, [ensureContext]);

  useEffect(() => {
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [muted]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const playTone = useCallback(
    async (frequency, durationMs, type = 'square', gainValue = 0.08) => {
      if (muted) return;
      const ctx = await resumeContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + durationMs / 1000 + 0.05);
    },
    [muted, resumeContext],
  );

  const playSiren = useCallback(
    async (severity = 'warning') => {
      if (muted) return;

      const now = Date.now();
      if (now - lastPlayedRef.current < 900) return;
      lastPlayedRef.current = now;

      if (severity === 'offline') {
        await playTone(880, 140, 'square', 0.1);
        setTimeout(() => playTone(660, 160, 'square', 0.1), 160);
        setTimeout(() => playTone(990, 180, 'sawtooth', 0.09), 340);
      } else {
        await playTone(740, 120, 'triangle', 0.07);
        setTimeout(() => playTone(920, 140, 'triangle', 0.07), 150);
      }
    },
    [muted, playTone],
  );

  const toggleMute = useCallback(async () => {
    setMuted((prev) => {
      const next = !prev;
      // Unmuting counts as user gesture — unlock AudioContext
      if (prev === true) {
        resumeContext();
      }
      return next;
    });
  }, [resumeContext]);

  return {
    muted,
    setMuted,
    toggleMute,
    playSiren,
  };
}
