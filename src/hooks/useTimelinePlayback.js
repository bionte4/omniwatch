import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TIMELINE_MAX_MINUTES,
  TIMELINE_STEP_MINUTES,
  TIMELINE_WINDOW_MS,
} from '../utils/timelineHistory';

const PLAY_INTERVAL_MS = 700;

/**
 * Controls 24h timeline scrubber + autoplay.
 * `offsetMinutes` = minutes from window start (0 = 24h ago, MAX = now).
 */
export default function useTimelinePlayback() {
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [offsetMinutes, setOffsetMinutes] = useState(TIMELINE_MAX_MINUTES);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(null);

  // Keep "now" fresh while playing / every minute
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const windowStart = useMemo(
    () => nowTick - TIMELINE_WINDOW_MS,
    [nowTick],
  );

  const selectedTime = useMemo(
    () => new Date(windowStart + offsetMinutes * 60 * 1000),
    [windowStart, offsetMinutes],
  );

  const isLive = offsetMinutes >= TIMELINE_MAX_MINUTES - 1;

  const jumpToLive = useCallback(() => {
    setPlaying(false);
    setNowTick(Date.now());
    setOffsetMinutes(TIMELINE_MAX_MINUTES);
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying((prev) => {
      if (!prev && offsetMinutes >= TIMELINE_MAX_MINUTES) {
        // Restart from beginning of window when already at live
        setOffsetMinutes(0);
      }
      return !prev;
    });
  }, [offsetMinutes]);

  useEffect(() => {
    if (!playing) {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
      return undefined;
    }

    playRef.current = setInterval(() => {
      setOffsetMinutes((prev) => {
        const next = Math.min(
          TIMELINE_MAX_MINUTES,
          prev + TIMELINE_STEP_MINUTES,
        );
        if (next >= TIMELINE_MAX_MINUTES) {
          setPlaying(false);
          setNowTick(Date.now());
          return TIMELINE_MAX_MINUTES;
        }
        return next;
      });
    }, PLAY_INTERVAL_MS);

    return () => {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [playing]);

  const onSliderChange = useCallback((value) => {
    setPlaying(false);
    setOffsetMinutes(Number(value));
  }, []);

  return {
    offsetMinutes,
    selectedTime,
    isLive,
    playing,
    windowStart: new Date(windowStart),
    windowEnd: new Date(nowTick),
    stepMinutes: TIMELINE_STEP_MINUTES,
    maxMinutes: TIMELINE_MAX_MINUTES,
    setOffsetMinutes: onSliderChange,
    togglePlay,
    jumpToLive,
    setPlaying,
  };
}
