# OmniWatch

Dashboard **command center** white-label untuk monitoring perangkat BMKG (seismometer, AWS, tide gauge, accelerograph, ARG) di wilayah Sumatera Barat — Padang, Mentawai, dan Bukittinggi.

Stack: **React (Vite) · Tailwind CSS · Leaflet · WebSocket · Nginx · Docker**

---

## Fitur utama

| Modul | Keterangan |
|--------|------------|
| Peta real-time | Marker status Normal / Warning / Offline (Leaflet) |
| Multi-region | Filter stasiun + opsi **Semua Stasiun** |
| Live alert | Drawer log kejadian + siren suara (mute/unmute) |
| WebSocket | Sinkronisasi status perangkat tanpa refresh |
| Auth & RBAC | Login Operator / Administrator |
| Admin panel | Integrasi MQTT/HTTP, threshold, wilayah, perangkat, broadcast |
| SLA / Uptime | Kartu uptime 24 jam & 7 hari per stasiun |
| Telemetri | Modal grafik tren + reminder kalibrasi |
| Timeline playback | Scrub 24 jam terakhir |
| Export laporan | CSV / teks incident |
| PWA + offline | Installable, cache perangkat & tile peta |
| Docker | Frontend + backend siap VPS / on-premise |

---

## Arsitektur deployment

```
Browser ──HTTPS/HTTP──► Nginx (frontend :80 / host :8080)
                            │
                            ├── /*     → static SPA (React build)
                            └── /ws    → proxy WebSocket → Node backend :5000
```

Di production, URL WebSocket mengikuti origin browser (`ws://host/ws` atau `wss://host/ws`), sehingga **satu entry point** cukup untuk UI dan live data.

---

## Persyaratan

### Development
- Node.js **20+** (disarankan 22 LTS)
- npm 10+

### VPS / on-premise (Docker — direkomendasikan)
- Docker Engine **24+**
- Docker Compose **v2**
- Port host bebas: default **8080** (bisa diubah)
- RAM minimal ~512 MB untuk stack ringan ini

### On-premise tanpa Docker
- Node.js 20+
- Nginx (atau reverse proxy lain) untuk SPA + proxy `/ws`
- Opsional: systemd / PM2 untuk proses backend

---

## Akun demo

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | Administrator (konfigurasi, integrasi, perangkat) |
| `operator` | `operator` | Operator (pantau peta, alert, mute) |

> Ganti kredensial sebelum dipakai operasional nyata (`src/data/users.js`).

---

## Development lokal

```bash
git clone https://github.com/bionte4/omniwatch.git
cd omniwatch
npm install
```

**Terminal 1 — WebSocket backend**

```bash
npm run server
# ws://localhost:5000
```

**Terminal 2 — frontend Vite**

```bash
npm run dev
# http://localhost:5173
```

Build & preview produksi lokal:

```bash
npm run build
npm run preview
```

### Variabel lingkungan (opsional)

| Variabel | Kapan | Contoh |
|----------|--------|--------|
| `VITE_WS_URL` | Build frontend | `ws://10.10.1.5:5000` atau kosong (= same-origin `/ws`) |
| `PORT` | Backend | `5000` |
| `HOST` | Backend | `0.0.0.0` |

---

## Deploy dengan Docker (VPS & on-premise)

Cara tercepat dan **sama** untuk VPS cloud maupun server on-premise.

### 1. Siapkan mesin

```bash
# Ubuntu/Debian contoh
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
# logout/login agar grup docker aktif
```

### 2. Clone & jalankan

```bash
git clone https://github.com/bionte4/omniwatch.git
cd omniwatch
docker compose up --build -d
```

| Layanan | URL |
|---------|-----|
| Dashboard | **http://\<IP-server\>:8080** |
| WebSocket | `ws://\<IP-server\>:8080/ws` (otomatis via Nginx) |

### 3. Operasional

```bash
# Status
docker compose ps

# Log
docker compose logs -f frontend
docker compose logs -f backend

# Restart
docker compose restart

# Stop
docker compose down

# Rebuild setelah update kode
git pull
docker compose up --build -d
```

### 4. Ubah port host (opsional)

Edit `docker-compose.yml`:

```yaml
ports:
  - "80:80"        # langsung port 80
  # atau
  - "8443:80"      # custom
```

Lalu:

```bash
docker compose up --build -d
```

### 5. HTTPS di VPS (disarankan produksi)

Pasang reverse proxy di host (Nginx / Caddy / Traefik) di depan container `:8080`.

Contoh cuplikan **Nginx host** (Let's Encrypt):

```nginx
server {
    listen 443 ssl http2;
    server_name omniwatch.contoh.go.id;

    ssl_certificate     /etc/letsencrypt/live/omniwatch.contoh.go.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/omniwatch.contoh.go.id/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }
}
```

Browser akan memakai **`wss://`** otomatis saat situs HTTPS.

Firewall VPS (contoh UFW):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# jika akses langsung :8080 tanpa proxy:
# sudo ufw allow 8080/tcp
sudo ufw enable
```

---

## Deploy on-premise tanpa Docker

Cocok untuk lingkungan yang melarang container atau sudah punya Nginx/IIS internal.

### A. Build frontend

```bash
npm ci
# Kosongkan VITE_WS_URL agar memakai /ws same-origin
VITE_WS_URL= npm run build
# Hasil: folder dist/
```

### B. Jalankan backend WebSocket

```bash
# Development dependency runtime: package "ws"
HOST=0.0.0.0 PORT=5000 node server/websocket.js
```

Dengan **PM2**:

```bash
npm i -g pm2
pm2 start server/websocket.js --name omniwatch-ws \
  --env PORT=5000 --env HOST=0.0.0.0
pm2 save
pm2 startup
```

Dengan **systemd** (`/etc/systemd/system/omniwatch-ws.service`):

```ini
[Unit]
Description=OmniWatch WebSocket
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/omniwatch
ExecStart=/usr/bin/node server/websocket.js
Environment=PORT=5000
Environment=HOST=0.0.0.0
Restart=on-failure
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now omniwatch-ws
```

### C. Nginx on-premise

1. Salin isi `dist/` ke document root, mis. `/var/www/omniwatch`
2. Salin pola dari `nginx.conf` proyek (SPA + `/ws` → `127.0.0.1:5000`)

```nginx
server {
    listen 80;
    server_name omniwatch.lokal;

    root /var/www/omniwatch;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /ws {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }
}
```

LAN / air-gapped: akses lewat `http://IP-internal` atau hostname DNS internal. Tidak perlu internet setelah image/package terpasang (kecuali tile peta online — cache PWA membantu setelah tile pernah dimuat).

---

## Checklist go-live

- [ ] `docker compose up --build -d` (atau stack Node+Nginx) berjalan
- [ ] UI terbuka dari jaringan operasional
- [ ] Badge Header: **Connected** (WebSocket)
- [ ] Login admin & operator berhasil
- [ ] Pilih **Semua Stasiun** / stasiun tunggal OK
- [ ] Alert live muncul di drawer
- [ ] HTTPS + `wss` (jika publik / VPS)
- [ ] Firewall hanya buka port yang diperlukan
- [ ] Ganti password demo
- [ ] Backup: simpan `docker-compose.yml`, config Nginx, dan volume/data jika nanti diperluas

---

## Struktur proyek

```
omniwatch/
├── src/                 # Frontend React
│   ├── components/      # UI dashboard, admin, peta, modal
│   ├── hooks/           # Realtime, siren, SLA, threshold, broadcast
│   ├── data/            # Mock devices, regions, users, thresholds
│   ├── context/         # Auth & theme
│   └── utils/           # Cache, export, telemetri, kalibrasi
├── server/
│   ├── websocket.js     # Backend simulasi live devices
│   └── Dockerfile
├── public/              # Ikon PWA
├── Dockerfile           # Build Vite → Nginx
├── nginx.conf           # SPA + proxy /ws
├── docker-compose.yml   # Orkestrasi VPS / on-prem
└── vite.config.js       # Vite + PWA plugin
```

---

## Troubleshooting

| Gejala | Perbaikan |
|--------|-----------|
| Badge **Disconnected** | Pastikan backend up; di Docker cek `docker compose logs backend`. Path harus `/ws` lewat Nginx. |
| Port 8080 bentrok | Ubah mapping di `docker-compose.yml` atau hentikan proses lain. |
| Port 5000 bentrok di lokal | Docker backend **tidak** publish 5000 ke host (hanya internal). Konflik biasanya dari `npm run server` ganda — hentikan proses lama. |
| Peta kosong / tile gagal | Butuh akses outbound ke penyedia tile (atau gunakan cache setelah pernah online). |
| HTTPS tapi WS gagal | Pastikan proxy `/ws` mengizinkan Upgrade; frontend memakai `wss://` otomatis. |
| Halaman 404 saat refresh | Pastikan `try_files … /index.html` aktif di Nginx. |

---

## Lisensi & kontribusi

Proyek demo / prototipe operasional BMKG Padang. Sesuaikan branding white-label, kredensial, dan sumber data nyata sebelum produksi.

Repository: [github.com/bionte4/omniwatch](https://github.com/bionte4/omniwatch)
