import {
  Activity,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  LayoutGrid,
  Waves,
} from 'lucide-react';

const DEVICE_ICON_MAP = {
  Semua: LayoutGrid,
  Seismometer: Waves,
  AWS: CloudSun,
  'Tide Gauge': Droplets,
  Accelerograph: Gauge,
  ARG: CloudRain,
};

const DEVICE_TINT_MAP = {
  Semua:
    'text-sky-600 bg-sky-50 ring-sky-200 dark:text-sky-300 dark:bg-sky-500/10 dark:ring-sky-400/20',
  Seismometer:
    'text-violet-600 bg-violet-50 ring-violet-200 dark:text-violet-300 dark:bg-violet-500/10 dark:ring-violet-400/20',
  AWS:
    'text-amber-600 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:ring-amber-400/20',
  'Tide Gauge':
    'text-cyan-600 bg-cyan-50 ring-cyan-200 dark:text-cyan-300 dark:bg-cyan-500/10 dark:ring-cyan-400/20',
  Accelerograph:
    'text-rose-600 bg-rose-50 ring-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:ring-rose-400/20',
  ARG:
    'text-teal-600 bg-teal-50 ring-teal-200 dark:text-teal-300 dark:bg-teal-500/10 dark:ring-teal-400/20',
};

export function getDeviceIcon(type) {
  return DEVICE_ICON_MAP[type] ?? Activity;
}

export function getDeviceTint(type) {
  return (
    DEVICE_TINT_MAP[type] ??
    'text-slate-600 bg-slate-50 ring-slate-200 dark:text-slate-300 dark:bg-slate-500/10 dark:ring-slate-400/20'
  );
}

export function DeviceTypeIcon({ type, className = 'h-4 w-4' }) {
  const Icon = getDeviceIcon(type);
  return <Icon className={className} strokeWidth={2} />;
}
