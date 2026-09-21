# Deployment

Panduan ringkas. Detail perintah juga ada di [README utama](../README.md).

## Development lokal

```bash
git clone https://github.com/bionte4/omniwatch.git
cd omniwatch
npm install
```

Terminal 1:

```bash
npm run server   # ws://localhost:5000
```

Terminal 2:

```bash
npm run dev      # http://localhost:5173
```

Build preview:

```bash
npm run build && npm run preview
```

Variabel opsional saat build:

```bash
VITE_WS_URL=wss://gateway.contoh.local/ws npm run build
```

Kosongkan `VITE_WS_URL` agar production memakai same-origin `/ws`.

---

## Docker (VPS & on-premise)

```bash
docker compose up --build -d
```

| Layanan | Akses |
|---------|--------|
| UI | http://\<IP\>:8080 |
| WebSocket | ws://\<IP\>:8080/ws |

```bash
docker compose logs -f
docker compose down
git pull && docker compose up --build -d
```

Ubah port host di `docker-compose.yml` (`ports: "80:80"` dll.).

### HTTPS (VPS)

Pasang Nginx/Caddy di host di depan `:8080`. Proxy `/` dan `/ws` (Upgrade WebSocket). Frontend otomatis memakai `wss://` jika halaman HTTPS.

---

## On-premise tanpa Docker

1. `npm ci && VITE_WS_URL= npm run build` → salin `dist/` ke document root.  
2. Jalankan `node server/websocket.js` (PM2 / systemd), `HOST=0.0.0.0 PORT=5000`.  
3. Nginx: SPA `try_files` + `location /ws` → `http://127.0.0.1:5000/`.

Contoh unit & cuplikan Nginx: lihat README bagian *Deploy on-premise tanpa Docker*.

---

## File terkait

| File | Fungsi |
|------|--------|
| `Dockerfile` | Multi-stage frontend → Nginx |
| `server/Dockerfile` | Backend WS |
| `nginx.conf` | SPA + proxy `/ws` |
| `docker-compose.yml` | Orkestrasi |

---

## Checklist go-live

- [ ] Stack up; UI dapat dibuka dari jaringan operasional  
- [ ] Badge **Connected**  
- [ ] Login semua role yang dipakai  
- [ ] Wall display & hotkey diuji di monitor piket  
- [ ] Notifikasi desktop diizinkan (jika diperlukan)  
- [ ] HTTPS + `wss` (publik)  
- [ ] Firewall minimal  
- [ ] Password demo diganti  
- [ ] Backup config pertama kali (Admin → Backup)

---

## Troubleshooting singkat

| Gejala | Cek |
|--------|-----|
| Disconnected | Backend up? Path `/ws`? Gateway URL benar? |
| Port bentrok | Ubah mapping Compose; hentikan `npm run server` ganda |
| WS gagal di HTTPS | Proxy Upgrade + `wss` |
| Refresh 404 | `try_files … /index.html` |
| Peta kosong | Akses tile outbound / cache PWA |
