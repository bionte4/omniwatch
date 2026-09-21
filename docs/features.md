# Fitur OmniWatch

## Monitoring & peta

| Fitur | Deskripsi |
|-------|-----------|
| Peta Leaflet | Marker berwarna Normal / Warning / Offline |
| Multi-region | Padang, Mentawai, Bukittinggi + **Semua Stasiun** |
| Layer peta | Zona rawan, jalur evakuasi, coverage radio (ilustratif) |
| Highlight | Pulse pada sidebar & marker saat status kritis |
| Telemetri modal | Grafik tren 24 jam, baterai, sinyal/RSSI, kontak teknisi |
| Reminder kalibrasi | Jadwal next calibration di modal perangkat |
| Timeline playback | Scrub status 24 jam terakhir (simulasi historis) |

## Alert & notifikasi

| Fitur | Deskripsi |
|-------|-----------|
| Live Alert Log | Drawer bawah + ticker |
| Siren | Web Audio bip Warning/Offline; mute di Header / hotkey `M` |
| Escalation | Warning→Telegram; Offline lama→WhatsApp (simulasi) |
| Broadcast channel | Target grup/nomor di Admin |
| Desktop notification | Web Notification untuk Offline kritis |
| Export laporan | CSV / teks / PDF-print dari drawer |

## Operasional

| Fitur | Deskripsi |
|-------|-----------|
| SLA / Uptime | Kartu 24 jam & 7 hari, insiden, MTTR di sidebar |
| Work order | Tiket dari alert Offline; assign, catatan, status |
| Wall display | Layout fullscreen ruang kontrol |
| Hotkey piket | Mute, clear log, loncat stasiun, wall, help |

## Admin & data

| Fitur | Deskripsi |
|-------|-----------|
| Integrasi | Kartu konektor MQTT / HTTP / Modbus / Serial |
| Gateway | Beralih simulasi ↔ WebSocket lapangan |
| Wizard ingest | Paste JSON payload → auto-map → impor perangkat |
| Threshold editor | Ambang per tipe sensor |
| Konfigurasi wilayah | Label, center, zoom |
| Tambah perangkat | Form manual + wizard |
| Backup / restore | Export-import JSON konfigurasi |

## Akses & ketahanan

| Fitur | Deskripsi |
|-------|-----------|
| Auth + RBAC | Viewer, Operator, Teknisi, Admin Stasiun, Administrator |
| Light / Dark | Toggle di Header |
| PWA + cache | Offline resilience untuk data & peta |

Detail peran: [rbac.md](./rbac.md) · Operasional: [operations.md](./operations.md).
