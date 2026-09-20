/**
 * Resolve WebSocket endpoint for local dev and Docker/Nginx production.
 *
 * Priority:
 * 1. Explicit argument
 * 2. VITE_WS_URL build-time env
 * 3. Dev → ws://localhost:5000
 * 4. Prod → same-origin /ws (proxied by Nginx to backend)
 */
export function resolveWsUrl(explicitUrl) {
  if (explicitUrl) return explicitUrl;

  const fromEnv = import.meta.env.VITE_WS_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim();
  }

  if (import.meta.env.DEV) {
    return 'ws://localhost:5000';
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  return 'ws://localhost:5000';
}
