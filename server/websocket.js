/**
 * OmniWatch local WebSocket backend
 * Broadcasts live device updates on ws://localhost:5000
 *
 * Run: npm run server
 */
import { WebSocketServer } from 'ws';
import { mockDevices } from '../src/data/mockDevices.js';

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const BROADCAST_MS = 5000;

let devices = mockDevices.map((d) => ({ ...d }));

function nextStatus(current) {
  if (current === 'normal') return Math.random() < 0.7 ? 'warning' : 'offline';
  if (current === 'warning') return Math.random() < 0.55 ? 'offline' : 'normal';
  return Math.random() < 0.65 ? 'normal' : 'warning';
}

function applyMetrics(device, status) {
  const nowIso = new Date().toISOString();
  if (status === 'normal') {
    return {
      ...device,
      status,
      lastUpdate: nowIso,
      battery: Math.min(100, (device.battery ?? 80) + Math.floor(Math.random() * 5)),
      signal: 80 + Math.floor(Math.random() * 20),
    };
  }
  if (status === 'warning') {
    return {
      ...device,
      status,
      lastUpdate: nowIso,
      battery: 40 + Math.floor(Math.random() * 25),
      signal: 35 + Math.floor(Math.random() * 30),
    };
  }
  return {
    ...device,
    status,
    lastUpdate: nowIso,
    battery: Math.max(0, Math.floor(Math.random() * 15)),
    signal: 0,
  };
}

function mutateDevices() {
  const next = devices.map((d) => ({ ...d }));
  const count = 1 + Math.floor(Math.random() * 2);
  const picked = new Set();

  while (picked.size < Math.min(count, next.length)) {
    picked.add(Math.floor(Math.random() * next.length));
  }

  picked.forEach((index) => {
    const device = next[index];
    const status = nextStatus(device.status);
    next[index] = applyMetrics(device, status);
  });

  // Always refresh at least one timestamp for sync feel
  const syncIndex = Math.floor(Math.random() * next.length);
  next[syncIndex] = {
    ...next[syncIndex],
    lastUpdate: new Date().toISOString(),
  };

  devices = next;
  return devices;
}

function broadcast(wss, payload) {
  const raw = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(raw);
    }
  });
}

const wss = new WebSocketServer({ host: HOST, port: PORT });

wss.on('connection', (socket) => {
  console.log(`[OmniWatch WS] Client connected (${wss.clients.size} total)`);

  socket.send(
    JSON.stringify({
      type: 'devices',
      devices,
      serverTime: new Date().toISOString(),
    }),
  );

  socket.on('message', (raw) => {
    try {
      const msg = JSON.parse(String(raw));
      if (msg?.type === 'subscribe') {
        socket.send(
          JSON.stringify({
            type: 'devices',
            devices,
            serverTime: new Date().toISOString(),
          }),
        );
      }
    } catch {
      /* ignore malformed client messages */
    }
  });

  socket.on('close', () => {
    console.log(`[OmniWatch WS] Client disconnected (${wss.clients.size} total)`);
  });
});

setInterval(() => {
  const updated = mutateDevices();
  broadcast(wss, {
    type: 'devices',
    devices: updated,
    serverTime: new Date().toISOString(),
  });
}, BROADCAST_MS);

console.log(`[OmniWatch WS] Listening on ws://${HOST}:${PORT}`);
