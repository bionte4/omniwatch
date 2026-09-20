import { useEffect, useState } from 'react';
import { Cable, Save, SatelliteDish } from 'lucide-react';
import { DATA_SOURCE_MODES } from '../hooks/useDataSource';

export default function DataSourcePanel({
  mode,
  gatewayUrl,
  activeWsUrl,
  connectionStatus,
  onSave,
  isDark,
}) {
  const [draftMode, setDraftMode] = useState(mode);
  const [draftUrl, setDraftUrl] = useState(gatewayUrl || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraftMode(mode);
    setDraftUrl(gatewayUrl || '');
  }, [mode, gatewayUrl]);

  const inputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100'
    : 'border-gray-200 bg-gray-50 text-slate-800';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draftMode === DATA_SOURCE_MODES.GATEWAY && !draftUrl.trim()) {
      setMessage('Isi URL WebSocket gateway lapangan.');
      return;
    }
    if (draftMode === DATA_SOURCE_MODES.GATEWAY) {
      const url = draftUrl.trim();
      if (!/^wss?:\/\//i.test(url)) {
        setMessage('URL harus diawali ws:// atau wss://');
        return;
      }
    }
    onSave?.({
      mode: draftMode,
      gatewayUrl: draftUrl.trim(),
    });
    setMessage(
      draftMode === DATA_SOURCE_MODES.GATEWAY
        ? 'Beralih ke gateway lapangan. Koneksi WebSocket akan di-reconnect.'
        : 'Kembali ke simulasi OmniWatch (backend lokal / Docker).',
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <SatelliteDish className="h-3.5 w-3.5 text-indigo-500" />
          Sumber Data Real-time
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Ganti simulasi WS dengan feed gateway BMKG / lapangan (format JSON
          perangkat yang sama).
        </p>
      </div>

      {message && (
        <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
          {message}
        </p>
      )}

      <div className="grid gap-2">
        <ModeCard
          active={draftMode === DATA_SOURCE_MODES.SIMULATION}
          onClick={() => setDraftMode(DATA_SOURCE_MODES.SIMULATION)}
          title="Simulasi OmniWatch"
          desc="Backend demo lokal / Docker (`/ws`)."
          isDark={isDark}
        />
        <ModeCard
          active={draftMode === DATA_SOURCE_MODES.GATEWAY}
          onClick={() => setDraftMode(DATA_SOURCE_MODES.GATEWAY)}
          title="Gateway lapangan"
          desc="WebSocket BMKG / MQTT bridge / ingest server."
          isDark={isDark}
        />
      </div>

      {draftMode === DATA_SOURCE_MODES.GATEWAY && (
        <label className="block text-[11px] text-slate-500">
          URL WebSocket gateway
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="wss://gateway.bmkg.local/ws"
            className={`mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs ${inputClass}`}
          />
        </label>
      )}

      <div
        className={`rounded-xl border p-3 text-[11px] ${
          isDark ? 'border-slate-700 bg-slate-950/50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
          <Cable className="h-3.5 w-3.5 text-indigo-500" />
          Endpoint aktif
        </p>
        <p className="break-all font-mono text-slate-500">{activeWsUrl}</p>
        <p className="mt-1 text-slate-400">
          Status:{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {connectionStatus || '—'}
          </span>
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          Format pesan yang didukung:{' '}
          <code>{`{ type: "devices", devices: [...] }`}</code>,{' '}
          <code>{`{ type: "device_update", device: {...} }`}</code>, atau array
          perangkat. Field mengikuti model OmniWatch (id, name, type, status,
          lat, lng, …).
        </p>
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
      >
        <Save className="h-4 w-4" />
        Simpan Sumber Data
      </button>
    </form>
  );
}

function ModeCard({ active, onClick, title, desc, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-left transition ${
        active
          ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-400/50 dark:bg-indigo-500/15'
          : isDark
            ? 'border-slate-700 hover:bg-slate-800'
            : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{desc}</p>
    </button>
  );
}
