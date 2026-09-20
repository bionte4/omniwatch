import { Clock3, MapPin } from 'lucide-react';
import { formatLastUpdate } from '../data/mockDevices';
import { DeviceTypeIcon, getDeviceTint } from './DeviceTypeIcon';
import StatusBadge from './StatusBadge';

export default function DeviceList({
  devices,
  selectedId,
  highlightedIds = [],
  onSelect,
}) {
  if (!devices.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-8 text-center dark:border-slate-700/80 dark:bg-slate-950/40">
        <p className="text-sm text-slate-500">Tidak ada perangkat untuk filter ini.</p>
      </div>
    );
  }

  return (
    <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1">
      {devices.map((device) => {
        const isSelected = selectedId === device.id;
        const isHighlighted = highlightedIds.includes(device.id);
        const isAlertStatus = device.status === 'warning' || device.status === 'offline';
        const tint = getDeviceTint(device.type);

        let cardClass =
          'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700/70 dark:bg-slate-950/45 dark:hover:border-slate-500 dark:hover:bg-slate-800/55';

        if (isSelected) {
          cardClass =
            'border-sky-300 bg-sky-50 shadow-sm dark:border-sky-400/45 dark:bg-sky-500/10 dark:shadow-[0_0_0_1px_rgba(56,189,248,0.15)]';
        }

        if (isHighlighted && isAlertStatus) {
          cardClass =
            device.status === 'offline'
              ? 'device-alert-pulse-offline border-red-400/70 bg-red-50 dark:border-red-500/55 dark:bg-red-500/10'
              : 'device-alert-pulse-warning border-amber-400/70 bg-amber-50 dark:border-amber-500/55 dark:bg-amber-500/10';
        }

        return (
          <li key={device.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect?.(device)}
              className={`group w-full rounded-xl border px-3 py-2.5 text-left shadow-sm transition duration-200 dark:shadow-none ${cardClass}`}
            >
              <div className="mb-2 flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition group-hover:scale-[1.03] ${tint}`}
                >
                  <DeviceTypeIcon type={device.type} className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {device.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {device.id} · {device.type}
                      </p>
                    </div>
                    <StatusBadge
                      status={device.status}
                      pulse={isHighlighted && isAlertStatus}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex min-w-0 items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-600" />
                      <span className="truncate">{device.location}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1">
                      <Clock3 className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                      {formatLastUpdate(device.lastUpdate)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
