import {
  Activity,
  CloudOff,
  Cloud,
  ChevronDown,
  LogOut,
  MapPinned,
  Moon,
  Radio,
  Settings2,
  ShieldCheck,
  Siren,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AGENCY_LABEL } from '../data/mockDevices';
import { REGIONS, ALL_REGION_ID } from '../data/regions';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Header({
  agencyLabel = AGENCY_LABEL,
  connectionStatus = 'disconnected',
  regions = REGIONS,
  selectedRegionId,
  onRegionChange,
  muted = false,
  onToggleMute,
  onOpenAdmin,
  onTestBroadcast,
  networkOnline = true,
}) {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  const regionSelectOptions = regions.some((r) => r.id === ALL_REGION_ID)
    ? regions
    : [{ id: ALL_REGION_ID, label: 'Semua Stasiun' }, ...regions];

  const netBadge = networkOnline
    ? {
        label: 'Online',
        wrap: isDark
          ? 'border-sky-500/35 bg-sky-500/10 text-sky-300'
          : 'border-sky-200 bg-sky-50 text-sky-700',
        Icon: Cloud,
        dot: 'bg-sky-400',
      }
    : {
        label: 'Offline Mode - Cached Data',
        wrap: isDark
          ? 'border-amber-500/35 bg-amber-500/10 text-amber-300'
          : 'border-amber-200 bg-amber-50 text-amber-800',
        Icon: CloudOff,
        dot: 'bg-amber-400',
      };

  const wsBadge = isConnected
    ? {
        label: 'Connected',
        wrap: isDark
          ? 'border-emerald-500/35 bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300'
          : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white text-emerald-700',
        Icon: Wifi,
        dot: 'bg-emerald-400',
      }
    : isConnecting
      ? {
          label: 'Connecting…',
          wrap: isDark
            ? 'border-amber-500/35 bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300'
            : 'border-amber-200 bg-gradient-to-r from-amber-50 to-white text-amber-700',
          Icon: Activity,
          dot: 'bg-amber-400',
        }
      : {
          label: 'Disconnected',
          wrap: isDark
            ? 'border-red-500/35 bg-gradient-to-r from-red-500/20 to-red-500/5 text-red-300'
            : 'border-red-200 bg-gradient-to-r from-red-50 to-white text-red-700',
          Icon: WifiOff,
          dot: 'bg-red-400',
        };

  const roleLabel =
    user?.role === 'administrator' ? 'Administrator' : 'Operator';

  return (
    <header
      className={`z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-3 transition-colors duration-300 md:px-5 ${
        isDark
          ? 'border-slate-700/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
            isDark ? 'bg-sky-500/15 ring-sky-400/35' : 'bg-sky-50 ring-sky-200'
          }`}
        >
          <Radio
            className={`h-5 w-5 ${isDark ? 'text-sky-300' : 'text-sky-600'}`}
            strokeWidth={2.25}
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${wsBadge.dot} ${
              isDark ? 'border-slate-950' : 'border-white'
            }`}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h1
              className={`text-base font-semibold tracking-tight md:text-lg ${
                isDark
                  ? 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent'
                  : 'text-slate-900'
              }`}
            >
              OmniWatch
            </h1>
            <span className={`hidden sm:inline ${isDark ? 'text-slate-600' : 'text-gray-300'}`}>
              |
            </span>
            <p
              className={`truncate text-xs sm:text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {agencyLabel}
            </p>
          </div>
          <p
            className={`hidden items-center gap-1.5 text-[11px] md:flex ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className={`h-3 w-3 ${isDark ? 'text-sky-400/80' : 'text-sky-500'}`} />
            {user?.displayName || user?.username} · {roleLabel}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <label className="relative hidden items-center sm:flex">
          <MapPinned
            className={`pointer-events-none absolute left-2.5 h-3.5 w-3.5 ${
              isDark ? 'text-sky-400' : 'text-sky-600'
            }`}
          />
          <select
            value={selectedRegionId}
            onChange={(e) => onRegionChange?.(e.target.value)}
            aria-label="Pilih wilayah stasiun"
            className={`appearance-none rounded-xl border py-1.5 pl-8 pr-8 text-xs font-medium outline-none transition focus:ring-2 focus:ring-sky-400/40 ${
              isDark
                ? 'border-slate-700/80 bg-slate-900 text-slate-200 hover:border-slate-500'
                : 'border-gray-200 bg-gray-50 text-slate-700 hover:border-sky-300'
            }`}
          >
            {regionSelectOptions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`pointer-events-none absolute right-2 h-3.5 w-3.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
        </label>

        <select
          value={selectedRegionId}
          onChange={(e) => onRegionChange?.(e.target.value)}
          aria-label="Pilih wilayah stasiun"
          className={`max-w-[7.5rem] appearance-none rounded-xl border px-2 py-1.5 text-[11px] font-medium outline-none sm:hidden ${
            isDark
              ? 'border-slate-700/80 bg-slate-900 text-slate-200'
              : 'border-gray-200 bg-gray-50 text-slate-700'
          }`}
        >
          {regionSelectOptions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.label}
            </option>
          ))}
        </select>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            title="Panel Administrator"
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition ${
              isDark
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'
                : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden lg:inline">Admin</span>
          </button>
        )}

        <button
          type="button"
          onClick={onTestBroadcast}
          title="Test Broadcast Alert"
          className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition ${
            isDark
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
              : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <Siren className="h-4 w-4" />
          <span className="hidden xl:inline">Test Broadcast</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute alarm' : 'Mute alarm'}
          title={muted ? 'Unmute Alarm' : 'Mute Alarm'}
          className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition duration-200 ${
            muted
              ? isDark
                ? 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              : isDark
                ? 'border-slate-700/80 bg-slate-900 text-emerald-300 hover:border-slate-500'
                : 'border-gray-200 bg-gray-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          <span className="hidden lg:inline">{muted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition duration-200 ${
            isDark
              ? 'border-slate-700/80 bg-slate-900 text-amber-300 hover:border-slate-500 hover:bg-slate-800'
              : 'border-gray-200 bg-gray-50 text-slate-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600'
          }`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div
          className={`flex max-w-[11rem] items-center gap-1.5 rounded-full border px-2 py-1.5 text-[10px] font-medium shadow-sm sm:max-w-none sm:gap-2 sm:px-2.5 sm:text-xs ${netBadge.wrap}`}
          title={
            networkOnline
              ? 'Jaringan online'
              : 'Mode offline — menampilkan data & peta dari cache lokal'
          }
        >
          <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ${netBadge.dot}`} />
          <netBadge.Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{netBadge.label}</span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium shadow-sm sm:px-3 ${wsBadge.wrap}`}
          title="Status koneksi WebSocket"
        >
          <span className="relative flex h-2 w-2">
            {(isConnected || isConnecting) && (
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${wsBadge.dot}`}
              />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${wsBadge.dot}`} />
          </span>
          <wsBadge.Icon className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{wsBadge.label}</span>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Keluar"
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
            isDark
              ? 'border-slate-700/80 bg-slate-900 text-slate-300 hover:border-red-500/40 hover:text-red-300'
              : 'border-gray-200 bg-gray-50 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
