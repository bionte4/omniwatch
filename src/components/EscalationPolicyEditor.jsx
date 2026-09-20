import { useEffect, useState } from 'react';
import { RotateCcw, Save, Siren } from 'lucide-react';
import { DEFAULT_ESCALATION_POLICY } from '../data/escalation';

export default function EscalationPolicyEditor({
  policy,
  escalationLogs = [],
  onSave,
  onReset,
  isDark,
}) {
  const [draft, setDraft] = useState(() => ({ ...policy }));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDraft({ ...policy });
  }, [policy]);

  const inputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100'
    : 'border-gray-200 bg-gray-50 text-slate-800';

  const toggle = (key) => {
    setDraft((d) => ({ ...d, [key]: !d[key] }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const minutes = Number(draft.offlineEscalateAfterMinutes);
    if (Number.isNaN(minutes) || minutes < 0.25) {
      setMessage('Durasi escalate minimal 0.25 menit (15 detik).');
      return;
    }
    onSave?.({
      ...draft,
      offlineEscalateAfterMinutes: minutes,
    });
    setMessage('Kebijakan eskalasi disimpan.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Siren className="h-3.5 w-3.5 text-rose-500" />
            Escalation Policy
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Warning → Telegram · Offline &gt; N menit → WhatsApp on-call
            (simulasi).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onReset?.();
            setMessage('Policy dikembalikan ke default.');
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-inherit px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {message && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {message}
        </p>
      )}

      <ToggleRow
        label="Aktifkan eskalasi"
        checked={draft.enabled}
        onChange={() => toggle('enabled')}
        isDark={isDark}
      />
      <ToggleRow
        label="Warning → Telegram grup"
        checked={draft.warningToTelegram}
        onChange={() => toggle('warningToTelegram')}
        isDark={isDark}
      />
      <ToggleRow
        label="Offline → Telegram segera (L1)"
        checked={draft.offlineImmediateTelegram}
        onChange={() => toggle('offlineImmediateTelegram')}
        isDark={isDark}
      />
      <ToggleRow
        label="Offline lama → WhatsApp on-call (L2)"
        checked={draft.offlineEscalateWhatsApp}
        onChange={() => toggle('offlineEscalateWhatsApp')}
        isDark={isDark}
      />
      <ToggleRow
        label="Auto-buat Work Order saat Offline"
        checked={draft.autoCreateWorkOrderOnOffline}
        onChange={() => toggle('autoCreateWorkOrderOnOffline')}
        isDark={isDark}
      />

      <label className="block text-[11px] text-slate-500">
        Escalate WhatsApp setelah (menit)
        <input
          type="number"
          min="0.25"
          step="0.25"
          value={draft.offlineEscalateAfterMinutes}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              offlineEscalateAfterMinutes: e.target.value,
            }))
          }
          className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-sm ${inputClass}`}
        />
        <span className="mt-1 block text-[10px] text-slate-400">
          Default demo: {DEFAULT_ESCALATION_POLICY.offlineEscalateAfterMinutes}{' '}
          menit. Untuk uji cepat bisa 0.25 (15 detik).
        </span>
      </label>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
      >
        <Save className="h-4 w-4" />
        Simpan Escalation Policy
      </button>

      {escalationLogs.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Log eskalasi
          </p>
          <ul className="custom-scrollbar max-h-40 space-y-1 overflow-y-auto text-[11px]">
            {escalationLogs.slice(0, 12).map((log) => (
              <li
                key={log.id}
                className={`rounded-lg border px-2 py-1.5 ${
                  isDark
                    ? 'border-slate-700 bg-slate-950/60 text-slate-300'
                    : 'border-gray-200 bg-gray-50 text-slate-600'
                }`}
              >
                <span className="font-semibold">[{log.time}] </span>
                {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

function ToggleRow({ label, checked, onChange, isDark }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-xs ${
        isDark ? 'border-slate-700 bg-slate-950/40' : 'border-gray-200 bg-white'
      }`}
    >
      <span className="font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? 'bg-rose-500' : isDark ? 'bg-slate-700' : 'bg-gray-300'
        }`}
      >
        <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
        />
      </button>
    </label>
  );
}
