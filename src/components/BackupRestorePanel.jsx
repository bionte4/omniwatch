import { useRef, useState } from 'react';
import { Download, Upload, Archive } from 'lucide-react';
import {
  applyBackupToStorage,
  collectBackupSnapshot,
  downloadBackupJson,
  parseBackupFileText,
} from '../utils/backup';

export default function BackupRestorePanel({
  regions,
  thresholds,
  integrations,
  escalationPolicy,
  broadcastChannels,
  dataSourceConfig,
  localDevices,
  workOrders,
  onRestored,
  isDark,
}) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');
  const [includeWorkOrders, setIncludeWorkOrders] = useState(true);

  const handleExport = () => {
    const snapshot = collectBackupSnapshot({
      regions,
      thresholds,
      integrations,
      escalation: escalationPolicy,
      broadcast: broadcastChannels,
      dataSource: dataSourceConfig,
      localDevices,
      workOrders: includeWorkOrders ? workOrders : undefined,
    });
    downloadBackupJson(snapshot);
    setMessage('Backup JSON berhasil diunduh.');
  };

  const handleImportClick = () => {
    fileRef.current?.click();
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseBackupFileText(text);
      if (!parsed.ok) {
        setMessage(parsed.error);
        return;
      }

      const result = applyBackupToStorage(parsed.snapshot.config, {
        includeWorkOrders,
      });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      onRestored?.(parsed.snapshot.config, result.applied);
      setMessage(
        `Restore berhasil (${result.applied.join(', ') || 'tidak ada section'}). Halaman akan menyegarkan state.`,
      );
    } catch {
      setMessage('Gagal membaca file backup.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Archive className="h-3.5 w-3.5 text-teal-500" />
          Backup & Restore
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Export / import konfigurasi: wilayah, threshold, integrasi, eskalasi,
          broadcast, gateway, perangkat lokal, dan work order.
        </p>
      </div>

      {message && (
        <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200">
          {message}
        </p>
      )}

      <label
        className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs ${
          isDark ? 'border-slate-700 bg-slate-950/40' : 'border-gray-200 bg-white'
        }`}
      >
        <span className="font-medium text-slate-700 dark:text-slate-200">
          Sertakan Work Order
        </span>
        <input
          type="checkbox"
          checked={includeWorkOrders}
          onChange={(e) => setIncludeWorkOrders(e.target.checked)}
          className="h-4 w-4 rounded border-slate-400"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
        >
          <Download className="h-4 w-4" />
          Export Backup
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100 dark:border-teal-500/40 dark:bg-teal-500/10 dark:text-teal-200 dark:hover:bg-teal-500/20"
        >
          <Upload className="h-4 w-4" />
          Import Backup
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFile}
      />

      <div
        className={`rounded-xl border p-3 text-[11px] leading-relaxed text-slate-500 ${
          isDark ? 'border-slate-700 bg-slate-950/50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        Setelah import, aplikasi menerapkan config ke penyimpanan lokal dan
        menyegarkan state aktif. Disarankan export rutin sebelum mengubah
        threshold / gateway produksi.
      </div>
    </div>
  );
}
