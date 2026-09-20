import { STATUS_META } from '../data/mockDevices';

const GRADIENT_BADGE = {
  normal:
    'border-emerald-300/60 bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent text-emerald-700 dark:border-emerald-400/30 dark:from-emerald-500/25 dark:via-emerald-500/10 dark:to-transparent dark:text-emerald-300',
  warning:
    'border-amber-300/60 bg-gradient-to-r from-amber-100 via-amber-50 to-transparent text-amber-700 dark:border-amber-400/30 dark:from-amber-500/25 dark:via-amber-500/10 dark:to-transparent dark:text-amber-300',
  offline:
    'border-red-300/60 bg-gradient-to-r from-red-100 via-red-50 to-transparent text-red-700 dark:border-red-400/30 dark:from-red-500/25 dark:via-red-500/10 dark:to-transparent dark:text-red-300',
};

export default function StatusBadge({ status, pulse = false, size = 'sm' }) {
  const meta = STATUS_META[status] ?? STATUS_META.offline;
  const gradient = GRADIENT_BADGE[status] ?? GRADIENT_BADGE.offline;
  const sizeClass =
    size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border font-semibold uppercase tracking-wide ${gradient} ${sizeClass} ${
        pulse ? 'animate-pulse' : ''
      }`}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
