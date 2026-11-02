# TERRAFEST (Terra Festival ITERA)

Platform Web Terintegrasi untuk Penemuan Acara, War Tiket Berskala Besar (*Anti-Overselling*), dan Manajemen Kehadiran di Lapangan (*Anti Double-Entry*) untuk Institut Teknologi Sumatera (ITERA).

---

## 👥 Anggota Kelompok 3 (14 Orang)

* **Pendamping Kelompok:** Yayan Sofhian
* **Mentor:** Annisa Afrida

### Daftar Nama & NIM:
1. **Pangestu Anton Widodo (125140069)** - *Ketua Kelompok & Software Architect*
2. Aulia Afza Aprilita (125140041)
3. Avicena Putra Pradana (125140006)
4. Amirah Zatil Izzah (125140002)
5. Kevin Ariangga (125140050)
6. Monika Ririn Dia (125140009)
7. Naila Diffa Zhafirah (125140062)
8. Agvera Dwi Aryani (125140057)
9. Annisa Meita Nur Afni (125140101)
10. Margareth Manurung (125140087)
11. Sulthan Farras Daparta Hutasuhut (125140027)
12. Kornel Simanjuntak (125140033)
13. Jonathan Putra Holong Hutauruk (125140093)
14. Ahmad Yusuf Fahrurrozi (125140071)

| No | Nama Lengkap | NIM | Peran / Jabatan |
|:--:|:---|:---:|:---|
| 1 | **Pangestu Anton Widodo** | **125140069** | **Ketua Kelompok & Software Architect** |
| 2 | Aulia Afza Aprilita | 125140041 | Anggota |
| 3 | Avicena Putra Pradana | 125140006 | Anggota |
| 4 | Amirah Zatil Izzah | 125140002 | Anggota |
| 5 | Kevin Ariangga | 125140050 | Anggota |
| 6 | Monika Ririn Dia | 125140009 | Anggota |
| 7 | Naila Diffa Zhafirah | 125140062 | Anggota |
| 8 | Agvera Dwi Aryani | 125140057 | Anggota |
| 9 | Annisa Meita Nur Afni | 125140101 | Anggota |
| 10 | Margareth Manurung | 125140087 | Anggota |
| 11 | Sulthan Farras Daparta Hutasuhut | 125140027 | Anggota |
| 12 | Kornel Simanjuntak | 125140033 | Anggota |
| 13 | Jonathan Putra Holong Hutauruk | 125140093 | Anggota |
| 14 | Ahmad Yusuf Fahrurrozi | 125140071 | Anggota |

---

## 🏛️ Arsitektur Sistem: Modular Monolith

Sistem dirancang menggunakan pola **Modular Monolith** dengan 4 modul domain terisolasi. Komunikasi lintas modul diwajibkan hanya melalui **Public Service Interface (`index.ts`)** dan dilarang melakukan query langsung ke tabel database milik modul lain:

```text
src/
├── app/                          # Next.js App Router (Delivery Layer)
│   ├── (public)/                 # Landing, Lineup, Rundown Jadwal
│   ├── (auth)/                   # Login Google OAuth & Callback
│   ├── (audience)/               # Katalog Tiket & Halaman Tiket Saya (QR)
│   ├── (gate)/                   # Pemindai Kamera Lapangan & Riwayat Scan
│   ├── (admin)/                  # Dasbor Realtime, Manajemen Tiket & Kehadiran
│   └── api/                      # Route Handlers (/api/checkin, /api/health, dll.)
└── modules/                      # Domain Logic (Modular Monolith)
    ├── event-catalog/            # Manajemen Event, Panggung, Artis, Jadwal
    ├── ticketing/                # Kuota Tiket, Penerbitan QR, Klaim Atomik
    ├── attendance/               # Verifikasi Tiket, Gate Scanning, Rekonsiliasi
    └── shared/                   # Autentikasi Supabase, RBAC, Audit Log, UI Base
```

---

## 🚀 Fitur Utama

1. **Katalog Acara & Rundown Interaktif (US-01, US-02, US-10)**
   - Lineup musisi/pembicara dengan bio dan media sosial.
   - Jadwal penampilan per panggung dengan validasi pencegahan jadwal bentrok (*overlap exclusion*).
2. **War Tiket Atomik Anti-Overselling (US-03, US-04, US-05, T-01 s/d T-03)**
   - Proteksi konkurensi di level basis data menggunakan Stored Procedure PL/pgSQL `claim_ticket` dengan `SELECT ... FOR UPDATE`.
   - Idempotensi permintaan klaim ganda (*idempotency key*).
   - Pembatasan kuota per akun pengguna (*default* 2 tiket/akun).
   - Generasi token QR kriptografis 128-bit unik (*anti-spoofing*).
3. **Check-In Lapangan Anti Double-Entry (US-06, US-09, T-04 s/d T-06)**
   - Pemindai kamera belakang berbasis HTML5 QR Code Scanner dengan *debounce* 2.000 ms.
   - Banner verifikasi kontras tinggi (minimal 40% tinggi layar) untuk penggunaan luar ruangan.
   - Eksekusi atomik `verify_and_checkin_ticket` dengan penandaan status `USED` dan indeks unik parsial.
   - Token mentah tidak pernah dicatat di basis data; hanya hash SHA-256 (`token_hash`) yang disimpan.
4. **Dasbor Operasional Realtime & Ekspor CSV (US-07, US-08, US-14, T-08)**
   - Dasbor pemantauan kuota tiket dan kedatangan penonton *live* via Supabase Realtime WebSocket.
   - Laju kedatangan pengunjung per interval 15 menit WIB dan rekapitulasi per pintu (*gate*).
   - Pembatalan tiket bermasalah oleh admin beserta pengembalian kuota otomatis (+1).
   - Ekspor data kehadiran ke format CSV terstandar UTF-8 dengan BOM untuk kebutuhan pasca-acara.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router, Server Actions, Route Handlers)
* **Bahasa:** TypeScript (Strict Mode)
* **Database & Auth:** Supabase (PostgreSQL 15, GoTrue Google OAuth, Realtime Channels, Row-Level Security)
* **Styling & UI:** Tailwind CSS, Radix UI / shadcn/ui, Lucide Icons
* **QR Processing:** `html5-qrcode` (Scanner), `qrcode.react` (Generator)
* **Pengujian:** Vitest (Unit, Integration, Concurrency T-01 s/d T-08), k6 (Load Testing)

---

## 📦 Panduan Menjalankan Proyek

### 1. Kloning Repositori
```bash
git clone https://github.com/pangestuanton/ldop-rising-stars.git
cd ldop-rising-stars
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env.local`)
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi variabel berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Menjalankan Migrasi Basis Data
Terapkan berkas migrasi SQL berurutan yang ada pada folder `supabase/migrations/`:
1. `0001_shared_schema.sql` (Profiles, Roles, Audit Logs, Enum)
2. `0002_catalog_schema.sql` (Venues, Events, Artists, Stages, Schedules, Announcements)
3. `0003_ticket_schema.sql` (Ticket Types, Tickets)
4. `0004_attendance_schema.sql` (Attendance Gates, Checkin Logs)
5. `0005_rpc_claim_ticket.sql` (Stored Procedure `claim_ticket`)
6. `0006_rpc_verify_checkin.sql` (Stored Procedure `verify_and_checkin_ticket`)
7. `0007_rls_policies.sql` (Row-Level Security, Admin RPCs, Realtime Publication)
8. *(Opsional)* `supabase/seed.sql` untuk data benih awal.

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi dapat diakses melalui browser di `http://localhost:3000`.

---

## 🧪 Pengujian & Verifikasi

### Menjalankan Seluruh Uji (Vitest)
```bash
npm test
```
*Mencakup 49 test case otomatis, termasuk uji konkurensi T-01 s/d T-08 dan siklus hidup sistem end-to-end (Bab 9).*

### Menjalankan Typecheck & Linter
```bash
npm run typecheck
npm run lint
```

### Menjalankan Uji Beban War Tiket (k6)
Mensimulasikan lonjakan hingga 2.000 virtual users konkuren dan 200 klaim per detik (NFR-PERF-05 & NFR-PERF-06):
```bash
k6 run tests/load/k6-war-ticket.js
```

### Menjalankan Build Produksi
```bash
npm run build
```

---

## 📜 Lisensi & Atribusi

Proyek ini dikembangkan oleh **Kelompok 3** untuk memenuhi tugas besar mata kuliah / program **LDOP Rising Stars** Institut Teknologi Sumatera (ITERA).
Sumber kebenaran tunggal spesifikasi teknis mengacu pada dokumen `SKPL PRD TERRAFEST (Terra Festival ITERA).md`.

