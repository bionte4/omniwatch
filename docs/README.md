# Dokumentasi OmniWatch

Dokumentasi operasional dan teknis untuk dashboard command center **OmniWatch** (BMKG Sumatera Barat).

Repository: [github.com/bionte4/omniwatch](https://github.com/bionte4/omniwatch)

---

## Daftar isi

| Dokumen | Isi |
|---------|-----|
| [Arsitektur](./architecture.md) | Stack, struktur folder, alur data |
| [Fitur](./features.md) | Ringkasan modul dashboard |
| [RBAC & akun](./rbac.md) | Role, permission, akun demo |
| [Operasional piket](./operations.md) | Wall display, hotkey, notifikasi, WO, eskalasi |
| [Integrasi & data](./integrations.md) | MQTT/HTTP, wizard ingest, gateway WS |
| [WebSocket API](./websocket.md) | Format pesan live devices |
| [Deployment](./deployment.md) | Dev lokal, Docker VPS, on-premise |

Mulai cepat: lihat [README utama](../README.md).

---

## Audiens

- **Operator / teknisi** → Operasional piket, RBAC
- **Admin stasiun** → Fitur admin, backup, threshold
- **DevOps / IT** → Deployment, arsitektur, WebSocket
- **Pengembang** → Struktur kode, API pesan

---

## Versi dokumen

Disusun mengikuti kode di branch `main` (fitur RBAC granular, work order, wall display, backup/restore).
