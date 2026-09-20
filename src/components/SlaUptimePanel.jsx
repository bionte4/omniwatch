import { AlertTriangle, Clock3, Gauge, ShieldCheck } from 'lucide-react';
import { formatUptime, slaTone, SLA_TARGET_PCT } from '../data/sla';

function toneClasses(tone) {
  switch (tone) {
    case 'normal':
      return {
        wrap: 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/25 dark:bg-emerald-950/30',
        value: 'text-emerald-700 dark:text-emerald-300',
        bar: 'bg-emerald-500',
      };
    case 'warning':
      return {
        wrap: 'border-amber-200 bg-amber-50/80 dark:border-amber-500/25 dark:bg-amber-950/30',
        value: 'text-amber-700 dark:text-amber-300',
        bar: 'bg-amber-500',
      };
    case 'offline':
      return {
        wrap: 'border-red-200 bg-red-50/80 dark:border-red-500/25 dark:bg-red-950/30',
        value: 'text-red-700 dark:text-red-300',
        bar: 'bg-red-500',
      };
    default:
      return {
        wrap: 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-950/40',
        value: 'text-slate-800 dark:text-slate-100',
        bar: 'bg-sky-500',
      };
  }
}

function MetricCard({ label, value, sub, icon: Icon, tone = 'neutral', pctBar }) {
  const t = toneClasses(tone);
  return (
    <div className={`rounded-xl border p-2.5 ${t.wrap}`}>
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <p className={`text-lg font-semibold tabular-nums tracking-tight ${t.value}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-slate-500">{sub}</p>}
      {pctBar != null && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${t.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, pctBar))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function SlaUptimePanel({ metrics, regionLabel }) {
  if (!metrics) return null;

  const tone24 = slaTone(metrics.uptime24h);
  const tone7 = slaTone(metrics.uptime7d);

  return (
    <div className="shrink-0 border-b border-gray-200 px-3 py-3 dark:border-slate-700/80">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            SLA / Uptime
          </h3>
          <p className="text-[10px] text-slate-400">
            {regionLabel || 'Wilayah aktif'} · target {SLA_TARGET_PCT}%
            {metrics.usingLiveSamples ? ' · live' : ' · baseline'}
          </p>
        </div>
        <ShieldCheck className="h-4 w-4 text-sky-500" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Uptime 24 jam"
          value={formatUptime(metrics.uptime24h)}
          sub={`Sampel ${metrics.sampleCount24h}`}
          icon={Gauge}
          tone={tone24}
          pctBar={metrics.uptime24h}
        />
        <MetricCard
          label="Uptime 7 hari"
          value={formatUptime(metrics.uptime7d)}
          sub={`Sampel ${metrics.sampleCount7d}`}
          icon={ShieldCheck}
          tone={tone7}
          pctBar={metrics.uptime7d}
        />
        <MetricCard
          label="Insiden 24 jam"
          value={metrics.incidents24h}
          sub="Offline / anomali"
          icon={AlertTriangle}
          tone={metrics.incidents24h > 5 ? 'warning' : 'neutral'}
        />
        <MetricCard
          label="MTTR rata-rata"
          value={`${metrics.mttrMinutes} mnt`}
          sub="Mean time to recover"
          icon={Clock3}
          tone="neutral"
        />
      </div>
    </div>
  );
}
