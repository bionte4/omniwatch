# WebSocket API (live devices)

Endpoint default:

| Lingkungan | URL |
|------------|-----|
| Dev frontend | `ws://localhost:5000` |
| Docker / Nginx | `ws://<host>:8080/ws` atau `wss://` di belakang TLS |
| Gateway custom | Diisi di Admin → Gateway |

Resolusi URL: `src/config/ws.js` (`VITE_WS_URL` build-time, atau same-origin `/ws`).

---

## Pesan yang didukung (client ← server)

### 1. Daftar perangkat penuh

```json
{
  "type": "devices",
  "devices": [ /* Device[] */ ]
}
```

atau array langsung: `[ ...devices ]`.

### 2. Update satu perangkat

```json
{
  "type": "device_update",
  "device": { "id": "SM-PDG-01", "status": "offline", "battery": 12, "signal": 0 }
}
```

### 3. Alert eksternal (opsional)

```json
{
  "type": "alert",
  "alert": { "id": "...", "status": "offline", "message": "...", "deviceId": "..." }
}
```

---

## Model perangkat (minimal)

```json
{
  "id": "SM-PDG-01",
  "name": "Seismometer Padang Panjang",
  "type": "Seismometer",
  "region": "padang",
  "status": "normal",
  "lat": -0.4667,
  "lng": 100.4,
  "location": "Padang Panjang, Sumatera Barat",
  "lastUpdate": "2026-09-20T12:00:00+07:00",
  "battery": 92,
  "signal": 88
}
```

| Field | Nilai |
|-------|--------|
| `type` | `Seismometer` \| `AWS` \| `Tide Gauge` \| `Accelerograph` \| `ARG` |
| `status` | `normal` \| `warning` \| `offline` |
| `region` | `padang` \| `mentawai` \| `bukittinggi` |

Client mengirim saat open (opsional dihormati server):

```json
{ "type": "subscribe", "channel": "devices" }
```

---

## Backend simulasi bawaan

`server/websocket.js` memutasi status beberapa perangkat secara berkala dan broadcast ke semua client.

Untuk produksi, ganti dengan gateway BMKG / MQTT bridge yang mengeluarkan format di atas, lalu arahkan Admin → Gateway ke URL-nya.
