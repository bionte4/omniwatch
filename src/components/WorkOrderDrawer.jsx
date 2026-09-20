import { ClipboardList, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import WorkOrderPanel from './WorkOrderPanel';

export default function WorkOrderDrawer({
  open,
  onClose,
  orders,
  assignees,
  onUpdate,
  onSetStatus,
  onAssign,
  onRemove,
}) {
  const { isDark } = useTheme();
  if (!open) return null;

  const panelClass = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-gray-200 bg-white text-slate-800';

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch justify-end bg-slate-950/40 backdrop-blur-[2px]">
      <button
        type="button"
        className="flex-1 cursor-default"
        aria-label="Tutup work order"
        onClick={onClose}
      />
      <aside
        className={`flex h-full w-full max-w-md flex-col border-l shadow-2xl ${panelClass}`}
      >
        <div className="flex items-center justify-between border-b border-inherit px-4 py-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-orange-500" />
            <div>
              <h2 className="text-sm font-semibold">Work Order</h2>
              <p className="text-[11px] text-slate-500">
                Tiket perbaikan perangkat lapangan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-inherit p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
          <WorkOrderPanel
            orders={orders}
            assignees={assignees}
            onUpdate={onUpdate}
            onSetStatus={onSetStatus}
            onAssign={onAssign}
            onRemove={onRemove}
            isDark={isDark}
          />
        </div>
      </aside>
    </div>
  );
}
