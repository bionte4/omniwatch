# Operasional piket

Panduan untuk petugas di ruang kontrol / lapangan.

## Mode Wall Display

Tujuan: tampilan penuh untuk layar monitor besar.

**Cara aktifkan**
- Tombol **Wall** di Header, atau hotkey `F`
- Browser masuk fullscreen; sidebar & timeline disembunyikan; peta membesar; log alert lebih tinggi

**Keluar:** tombol **Exit Wall**, atau `Esc`

Pref disimpan di `localStorage` (`omniwatch-wall-display`).

---

## Hotkey

Tekan `?` untuk overlay bantuan.

| Tombol | Aksi |
|--------|------|
| `M` | Mute / unmute siren |
| `C` | Clear Live Alert Log |
| `[` / `]` atau `←` / `→` | Loncat stasiun (termasuk Semua Stasiun) |
| `F` | Toggle wall display |
| `Esc` | Keluar wall display |
| `?` | Tampilkan / sembunyikan bantuan hotkey |

Hotkey diabaikan saat fokus di input/textarea.

---

## Notifikasi desktop

Untuk alert **Offline** kritis (Web Notification API).

1. Klik ikon **Bell** di Header.  
2. Izinkan notifikasi di prompt browser.  
3. Notifikasi muncul saat perangkat masuk status Offline (dengan tag per device agar tidak spam berlebih).

Matikan lewat tombol Bell yang sama (pref `omniwatch-desktop-notify`).

---

## Work order

1. Dari Live Alert Log → tombol **WO** pada baris Offline, atau auto-buat jika escalation policy aktif.  
2. Kelola di Admin → **Work Order**, atau drawer WO (teknisi/operator).  
3. Status: Open → Proses → Selesai; assign teknisi; catatan & catatan foto (teks).

---

## Escalation (simulasi)

Admin → **Eskalasi**:

- Warning → Telegram (L1)  
- Offline → Telegram segera  
- Offline > N menit → WhatsApp on-call (L2)  
- Opsi auto-buat Work Order

Default demo escalate WhatsApp setelah **2 menit** (bisa 0.25 untuk uji cepat).

Broadcast channel tujuan diatur di tab **Broadcast**.

---

## SLA / Uptime

Kartu di sidebar: uptime 24 jam & 7 hari, jumlah insiden, MTTR.  
Awalnya baseline seeded; setelah sampling live cukup, angka mengikuti status armada.

---

## Checklist shift piket

- [ ] Login dengan role yang sesuai  
- [ ] Pastikan badge WebSocket **Connected**  
- [ ] Cek wilayah (atau Semua Stasiun)  
- [ ] Siren tidak ter-mute tanpa sengaja (`M`)  
- [ ] Izinkan notifikasi desktop jika shift jauh dari layar  
- [ ] Untuk wall TV: aktifkan Wall (`F`)  
- [ ] Review WO terbuka di awal/akhir shift
