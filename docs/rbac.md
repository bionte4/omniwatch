# RBAC & akun demo

Hak akses dikelola di `src/data/users.js` dan dicek lewat `can(permission)` di `AuthContext`.

## Role

| Role | ID | Fokus |
|------|-----|--------|
| Administrator | `administrator` | Konfigurasi penuh sistem |
| Admin Stasiun | `station_admin` | Operasi satu stasiun (threshold, device, WO, backup) |
| Teknisi | `technician` | Work order lapangan |
| Operator Piket | `operator` | Pantau, mute, WO |
| Viewer | `viewer` | Pantau saja |

## Akun demo

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | Administrator |
| `adminpdg` | `adminpdg` | Admin Stasiun (Padang) |
| `teknisi` | `teknisi` | Teknisi |
| `operator` | `operator` | Operator Piket |
| `viewer` | `viewer` | Viewer |

> **Produksi:** ganti kredensial di `src/data/users.js` (atau ganti ke auth sungguhan / SSO).

Admin Stasiun membawa `stationId` (contoh: `padang`) untuk konteks wilayah.

## Matriks permission (ringkas)

| Capability | Viewer | Operator | Teknisi | Admin Stasiun | Admin |
|------------|:------:|:--------:|:-------:|:-------------:|:-----:|
| Lihat dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mute alarm | | ✓ | ✓ | ✓ | ✓ |
| Test broadcast | | | | ✓ | ✓ |
| Panel Admin | | | | ✓ | ✓ |
| Integrasi / Gateway | | | | | ✓ |
| Threshold / Eskalasi | | | | ✓ | ✓ |
| Work order | | ✓ | ✓ | ✓ | ✓ |
| Wilayah (region config) | | | | | ✓ |
| Perangkat / wizard | | | | ✓ | ✓ |
| Broadcast channel | | | | ✓ | ✓ |
| Backup / restore | | | | ✓ | ✓ |

Tab Admin difilter otomatis per role (`getAdminTabsForRole`).

## UI terkait role

- **Admin / Admin Stasiun** → tombol Admin di Header.  
- **Teknisi / Operator** → tombol **WO** (drawer work order) jika tidak punya panel Admin.  
- **Viewer** → tanpa mute, broadcast, admin, WO.
