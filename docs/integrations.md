# Integrasi & data

## Konektor perangkat (Admin → Integrasi)

Kartu konektor simulasi:

- MQTT Broker  
- HTTP Webhook  
- Modbus TCP Gateway  
- Serial Gateway  

Setiap konektor punya status (Connected / Degraded / Disconnected), latency, pesan/menit, error rate, serta aksi **Test Ping**, **Reconnect**, Enable/Disable, Edit, Hapus.

Data tersimpan di `localStorage` (`omniwatch-device-integrations`).

---

## Sumber data real-time (Admin → Gateway)

| Mode | Perilaku |
|------|----------|
| **Simulasi OmniWatch** | WebSocket bawaan (`localhost:5000` / Docker `/ws`) |
| **Gateway lapangan** | URL custom `ws://` atau `wss://` |

Setelah simpan, frontend reconnect ke endpoint aktif.  
Format pesan harus mengikuti [WebSocket API](./websocket.md).

Konfigurasi: `omniwatch-data-source`.

---

## Wizard ingest perangkat (Admin → Device)

Tempel payload JSON dari MQTT/HTTP → **Parse & Auto-map** → preview mapping → **Impor**.

Field yang dikenali otomatis (alias umum):

| OmniWatch | Contoh key sumber |
|-----------|-------------------|
| `id` | `device_id`, `sensorId`, `imei` |
| `name` | `station_name`, `deviceName` |
| `type` | `sensor_type`, `type` |
| `lat` / `lng` | `latitude`/`longitude`, `lat`/`lon` |
| `status` | `state`, `status` (`OK`→normal, dll.) |
| `battery` | `battery_pct`, `batt` |
| `signal` | `rssi` (dBm dinormalisasi ke %), `signal` |
| `region` | `region_id`, nama stasiun |

Sediakan tombol **Contoh MQTT** / **Contoh HTTP** di UI.

Implementasi: `src/utils/payloadMapper.js`, `DeviceIngestWizard.jsx`.

---

## Threshold (Admin → Ambang)

Ambang Warning & Critical per tipe: Seismometer, AWS, Tide Gauge, Accelerograph, ARG.  
Dipakai di modal telemetri untuk evaluasi bacaan terakhir.

---

## Layer peta

Toggle di kiri atas peta (bukan data resmi BMKG — ilustrasi UI):

- Zona rawan (polygon)  
- Jalur evakuasi (line)  
- Coverage radio (circle)

Data: `src/data/mapLayers.js`.

---

## Backup & restore (Admin → Backup)

Export/import JSON berisi antara lain:

- regions, thresholds, integrations  
- escalation, broadcast, dataSource  
- localDevices, workOrders (opsional)

Setelah import, aplikasi me-refresh agar state sinkron.  
Detail: `src/utils/backup.js`.
