import { Keyboard } from 'lucide-react';

const ROWS = [
  { keys: 'M', desc: 'Mute / unmute alarm' },
  { keys: 'C', desc: 'Clear Live Alert Log' },
  { keys: '[ ] atau ← →', desc: 'Loncat stasiun (prev / next)' },
  { keys: 'F', desc: 'Mode wall display / fullscreen' },
  { keys: 'Esc', desc: 'Keluar wall display' },
  { keys: '?', desc: 'Tampilkan / sembunyikan bantuan ini' },
];

export default function HotkeyHelpOverlay({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Tutup bantuan hotkey"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-sky-400" />
          <div>
            <h2 className="text-sm font-semibold">Hotkey Piket</h2>
            <p className="text-[11px] text-slate-400">
              Pintasan keyboard ruang kontrol OmniWatch
            </p>
          </div>
        </div>
        <ul className="space-y-2">
          {ROWS.map((row) => (
            <li
              key={row.keys}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 py-2"
            >
              <kbd className="rounded-md border border-slate-600 bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-sky-300">
                {row.keys}
              </kbd>
              <span className="flex-1 text-right text-xs text-slate-300">
                {row.desc}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-500"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
