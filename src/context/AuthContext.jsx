import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authenticate, isAdmin, ROLES } from '../data/users';

const AuthContext = createContext(null);
const STORAGE_KEY = 'omniwatch-auth-session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.username || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());

  const login = useCallback((username, password) => {
    const session = authenticate(username, password);
    if (!session) {
      return { ok: false, error: 'Username atau password salah.' };
    }

    const payload = {
      ...session,
      loggedInAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota */
    }

    setUser(payload);
    return { ok: true, user: payload };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: isAdmin(user),
      isOperator: user?.role === ROLES.OPERATOR,
      login,
      logout,
      ROLES,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
