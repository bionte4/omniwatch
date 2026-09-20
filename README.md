# OmniWatch

Dashboard monitoring white-label berbasis React (Vite), Tailwind CSS, dan Leaflet untuk pantauan perangkat BMKG di wilayah Padang & Sumatera Barat.

## Development lokal

Terminal 1 — WebSocket backend:

```bash
npm install
npm run server
```

Terminal 2 — frontend:

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Docker (VPS / on-premise)

```bash
docker compose up --build
```

- UI: **http://localhost:8080**
- WebSocket: `ws://localhost:8080/ws` (via Nginx → backend internal)

Stop:

```bash
docker compose down
```

## PWA / Offline

Setelah `npm run build && npm run preview` (atau Docker), aplikasi dapat di-install sebagai PWA.

- Service Worker di-register otomatis via `vite-plugin-pwa`
- Data perangkat terakhir disimpan di LocalStorage + IndexedDB
- Saat jaringan putus, badge Header menampilkan **Offline Mode - Cached Data**
- Tile peta yang pernah dibuka di-cache oleh Workbox

## Struktur Docker

| File | Fungsi |
|------|--------|
| `Dockerfile` | Multi-stage build frontend → Nginx |
| `server/Dockerfile` | Backend WebSocket Node.js |
| `nginx.conf` | SPA + proxy `/ws` → backend |
| `docker-compose.yml` | Orkestrasi kedua layanan |
