import { Radio, Route, TriangleAlert } from 'lucide-react';
import { MAP_LAYER_DEFS } from '../data/mapLayers';

const ICONS = {
  hazard: TriangleAlert,
  evac: Route,
  radio: Radio,
};

export default function MapLayerControls({ visibility, onToggle }) {
  return (
    <div className="pointer-events-auto absolute left-3 top-20 z-[1000] w-44 rounded-xl border border-gray-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Layer peta
      </p>
      <ul className="space-y-1">
        {MAP_LAYER_DEFS.map((layer) => {
          const Icon = ICONS[layer.id] || TriangleAlert;
          const on = Boolean(visibility?.[layer.id]);
          return (
            <li key={layer.id}>
              <button
                type="button"
                title={layer.description}
                onClick={() => onToggle?.(layer.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium transition ${
                  on
                    ? 'bg-slate-900 text-white dark:bg-sky-600'
                    : 'text-slate-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span className="truncate">{layer.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[9px] leading-snug text-slate-400">
        Overlay ilustratif — bukan peta resmi BMKG.
      </p>
    </div>
  );
}
