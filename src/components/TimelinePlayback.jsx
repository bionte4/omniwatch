import {
  History,
  Pause,
  Play,
  Radio,
  SkipForward,
} from 'lucide-react';
import {
  formatTimelineClock,
  TIMELINE_MAX_MINUTES,
} from '../utils/timelineHistory';

export default function TimelinePlayback({
  offsetMinutes,
  selectedTime,
  isLive,
  playing,
  windowStart,
  windowEnd,
  stepMinutes,
  maxMinutes = TIMELINE_MAX_MINUTES,
  onSliderChange,
  onTogglePlay,
  onJumpToLive,
}) {
  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 right-3 z-[1100] rounded-xl border border-gray-200/90 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-md bg-violet-50 p-1 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-400/30">
            <History className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Timeline Playback · 24 jam
            </p>
            <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">
              {isLive ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                  <Radio className="h-3 w-3" />
                  LIVE — data real-time
                </span>
              ) : (
                <>Riwayat: {formatTimelineClock(selectedTime)}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold transition ${
              playing
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300'
                : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300'
            }`}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? 'Pause' : 'Play'}
          </button>

          <button
            type="button"
            onClick={onJumpToLive}
            disabled={isLive && !playing}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700 transition enabled:hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            title="Kembali ke Live"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Live
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden w-28 shrink-0 text-[10px] text-slate-500 sm:block">
          {formatTimelineClock(windowStart)}
        </span>

        <input
          type="range"
          min={0}
          max={maxMinutes}
          step={stepMinutes}
          value={offsetMinutes}
          onChange={(e) => onSliderChange(Number(e.target.value))}
          aria-label="Slider riwayat waktu 24 jam"
          className="ow-timeline-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700"
        />

        <span className="hidden w-28 shrink-0 text-right text-[10px] text-slate-500 sm:block">
          {formatTimelineClock(windowEnd)}
        </span>
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-slate-400 sm:hidden">
        <span>-24 jam</span>
        <span>Sekarang</span>
      </div>
    </div>
  );
}
