import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Cable,
  CheckCircle2,
  Link2,
  PlugZap,
  Plus,
  RefreshCw,
  Trash2,
  WifiOff,
} from 'lucide-react';
import {
  INTEGRATION_PROTOCOLS,
  createEmptyIntegration,
  getProtocolMeta,
  statusLabel,
} from '../data/integrations';
import { formatLastUpdate } from '../data/mockDevices';

export default function DeviceIntegrationPanel({
  integrations = [],
  regions = [],
  activityLog = [],
  selectedRegionId,
  onSave,
  onRemove,
  onTestPing,
  onReconnect,
  onToggleEnabled,
  isDark,
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => createEmptyIntegration(selectedRegionId));

  const stats = useMemo(() => {
    const connected = integrations.filter((i) => i.status === 'connected').length;
    const degraded = integrations.filter((i) => i.status === 'degraded').length;
    const down = integrations.filter((i) => i.status === 'disconnected').length;
    return { total: integrations.length, connected, degraded, down };
  }, [integrations]);

  useEffect(() => {
    if (!editingId) {
      setForm(createEmptyIntegration(selectedRegionId));
    }
  }, [selectedRegionId, editingId]);

  const inputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100'
    : 'border-gray-200 bg-gray-50 text-slate-800';

  const startCreate = () => {
    setEditingId('new');
    setForm(createEmptyIntegration(selectedRegionId));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item, password: item.password || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(createEmptyIntegration(selectedRegionId));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.endpoint.trim()) return;

    const protocol = getProtocolMeta(form.protocol);
    onSave?.({
      ...form,
      id: editingId === 'new' ? `int-${Date.now()}` : form.id,
      name: form.name.trim(),
      endpoint: form.endpoint.trim(),
      port: Number(form.port) || protocol.defaultPort,
      topicOrPath: form.topicOrPath.trim(),
      username: form.username.trim(),
      status: form.enabled ? form.status || 'connected' : 'disconnected',
      lastSeen: form.lastSeen || new Date().toISOString(),
    });
    cancelEdit();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <PlugZap className="h-3.5 w-3.5 text-sky-500" />
            Integrasi Device
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Hubungkan MQTT, HTTP webhook, Modbus, atau serial gateway.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip label="Total" value={stats.total} isDark={isDark} />
        <StatChip label="Connected" value={stats.connected} tone="ok" isDark={isDark} />
        <StatChip label="Degraded" value={stats.degraded} tone="warn" isDark={isDark} />
        <StatChip label="Down" value={stats.down} tone="bad" isDark={isDark} />
      </div>

      {editingId && (
        <form
          onSubmit={handleSubmit}
          className={`space-y-2 rounded-xl border p-3 ${
            isDark ? 'border-slate-700 bg-slate-950/60' : 'border-sky-100 bg-sky-50/50'
          }`}
        >
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {editingId === 'new' ? 'Konektor baru' : 'Edit konektor'}
          </p>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nama konektor"
            className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.protocol}
              onChange={(e) => {
                const protocol = e.target.value;
                const meta = getProtocolMeta(protocol);
                setForm((f) => ({ ...f, protocol, port: meta.defaultPort }));
              }}
              className={`rounded-lg border px-2 py-2 text-sm ${inputClass}`}
            >
              {INTEGRATION_PROTOCOLS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={form.regionId}
              onChange={(e) => setForm((f) => ({ ...f, regionId: e.target.value }))}
              className={`rounded-lg border px-2 py-2 text-sm ${inputClass}`}
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              value={form.endpoint}
              onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
              placeholder="Endpoint / host"
              className={`col-span-2 rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              required
            />
            <input
              value={form.port}
              onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
              placeholder="Port"
              className={`rounded-lg border px-2 py-2 text-sm ${inputClass}`}
            />
          </div>
          <input
            value={form.topicOrPath}
            onChange={(e) => setForm((f) => ({ ...f, topicOrPath: e.target.value }))}
            placeholder={form.protocol === 'http' ? 'Path webhook' : 'Topic / register'}
            className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="Username"
              className={`rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Password / token"
              className={`rounded-lg border px-3 py-2 text-sm ${inputClass}`}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            />
            Aktifkan konektor
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-sky-600 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className={`rounded-lg border px-3 py-2 text-xs ${
                isDark ? 'border-slate-700' : 'border-gray-200'
              }`}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {integrations.map((item) => {
          const meta = getProtocolMeta(item.protocol);
          return (
            <article
              key={item.id}
              className={`rounded-xl border p-3 transition ${
                isDark
                  ? 'border-slate-700 bg-slate-950/50'
                  : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-sm font-semibold">{item.name}</h4>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {meta.label} · {item.endpoint}
                    {item.port ? `:${item.port}` : ''}
                  </p>
                  {item.topicOrPath && (
                    <p className="truncate text-[10px] text-slate-400">
                      <Link2 className="mr-1 inline h-3 w-3" />
                      {item.topicOrPath}
                    </p>
                  )}
                </div>
                <Cable className="h-4 w-4 shrink-0 text-sky-500" />
              </div>

              <div className="mb-2 grid grid-cols-3 gap-2 text-center">
                <MiniMetric
                  label="Latency"
                  value={`${item.latencyMs || 0} ms`}
                  isDark={isDark}
                />
                <MiniMetric
                  label="Msg/min"
                  value={String(item.messagesPerMin || 0)}
                  isDark={isDark}
                />
                <MiniMetric
                  label="Error %"
                  value={`${item.errorRate || 0}%`}
                  isDark={isDark}
                />
              </div>

              <p className="mb-2 text-[10px] text-slate-500">
                Last seen:{' '}
                {item.lastSeen ? formatLastUpdate(item.lastSeen) : 'Belum pernah'}
              </p>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onTestPing?.(item.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-medium text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
                >
                  <Activity className="h-3 w-3" />
                  Test Ping
                </button>
                <button
                  type="button"
                  onClick={() => onReconnect?.(item.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reconnect
                </button>
                <button
                  type="button"
                  onClick={() => onToggleEnabled?.(item.id, !item.enabled)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
                >
                  {item.enabled ? <WifiOff className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {item.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onRemove?.(item.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-[10px] font-medium text-red-600 dark:border-red-500/30 dark:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus
                </button>
              </div>
            </article>
          );
        })}

        {!integrations.length && (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-500 dark:border-slate-700">
            Belum ada konektor. Tambah integrasi MQTT/HTTP untuk mulai.
          </p>
        )}
      </div>

      {activityLog.length > 0 && (
        <div
          className={`rounded-xl border p-3 ${
            isDark ? 'border-slate-700 bg-slate-950/40' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Activity Log Integrasi
          </p>
          <ul className="custom-scrollbar max-h-28 space-y-1 overflow-y-auto text-[11px]">
            {activityLog.slice(0, 10).map((log) => (
              <li
                key={log.id}
                className={
                  log.level === 'error'
                    ? 'text-red-600 dark:text-red-300'
                    : log.level === 'warn'
                      ? 'text-amber-600 dark:text-amber-300'
                      : 'text-slate-600 dark:text-slate-300'
                }
              >
                {formatLastUpdate(log.time)} — {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, tone = 'neutral', isDark }) {
  const tones = {
    neutral: isDark ? 'text-slate-100' : 'text-slate-900',
    ok: 'text-emerald-600 dark:text-emerald-300',
    warn: 'text-amber-600 dark:text-amber-300',
    bad: 'text-red-600 dark:text-red-300',
  };
  return (
    <div
      className={`rounded-lg border px-2 py-1.5 ${
        isDark ? 'border-slate-700 bg-slate-950/50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <p className="text-[9px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function MiniMetric({ label, value, isDark }) {
  return (
    <div
      className={`rounded-md px-1.5 py-1 ${
        isDark ? 'bg-slate-900' : 'bg-gray-50'
      }`}
    >
      <p className="text-[9px] uppercase text-slate-500">{label}</p>
      <p className="text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    connected:
      'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    degraded:
      'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    testing:
      'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    disconnected:
      'border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
        map[status] || map.disconnected
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}
