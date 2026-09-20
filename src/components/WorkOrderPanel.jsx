import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  Trash2,
  Wrench,
} from 'lucide-react';
import { WO_STATUS, WO_STATUS_META } from '../data/workOrders';
import { formatLastUpdate } from '../data/mockDevices';

export default function WorkOrderPanel({
  orders = [],
  assignees = [],
  onUpdate,
  onSetStatus,
  onAssign,
  onRemove,
  isDark,
}) {
  const [filter, setFilter] = useState('active');

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'done') return orders.filter((o) => o.status === WO_STATUS.DONE);
    return orders.filter((o) => o.status !== WO_STATUS.DONE);
  }, [orders, filter]);

  const inputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100'
    : 'border-gray-200 bg-gray-50 text-slate-800';

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <ClipboardList className="h-3.5 w-3.5 text-orange-500" />
            Work Order Teknisi
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Tiket dari alert Offline — assign, catatan, dan status perbaikan.
          </p>
        </div>
        <div className="flex gap-1">
          {[
            { id: 'active', label: 'Aktif' },
            { id: 'done', label: 'Selesai' },
            { id: 'all', label: 'Semua' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-2 py-1 text-[10px] font-medium ${
                filter === f.id
                  ? 'bg-orange-600 text-white'
                  : isDark
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-500 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!filtered.length ? (
        <p className="rounded-xl border border-dashed border-inherit px-3 py-6 text-center text-xs text-slate-500">
          Belum ada work order. Buat dari alert Offline di Live Alert Log.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((order) => {
            const meta = WO_STATUS_META[order.status] || WO_STATUS_META.open;
            return (
              <li
                key={order.id}
                className={`rounded-xl border p-3 ${
                  isDark
                    ? 'border-slate-700 bg-slate-950/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{order.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {order.deviceName} ({order.deviceId}) · {order.region}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <label className="mb-2 block text-[10px] text-slate-500">
                  Assign teknisi
                  <select
                    value={order.assigneeId}
                    onChange={(e) => onAssign?.(order.id, e.target.value)}
                    className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-xs ${inputClass}`}
                  >
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mb-2 block text-[10px] text-slate-500">
                  Catatan lapangan
                  <textarea
                    rows={2}
                    value={order.notes || ''}
                    onChange={(e) =>
                      onUpdate?.(order.id, { notes: e.target.value })
                    }
                    className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-xs ${inputClass}`}
                  />
                </label>

                <label className="mb-2 block text-[10px] text-slate-500">
                  Catatan foto / bukti (teks)
                  <input
                    value={order.photoNote || ''}
                    onChange={(e) =>
                      onUpdate?.(order.id, { photoNote: e.target.value })
                    }
                    placeholder="mis. foto_panel_2026-09-20.jpg"
                    className={`mt-1 w-full rounded-lg border px-2 py-1.5 text-xs ${inputClass}`}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-1.5">
                  {order.status === WO_STATUS.OPEN && (
                    <button
                      type="button"
                      onClick={() =>
                        onSetStatus?.(order.id, WO_STATUS.IN_PROGRESS)
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-sky-500"
                    >
                      <PlayCircle className="h-3 w-3" />
                      Mulai
                    </button>
                  )}
                  {order.status !== WO_STATUS.DONE && (
                    <button
                      type="button"
                      onClick={() => onSetStatus?.(order.id, WO_STATUS.DONE)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-emerald-500"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Selesai
                    </button>
                  )}
                  {order.status === WO_STATUS.DONE && (
                    <button
                      type="button"
                      onClick={() => onSetStatus?.(order.id, WO_STATUS.OPEN)}
                      className="inline-flex items-center gap-1 rounded-lg border border-inherit px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Wrench className="h-3 w-3" />
                      Buka lagi
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove?.(order.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus
                  </button>
                  <span className="ml-auto text-[10px] text-slate-400">
                    {formatLastUpdate(order.updatedAt || order.createdAt)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
