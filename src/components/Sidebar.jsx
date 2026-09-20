import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  RadioTower,
  WifiOff,
} from 'lucide-react';
import DeviceList from './DeviceList';
import SlaUptimePanel from './SlaUptimePanel';
import { DeviceTypeIcon, getDeviceTint } from './DeviceTypeIcon';
import { DEVICE_TYPES, getDeviceStats } from '../data/mockDevices';

function StatCard({ label, value, icon: Icon, tone = 'neutral' }) {
  const tones = {
    neutral: {
      wrap: 'border-gray-200 from-white to-gray-50 hover:border-gray-300 dark:border-slate-700/80 dark:from-slate-800/80 dark:to-slate-900/40 dark:hover:border-slate-500/80',
      value: 'text-slate-900 dark:text-slate-100',
      icon: 'text-sky-600 bg-sky-50 ring-sky-200 dark:text-sky-300 dark:bg-sky-500/10 dark:ring-sky-400/20',
      bar: 'from-sky-400/60 to-transparent',
    },
    normal: {
      wrap: 'border-emerald-200 from-emerald-50 to-white hover:border-emerald-300 dark:border-emerald-500/25 dark:from-emerald-950/40 dark:to-slate-900/40 dark:hover:border-emerald-400/40',
      value: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 bg-emerald-50 ring-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:ring-emerald-400/20',
      bar: 'from-emerald-400/70 to-transparent',
    },
    warning: {
      wrap: 'border-amber-200 from-amber-50 to-white hover:border-amber-300 dark:border-amber-500/25 dark:from-amber-950/40 dark:to-slate-900/40 dark:hover:border-amber-400/40',
      value: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:ring-amber-400/20',
      bar: 'from-amber-400/70 to-transparent',
    },
    offline: {
      wrap: 'border-red-200 from-red-50 to-white hover:border-red-300 dark:border-red-500/25 dark:from-red-950/40 dark:to-slate-900/40 dark:hover:border-red-400/40',
      value: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 bg-red-50 ring-red-200 dark:text-red-300 dark:bg-red-500/10 dark:ring-red-400/20',
      bar: 'from-red-400/70 to-transparent',
    },
  };

  const t = tones[tone] ?? tones.neutral;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br p-3 shadow-sm transition duration-200 hover:shadow-md dark:shadow-none dark:hover:shadow-[0_0_0_1px_rgba(148,163,184,0.08)] ${t.wrap}`}
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${t.bar}`} />
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className={`rounded-lg p-1 ring-1 ${t.icon}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className={`text-2xl font-semibold tabular-nums tracking-tight ${t.value}`}>
        {value}
      </p>
    </div>
  );
}

export default function Sidebar({
  devices,
  filteredDevices,
  selectedType,
  onTypeChange,
  selectedId,
  highlightedIds = [],
  onSelectDevice,
  slaMetrics,
  regionLabel,
}) {
  const stats = getDeviceStats(devices);

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-gray-200 bg-white transition-colors duration-300 dark:border-slate-700/80 dark:bg-slate-900 md:w-[22rem] lg:w-[26rem]">
      <div className="shrink-0 border-b border-gray-200 px-4 py-3 dark:border-slate-700/80">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Ringkasan Perangkat
        </h2>
        <p className="text-[11px] text-slate-500">
          {regionLabel
            ? `Status jaringan · ${regionLabel}`
            : 'Status jaringan sensor BMKG'}
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2.5 border-b border-gray-200 p-3 dark:border-slate-700/80">
        <StatCard label="Total" value={stats.total} icon={RadioTower} tone="neutral" />
        <StatCard label="Normal" value={stats.normal} icon={CheckCircle2} tone="normal" />
        <StatCard label="Warning" value={stats.warning} icon={AlertTriangle} tone="warning" />
        <StatCard label="Offline" value={stats.offline} icon={WifiOff} tone="offline" />
      </div>

      <SlaUptimePanel metrics={slaMetrics} regionLabel={regionLabel} />

      <div className="shrink-0 border-b border-gray-200 px-4 py-3 dark:border-slate-700/80">
        <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Filter className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
          Filter Jenis Perangkat
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEVICE_TYPES.map((type) => {
            const active = selectedType === type;
            const tint = getDeviceTint(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => onTypeChange(type)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition duration-200 ${
                  active
                    ? 'border-sky-300 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-400/45 dark:bg-sky-500/15 dark:text-sky-200 dark:shadow-[0_0_0_1px_rgba(56,189,248,0.12)]'
                    : 'border-gray-200 bg-gray-50 text-slate-500 hover:border-gray-300 hover:bg-white hover:text-slate-700 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <span className={`rounded-md p-0.5 ring-1 ${tint}`}>
                  <DeviceTypeIcon type={type} className="h-3 w-3" />
                </span>
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
        <div className="mb-2 flex shrink-0 items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Daftar Perangkat
          </h3>
          <span className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-500 dark:border-slate-700/80 dark:bg-slate-950/50 dark:text-slate-400">
            {filteredDevices.length}
          </span>
        </div>
        <DeviceList
          devices={filteredDevices}
          selectedId={selectedId}
          highlightedIds={highlightedIds}
          onSelect={onSelectDevice}
        />
      </div>
    </aside>
  );
}
