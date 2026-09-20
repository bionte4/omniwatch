import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CircleAlert,
  ChevronDown,
  ChevronUp,
  Download,
  Eraser,
  FileSpreadsheet,
  FileText,
  Radio,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatLastUpdate } from '../data/mockDevices';
import {
  buildIncidentRows,
  exportIncidentCsv,
  exportIncidentPdf,
  exportIncidentText,
} from '../utils/exportIncidentReport';

/**
 * Bottom Live Alert Drawer + scrolling ticker for realtime status events.
 */
export default function LiveAlertDrawer({
  alerts = [],
  devices = [],
  region,
  lastSync,
  onClearAlerts,
  broadcastLogs = [],
}) {
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const latestAlert = alerts[0] ?? null;
  const latestBroadcast = broadcastLogs[0] ?? null;

  const tickerText = useMemo(() => {
    const alertPart = alerts.length
      ? alerts
          .slice(0, 5)
          .map((a) => a.message)
          .join('   ···   ')
      : '';
    const bcPart = broadcastLogs.length
      ? broadcastLogs
          .slice(0, 4)
          .map((b) => `[${b.time}] ${b.message}`)
          .join('   ···   ')
      : '';

    if (!alertPart && !bcPart) {
      return 'Menunggu kejadian status perangkat... sinkronisasi real-time aktif';
    }
    return [bcPart, alertPart].filter(Boolean).join('   ···   ');
  }, [alerts, broadcastLogs]);

  const [tickerKey, setTickerKey] = useState(0);
  useEffect(() => {
    setTickerKey((k) => k + 1);
  }, [tickerText]);

  const canExport = alerts.length > 0 || devices.some(
    (d) => d.status === 'warning' || d.status === 'offline',
  );

  const handleExport = (format) => {
    const rows = buildIncidentRows({
      alerts,
      devices,
      region,
      includeNormals: true,
    });
    const meta = { regionLabel: region?.label || 'Semua' };

    if (format === 'csv') exportIncidentCsv(rows, meta);
    else if (format === 'txt') exportIncidentText(rows, meta);
    else exportIncidentPdf(rows, meta);

    setMenuOpen(false);
  };

  return (
    <section className="z-20 flex shrink-0 flex-col border-t border-gray-200 bg-white transition-colors duration-300 dark:border-slate-700/80 dark:bg-slate-950">
      <div className="flex h-8 items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-sky-50 via-white to-amber-50 px-2 dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          <Radio className="h-3 w-3" />
          Live
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div key={tickerKey} className="ow-ticker-track">
            <span className="ow-ticker-item text-[11px] text-slate-600 dark:text-slate-300">
              {tickerText}
            </span>
            <span
              aria-hidden
              className="ow-ticker-item text-[11px] text-slate-600 dark:text-slate-300"
            >
              {tickerText}
            </span>
          </div>
        </div>
        <p className="hidden shrink-0 text-[10px] text-slate-500 sm:block">
          Sinkron {lastSync ? formatLastUpdate(lastSync) : '—'} · WebSocket
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-1.5 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left transition hover:opacity-90"
        >
          <span className="rounded-md bg-sky-50 p-1 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:ring-sky-400/25">
            <Bell className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Live Alert Log
          </h2>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          {latestBroadcast && (
            <span className="hidden max-w-xs truncate text-[11px] text-rose-600 md:inline dark:text-rose-300">
              Broadcast: {latestBroadcast.message}
            </span>
          )}
          {!latestBroadcast && latestAlert && (
            <span className="hidden min-w-0 truncate text-[11px] text-slate-500 md:inline">
              Terbaru: {latestAlert.message}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-500">
            {alerts.length} kejadian
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </span>
        </button>

        <div className="relative flex shrink-0 items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={!canExport}
              className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-700 transition enabled:hover:border-sky-300 enabled:hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 dark:enabled:hover:bg-sky-500/20"
              title="Download Laporan Incident"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Download Laporan</span>
              <span className="sm:hidden">Laporan</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Tutup menu unduhan"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute bottom-full right-0 z-50 mb-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Format laporan
                  </p>
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    Unduh CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('pdf')}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5 text-rose-500" />
                    Unduh PDF (Print)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('txt')}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    Teks terstruktur (.txt)
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClearAlerts}
            disabled={!alerts.length}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[10px] font-medium text-slate-600 transition enabled:hover:border-red-300 enabled:hover:bg-red-50 enabled:hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:enabled:hover:border-red-500/40 dark:enabled:hover:bg-red-500/10 dark:enabled:hover:text-red-300"
            title="Clear Log"
          >
            <Eraser className="h-3 w-3" />
            Clear Log
          </button>
        </div>
      </div>

      {expanded && (
        <div className="custom-scrollbar h-28 overflow-y-auto overscroll-contain px-3 py-2 md:h-32">
          {!alerts.length && !broadcastLogs.length ? (
            <div className="flex h-full items-center gap-2 text-xs text-slate-500">
              <CircleAlert className="h-3.5 w-3.5" />
              Menunggu perubahan status perangkat...
            </div>
          ) : (
            <ul className="space-y-1">
              {broadcastLogs.slice(0, 8).map((log) => (
                <li
                  key={log.id}
                  className="flex items-start gap-2 rounded-lg border border-rose-200/70 bg-rose-50/80 px-2.5 py-1.5 text-xs dark:border-rose-500/30 dark:bg-rose-500/10"
                >
                  <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  <span className="min-w-0 flex-1 leading-relaxed text-rose-800 dark:text-rose-200">
                    <span className="font-semibold">[{log.time}] </span>
                    {log.message}
                    {log.detail ? (
                      <span className="mt-0.5 block text-[10px] text-rose-600/90 dark:text-rose-300/80">
                        {log.detail}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 rounded border border-rose-300 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-700 dark:border-rose-500/40 dark:text-rose-300">
                    {log.channel === 'telegram'
                      ? 'Telegram'
                      : log.channel === 'whatsapp'
                        ? 'WhatsApp'
                        : 'Broadcast'}
                  </span>
                </li>
              ))}

              {alerts.map((alert, index) => (
                <li
                  key={alert.id}
                  className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                    index === 0 && !broadcastLogs.length
                      ? 'border-gray-200 bg-gray-50 dark:border-slate-700/80 dark:bg-slate-900/80'
                      : 'border-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <span
                    className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: alert.color }}
                  />
                  <span
                    className={`min-w-0 flex-1 leading-relaxed ${
                      alert.status === 'offline'
                        ? 'text-red-700 dark:text-red-300'
                        : alert.status === 'warning'
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {alert.message}
                  </span>
                  <StatusBadge status={alert.status} size="xs" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
