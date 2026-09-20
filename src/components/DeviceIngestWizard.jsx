import { useMemo, useState } from 'react';
import { ClipboardPaste, Sparkles, Wand2 } from 'lucide-react';
import {
  SAMPLE_HTTP_PAYLOAD,
  SAMPLE_MQTT_PAYLOAD,
  mapPayloadToDevice,
  parseIngestText,
} from '../utils/payloadMapper';

export default function DeviceIngestWizard({
  regions = [],
  selectedRegionId = 'padang',
  onAddDevice,
  isDark,
}) {
  const [raw, setRaw] = useState('');
  const [message, setMessage] = useState('');
  const [mappedList, setMappedList] = useState([]);

  const inputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100'
    : 'border-gray-200 bg-gray-50 text-slate-800';

  const handleParse = () => {
    const { error, candidates } = parseIngestText(raw);
    if (error) {
      setMappedList([]);
      setMessage(error);
      return;
    }

    const results = candidates.map((item) =>
      mapPayloadToDevice(item, { region: selectedRegionId }),
    );
    setMappedList(results);
    const okCount = results.filter((r) => r.ok).length;
    setMessage(
      `Terdeteksi ${results.length} payload · ${okCount} siap diimpor.`,
    );
  };

  const handleImport = (index) => {
    const row = mappedList[index];
    if (!row?.ok) {
      setMessage(`Lengkapi field wajib: ${(row?.missing || []).join(', ')}`);
      return;
    }
    const result = onAddDevice?.(row.device);
    if (result?.ok === false) {
      setMessage(result.error || 'Gagal menambah perangkat.');
      return;
    }
    setMessage(`Perangkat ${row.device.id} berhasil diimpor dari payload.`);
  };

  const handleImportAll = () => {
    let added = 0;
    mappedList.forEach((row) => {
      if (!row.ok) return;
      const result = onAddDevice?.(row.device);
      if (result?.ok !== false) added += 1;
    });
    setMessage(
      added
        ? `${added} perangkat berhasil diimpor.`
        : 'Tidak ada perangkat yang berhasil diimpor.',
    );
  };

  const mappingPreview = useMemo(() => mappedList[0]?.mapping || {}, [mappedList]);

  return (
    <div className="space-y-3 border-b border-inherit pb-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Wand2 className="h-3.5 w-3.5 text-cyan-500" />
            Wizard Ingest Perangkat
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Tempel payload MQTT/HTTP JSON → auto-map ke model OmniWatch.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            setRaw(SAMPLE_MQTT_PAYLOAD);
            setMessage('Contoh payload MQTT dimuat.');
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-inherit px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ClipboardPaste className="h-3 w-3" />
          Contoh MQTT
        </button>
        <button
          type="button"
          onClick={() => {
            setRaw(SAMPLE_HTTP_PAYLOAD);
            setMessage('Contoh payload HTTP dimuat.');
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-inherit px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ClipboardPaste className="h-3 w-3" />
          Contoh HTTP
        </button>
      </div>

      <textarea
        rows={8}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder='{"device_id":"...","lat":...,"lon":...}'
        className={`w-full rounded-xl border px-3 py-2 font-mono text-[11px] leading-relaxed ${inputClass}`}
      />

      <button
        type="button"
        onClick={handleParse}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
      >
        <Sparkles className="h-4 w-4" />
        Parse & Auto-map
      </button>

      {message && (
        <p className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-900 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
          {message}
        </p>
      )}

      {Object.keys(mappingPreview).length > 0 && (
        <div
          className={`rounded-xl border p-3 text-[11px] ${
            isDark ? 'border-slate-700 bg-slate-950/50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <p className="mb-1.5 font-semibold text-slate-600 dark:text-slate-300">
            Field mapping (item pertama)
          </p>
          <ul className="grid grid-cols-2 gap-1 text-slate-500">
            {Object.entries(mappingPreview).map(([field, source]) => (
              <li key={field}>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {field}
                </span>{' '}
                ← <code className="text-cyan-600 dark:text-cyan-300">{source}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mappedList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Preview impor
            </p>
            <button
              type="button"
              onClick={handleImportAll}
              className="text-[10px] font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
            >
              Impor semua valid
            </button>
          </div>
          {mappedList.map((row, index) => (
            <div
              key={`${row.device.id}-${index}`}
              className={`rounded-xl border p-2.5 ${
                row.ok
                  ? isDark
                    ? 'border-slate-700 bg-slate-950/40'
                    : 'border-gray-200 bg-white'
                  : 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 text-xs">
                  <p className="font-semibold">
                    {row.device.id || '(tanpa ID)'} · {row.device.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {row.device.type} · {row.device.region} ·{' '}
                    {row.ok
                      ? `${row.device.lat}, ${row.device.lng}`
                      : `kurang: ${row.missing.join(', ')}`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!row.ok}
                  onClick={() => handleImport(index)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white enabled:hover:bg-emerald-500 disabled:opacity-40"
                >
                  Impor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {regions?.length ? (
        <p className="text-[10px] text-slate-400">
          Default region jika payload kosong: {selectedRegionId}
        </p>
      ) : null}
    </div>
  );
}
