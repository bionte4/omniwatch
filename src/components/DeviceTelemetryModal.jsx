import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Battery,
  Phone,
  Signal,
  Mail,
  UserRound,
  X,
  Activity,
  CalendarClock,
  SlidersHorizontal,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { DeviceTypeIcon, getDeviceTint } from './DeviceTypeIcon';
import { formatLastUpdate } from '../data/mockDevices';
import { useTheme } from '../context/ThemeContext';
import {
  buildTelemetrySeries,
  getTechnicianForRegion,
  signalToRssi,
} from '../utils/telemetrySeries';
import {
  formatCalibrationDate,
  getCalibrationInfo,
} from '../utils/calibration';
import {
  evaluateReading,
  getThresholdForType,
} from '../data/thresholds';

export default function DeviceTelemetryModal({
  device,
  open,
  onClose,
  thresholds,
}) {
  const { isDark } = useTheme();

  const { config, points } = useMemo(
    () => (device ? buildTelemetrySeries(device) : { config: null, points: [] }),
    [device],
  );

  const technician = useMemo(
    () => getTechnicianForRegion(device?.region),
    [device?.region],
  );

  const calibration = useMemo(
    () => (device ? getCalibrationInfo(device) : null),
    [device],
  );

  const threshold = useMemo(
    () => (device ? getThresholdForType(thresholds, device.type) : null),
    [thresholds, device],
  );

  const latestReading = points.length ? points[points.length - 1].value : null;
  const readingLevel = evaluateReading(threshold, latestReading);

  if (!open || !device || !config) return null;

  const rssi = signalToRssi(device.signal);
  const tint = getDeviceTint(device.type);
  const chartStroke = config.color;
  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const tickFill = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Tutup modal"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="telemetry-title"
        className={`relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${
          isDark
            ? 'border-slate-700 bg-slate-900 text-slate-100'
            : 'border-gray-200 bg-white text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          }`}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tint}`}
            >
              <DeviceTypeIcon type={device.type} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 id="telemetry-title" className="truncate text-base font-semibold">
                  {device.name}
                </h2>
                <StatusBadge status={device.status} />
              </div>
              <p className="text-xs text-slate-500">
                {device.id} · {device.type} · {device.location}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Update terakhir: {formatLastUpdate(device.lastUpdate)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg border p-1.5 transition ${
              isDark
                ? 'border-slate-700 hover:bg-slate-800'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* Tech metrics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard
              icon={Signal}
              label="Kekuatan Sinyal (RSSI)"
              value={`${rssi} dBm`}
              hint={`${device.signal ?? 0}% kualitas tautan`}
              isDark={isDark}
            />
            <MetricCard
              icon={Battery}
              label="Baterai / Daya Cadangan"
              value={`${device.battery ?? 0}%`}
              hint={
                (device.battery ?? 0) < 20
                  ? 'Daya kritis — ganti segera'
                  : 'Cadangan operasional stabil'
              }
              isDark={isDark}
            />
            <MetricCard
              icon={Activity}
              label="Koordinat"
              value={`${device.lat.toFixed(4)}, ${device.lng.toFixed(4)}`}
              hint="WGS 84"
              isDark={isDark}
            />
          </div>

          {/* Chart */}
          <div
            className={`rounded-xl border p-4 ${
              isDark ? 'border-slate-700 bg-slate-950/50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="mb-3 flex items-end justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">{config.title}</h3>
                <p className="text-[11px] text-slate-500">
                  Tren 24 jam terakhir · satuan {config.unit}
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="telemetryFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartStroke} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={chartStroke} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: tickFill, fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: gridStroke }}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fill: tickFill, fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: gridStroke }}
                    width={42}
                    unit={` ${config.unit}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#0f172a' : '#fff',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
                    formatter={(value) => [`${value} ${config.unit}`, config.title]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartStroke}
                    strokeWidth={2}
                    fill="url(#telemetryFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Technician */}
          <div
            className={`rounded-xl border p-4 ${
              isDark ? 'border-slate-700 bg-slate-950/40' : 'border-gray-200 bg-white'
            }`}
          >
            <h3 className="mb-3 text-sm font-semibold">Kontak Teknisi Lapangan</h3>
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <UserRound className="h-4 w-4 text-sky-500" />
                <span>{technician.name}</span>
              </div>
              <a
                href={`tel:${technician.contact.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-sky-700 hover:underline dark:text-sky-300"
              >
                <Phone className="h-4 w-4" />
                {technician.contact}
              </a>
              <a
                href={`mailto:${technician.email}`}
                className="flex items-center gap-2 truncate text-sky-700 hover:underline dark:text-sky-300"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{technician.email}</span>
              </a>
            </div>
          </div>

          {/* Calibration + threshold */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={`rounded-xl border p-4 ${
                calibration?.overdue || calibration?.dueSoon
                  ? isDark
                    ? 'border-amber-500/40 bg-amber-950/30'
                    : 'border-amber-300 bg-amber-50'
                  : isDark
                    ? 'border-slate-700 bg-slate-950/40'
                    : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <CalendarClock className="h-3.5 w-3.5 text-amber-500" />
                Reminder Kalibrasi
              </div>
              <p className="text-sm font-semibold">
                {formatCalibrationDate(calibration?.nextDate)}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {calibration?.overdue
                  ? `Terlambat ${Math.abs(calibration.daysLeft)} hari`
                  : calibration?.dueSoon
                    ? `Jatuh tempo dalam ${calibration.daysLeft} hari`
                    : `Sisa ${calibration?.daysLeft ?? '—'} hari · siklus ${calibration?.intervalDays ?? '—'} hari`}
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                isDark ? 'border-slate-700 bg-slate-950/40' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <SlidersHorizontal className="h-3.5 w-3.5 text-violet-500" />
                Ambang {threshold?.metric || 'Sensor'}
              </div>
              {threshold ? (
                <>
                  <p className="text-sm font-semibold tabular-nums">
                    W {threshold.warning} / C {threshold.critical}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {threshold.unit}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Bacaan terakhir:{' '}
                    <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">
                      {latestReading ?? '—'} {threshold.unit}
                    </span>
                    {' · '}
                    <span
                      className={
                        readingLevel === 'critical'
                          ? 'font-semibold text-red-600 dark:text-red-400'
                          : readingLevel === 'warning'
                            ? 'font-semibold text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }
                    >
                      {readingLevel === 'critical'
                        ? 'Critical'
                        : readingLevel === 'warning'
                          ? 'Warning'
                          : 'Normal'}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Belum ada threshold untuk tipe ini.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, hint, isDark }) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        isDark ? 'border-slate-700 bg-slate-950/50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5 text-sky-500" />
        {label}
      </div>
      <p className="text-lg font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}
