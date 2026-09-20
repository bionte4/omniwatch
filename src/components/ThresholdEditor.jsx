import { useEffect, useState } from 'react';
import { RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_THRESHOLDS } from '../data/thresholds';

export default function ThresholdEditor({
  thresholds,
  onSave,
  onReset,
  isDark,
}) {
  const [draft, setDraft] = useState(() => ({ ...thresholds }));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft({ ...thresholds });
  }, [thresholds]);

  const inputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100'
    : 'border-gray-200 bg-gray-50 text-slate-800';

  const types = Object.keys(DEFAULT_THRESHOLDS);

  const handleChange = (type, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value === '' ? '' : Number(value),
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    for (const type of types) {
      const row = draft[type];
      if (Number(row.warning) >= Number(row.critical)) {
        setMessage(
          `${type}: ambang Warning harus lebih kecil dari Critical.`,
        );
        return;
      }
    }
    onSave?.(draft);
    setMessage('Threshold berhasil disimpan.');
  };

  const handleReset = () => {
    onReset?.();
    setMessage('Threshold dikembalikan ke default BMKG.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5 text-violet-500" />
            Threshold Alert
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Atur ambang Warning & Critical per tipe sensor (tanpa hardcode di
            kode).
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 rounded-lg border border-inherit px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {message && (
        <p className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
          {message}
        </p>
      )}

      <div className="space-y-3">
        {types.map((type) => {
          const row = draft[type] || DEFAULT_THRESHOLDS[type];
          return (
            <div
              key={type}
              className={`rounded-xl border p-3 ${
                isDark
                  ? 'border-slate-700 bg-slate-950/50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{type}</p>
                  <p className="text-[11px] text-slate-500">
                    {row.description} · {row.metric} ({row.unit})
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[11px] text-slate-500">
                  Warning
                  <input
                    type="number"
                    step="any"
                    value={row.warning}
                    onChange={(e) =>
                      handleChange(type, 'warning', e.target.value)
                    }
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-sm ${inputClass}`}
                  />
                </label>
                <label className="block text-[11px] text-slate-500">
                  Critical
                  <input
                    type="number"
                    step="any"
                    value={row.critical}
                    onChange={(e) =>
                      handleChange(type, 'critical', e.target.value)
                    }
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-sm ${inputClass}`}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500"
      >
        <Save className="h-4 w-4" />
        Simpan Threshold
      </button>
    </form>
  );
}
