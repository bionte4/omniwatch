# Arsitektur OmniWatch

## Ringkasan

OmniWatch adalah SPA React yang menampilkan peta & status perangkat lapangan secara real-time melalui **WebSocket**. Production dijalankan sebagai dua kontainer:

1. **Frontend** — build Vite → static files di Nginx  
2. **Backend** — Node.js (`ws`) menyiarkan update perangkat (simulasi atau diganti gateway lapangan)

```
┌─────────────┐     HTTP/S + WS      ┌──────────────────┐
│   Browser   │ ◄──────────────────► │ Nginx :8080/:80  │
│  (React)    │                      │  /* → SPA        │
└─────────────┘                      │  /ws → backend   │
                                     └────────┬─────────┘
                                              │
                                     ┌────────▼─────────┐
                                     │ Node WS :5000    │
                                     │ (internal Docker)│
                                     └──────────────────┘
```

Di production, URL WebSocket = same-origin (`ws(s)://<host>/ws`) agar cukup satu port publik.

---

## Stack

| Lapisan | Teknologi |
|---------|-----------|
| UI | React 19, Vite 6, Tailwind CSS 4 |
| Peta | Leaflet, react-leaflet |
| Grafik | Recharts |
| Ikon | Lucide React |
| Realtime | WebSocket (`ws` di Node) |
| PWA | vite-plugin-pwa, Workbox |
| Deploy | Docker Compose, Nginx |

---

## Struktur `src/`

```
src/
├── components/     # UI: Header, Sidebar, Map, Admin, modal, drawer
├── hooks/          # Realtime, siren, SLA, WO, escalation, wall, hotkey, …
├── context/        # Auth, Theme
├── data/           # Mock devices, regions, users, thresholds, map layers
├── utils/          # Cache, backup, payload mapper, export, telemetri
├── config/         # resolveWsUrl()
├── App.jsx         # Orkestrasi dashboard
└── main.jsx
```

Backend: `server/websocket.js` (+ `server/Dockerfile`).

---

## Alur data perangkat

1. Hook `useRealtimeDevices` membuka WebSocket ke `resolveWsUrl()` / gateway custom.  
2. Pesan masuk → update state `devices` + generate `alerts` jika status berubah.  
3. Siren, escalation, broadcast simulasi, desktop notification, dan work order otomatis bereaksi ke alert.  
4. Snapshot terakhir disimpan ke LocalStorage + IndexedDB (`deviceCache`) untuk mode offline.  
5. Perangkat lokal (ditambah admin / wizard) digabung di `App.jsx` dengan data live.

---

## Penyimpanan lokal (browser)

| Key (contoh) | Isi |
|--------------|-----|
| `omniwatch-auth-session` | Sesi login |
| `omniwatch-regions-config` | Konfigurasi wilayah |
| `omniwatch-alert-thresholds` | Ambang Warning/Critical |
| `omniwatch-device-integrations` | Konektor MQTT/HTTP |
| `omniwatch-escalation-policy` | Kebijakan eskalasi |
| `omniwatch-broadcast-channels` | Target Telegram/WA (simulasi) |
| `omniwatch-data-source` | Mode simulasi vs gateway URL |
| `omniwatch-work-orders` | Tiket teknisi |
| `omniwatch-local-devices` | Perangkat ditambah manual/wizard |
| `omniwatch-wall-display` | Pref wall mode |
| `omniwatch-desktop-notify` | Pref notifikasi desktop |

Backup/restore mengumpulkan sebagian besar key di atas (lihat Admin → Backup).

---

## Tema & PWA

- Theme: class `dark` pada root via `ThemeContext`.  
- PWA: installable; Service Worker cache asset + tile yang pernah dibuka.  
- Offline badge di Header saat jaringan putus.
