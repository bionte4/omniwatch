import { useState } from 'react';
import { Eye, EyeOff, Lock, Radio, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div
      className={`flex min-h-screen w-screen items-center justify-center px-4 ${
        isDark
          ? 'dark bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-slate-100 via-white to-sky-50 text-slate-800'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-xl sm:p-8 ${
          isDark
            ? 'border-slate-700/80 bg-slate-900/90'
            : 'border-gray-200 bg-white'
        }`}
      >
        <div className="mb-6 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${
              isDark ? 'bg-sky-500/15 ring-sky-400/30' : 'bg-sky-50 ring-sky-200'
            }`}
          >
            <Radio className={`h-5 w-5 ${isDark ? 'text-sky-300' : 'text-sky-600'}`} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">OmniWatch</h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Masuk ke pusat pantauan BMKG
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin atau operator"
                className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-sky-400/40 ${
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600'
                    : 'border-gray-200 bg-gray-50 text-slate-800 placeholder:text-slate-400'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-sky-400/40 ${
                  isDark
                    ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600'
                    : 'border-gray-200 bg-gray-50 text-slate-800 placeholder:text-slate-400'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />
            {submitting ? 'Memverifikasi…' : 'Masuk'}
          </button>
        </form>

        <div
          className={`mt-6 rounded-xl border p-3 text-[11px] leading-relaxed ${
            isDark
              ? 'border-slate-700 bg-slate-950/60 text-slate-400'
              : 'border-gray-200 bg-gray-50 text-slate-500'
          }`}
        >
          <p className="mb-1 font-semibold text-slate-600 dark:text-slate-300">
            Akun demo
          </p>
          <p>
            Administrator: <code className="font-mono">admin / admin</code>
          </p>
          <p>
            Operator: <code className="font-mono">operator / operator</code>
          </p>
          <p className="mt-2">
            Operator: pantau peta, alert, mute alarm. Administrator: + tambah
            perangkat & konfigurasi wilayah.
          </p>
        </div>
      </div>
    </div>
  );
}
