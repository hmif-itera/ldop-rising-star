# LDOP RISING STAR

Repository pengumpulan hasil **LDOP RISING STAR**, kegiatan kaderisasi HMIF ITERA.
Setiap kelompok mengerjakan satu website sesuai tema yang dipilih, men-deploy-nya secara online, lalu mengumpulkan source code ke repository ini melalui **fork + pull request** ke branch kelompoknya masing-masing.

---

<!-- ============================================================ -->
<!-- BAGIAN INI WAJIB DIISI OLEH SETIAP KELOMPOK DI BRANCH-NYA   -->
<!-- ============================================================ -->

## 1. Bagian yang Wajib Diisi / Dilengkapi

### 1.1 Identitas kelompok

| Item | Keterangan |
| --- | --- |
| **Nomor kelompok** | `3` |
| **Nama kelompok (opsional)** | **Kelompok 3 — TerraFest (Terra Festival ITERA)** |
| **Tema yang dipilih** | `3. Landing page acara/event` |
| **Link website (deployment)** | [https://ldop-terrafest.vercel.app](https://ldop-terrafest.vercel.app) *(atau URL Vercel hasil deployment kelompok)* |
| **Repository Asal (HMIF)** | `https://github.com/hmif-itera/ldop-rising-star` (Target Branch: `kelompok-3`) |
| **Repository Fork / Dev** | `https://github.com/pangestuanton/ldop-rising-stars` |

---

### 1.2 Anggota kelompok & pembagian tugas

* **Pendamping Kelompok:** Yayan Sofhian  
* **Mentor:** Annisa Afrida  

| No | Nama | NIM | Peran | Tugas yang dikerjakan |
|:--:|:---|:---:|:---|:---|
| 1 | **Pangestu Anton Widodo** | **125140069** | **Ketua Kelompok & Lead Software Architect** | Desain arsitektur Modular Monolith, setup repositori Next.js 15 & Supabase, implementasi Stored Procedure PL/pgSQL atomik (`claim_ticket`, `verify_and_checkin_ticket`), RLS policies, pipeline CI/CD, dan otomatisasi pengujian integrasi Vitest. |
| 2 | **Aulia Afza Aprilita** | **125140041** | **Frontend Developer** | Implementasi halaman beranda landing page publik (`/`), hero section festival, navigasi navbar responsif, dan showcase highlight acara TerraFest. |
| 3 | **Avicena Putra Pradana** | **125140006** | **Frontend Developer** | Implementasi halaman lineup penampil/musisi (`/lineup`), filter dinamis kategori pengisi acara, dan kartu profil detail penampil (foto, bio, panggung). |
| 4 | **Margareth Manurung** | **125140087** | **Frontend Developer** | Implementasi halaman jadwal penampilan & rundown interaktif (`/schedule`), timeline panggung, dan layout responsif mobile & desktop. |
| 5 | **Sulthan Farras Daparta Hutasuhut** | **125140027** | **Frontend Developer** | Implementasi antarmuka katalog pemesanan tiket audiens (`/tickets`), visualisasi kuota tiket *realtime*, dan modal konfirmasi klaim tiket festival. |
| 6 | **Kornel Simanjuntak** | **125140033** | **Frontend Developer** | Implementasi halaman "Tiket Saya" (`/my-tickets`), rendering kode QR kriptografis penonton, badge status tiket (*ISSUED* / *USED* / *CANCELLED*), dan fitur simpan tiket. |
| 7 | **Ahmad Yusuf Fahrurrozi** | **125140071** | **Backend Developer** | Implementasi REST Route Handler (`/api/checkin`, `/api/health`), integrasi autentikasi GoTrue Google OAuth, dan middleware proteksi rute berbasis peran (RBAC). |
| 8 | **Jonathan Putra Holong Hutauruk** | **125140093** | **Backend Developer** | Implementasi domain logic modul event-catalog, validasi overlap jadwal panggung (*no double-booking*), serta skrip migrasi database katalog festival. |
| 9 | **Kevin Ariangga** | **125140050** | **Backend Developer** | Implementasi modul attendance gate checkin, verifikasi kriptografis token QR hash SHA-256 (*anti-spoofing*), dan manajemen error domain terstandarisasi. |
| 10 | **Annisa Meita Nur Afni** | **125140101** | **Backend Developer** | Implementasi modul dasbor operasional admin (`/admin`), rekapitulasi data statistik kedatangan penonton per 15 menit, audit logging, dan ekspor CSV format UTF-8 BOM. |
| 11 | **Amirah Zatil Izzah** | **125140002** | **UI/UX Designer** | Perancangan wireframe & design system TerraFest di Figma (palet warna festival, tipografi modern, token spacing, dan desain e-ticket). |
| 12 | **Naila Diffa Zhafirah** | **125140062** | **UI/UX Designer** | Perancangan tata letak mobile-first untuk pengalaman penonton (eksplorasi artis, interaksi jadwal rundown, dan layar QR tiket ramah pencahayaan luar ruangan). |
| 13 | **Monika Ririn Dia** | **125140009** | **UI/UX Designer** | Perancangan user flow dan antarmuka Gate Scanner Panitia (`/gate/scan`) dengan banner hasil validasi visual kontras tinggi minimal 40% tinggi layar. |
| 14 | **Agvera Dwi Aryani** | **125140057** | **UI/UX Designer** | Perancangan antarmuka dasbor pemantauan admin (visualisasi grafik kedatangan live, monitoring kuota tiket, dan pembuatan aset grafis festival). |

---

### 1.3 Tech stack

| Bagian | Teknologi | Alasan pemilihan |
| --- | --- | --- |
| **Bahasa & Framework** | Next.js 15 (App Router) + TypeScript | React Server Components memberikan performa load halaman awal instan, SEO ramah mesin pencari untuk landing page publik, dan *type-safety* ketat end-to-end. |
| **Styling & UI** | Tailwind CSS, Radix UI / shadcn/ui, Lucide Icons | Styling *utility-first* yang ringan, responsif mobile-first, serta komponen UI yang aksesibel dengan standar WCAG. |
| **Database & Auth** | Supabase (PostgreSQL 15, GoTrue Auth, Realtime Channels, RLS) | Menyediakan transaksi basis data ACID yang aman dari *race-condition* saat war tiket (`SELECT ... FOR UPDATE`), integrasi Google OAuth, dan WebSocket pemantauan live. |
| **Pemrosesan QR & Kamera** | `html5-qrcode` & `qrcode.react` | Pemindaian barcode/QR dari kamera browser perangkat bergerak secara cepat (<1 detik) serta rendering QR berbasis Canvas/SVG yang tajam di sisi klien. |
| **Testing & Tooling** | Vitest, k6, ESLint | Eksekusi 49 pengujian otomatis (unit, integrasi konkurensi, dan siklus e2e) berkecepatan tinggi serta pengujian beban lonjakan pengunjung *war ticket*. |
| **Hosting & Deployment** | Vercel Edge Network | Platform hosting optimal untuk Next.js dengan dukungan continuous deployment, SSL otomatis, dan latency rendah di seluruh Indonesia. |

#### Cara menjalankan project secara lokal:

```bash
# 1. Kloning repositori dan masuk ke direktori
git clone https://github.com/hmif-itera/ldop-rising-star.git
cd ldop-rising-star
git checkout kelompok-3

# 2. Instalasi dependensi
npm install

# 3. Konfigurasi variabel lingkungan (.env.local)
cp .env.example .env.local
# Lengkapi variabel NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY

# 4. Menjalankan pengujian otomatis
npm test

# 5. Menjalankan server pengembangan
npm run dev
# Buka http://localhost:3000 pada browser
```

---

### 1.4 Struktur kode

Struktur direktori utama repositori Kelompok 3 (menggunakan pola arsitektur **Modular Monolith**):

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml                     # Pipeline otomatisasi CI (lint, typecheck, test)
├── public/                            # Aset statis (gambar, ikon, logo)
├── src/
│   ├── app/                           # Next.js App Router (Delivery Layer)
│   │   ├── (public)/                  # Beranda landing page, Lineup, Jadwal panggung
│   │   │   ├── page.tsx               # Halaman utama TerraFest
│   │   │   ├── lineup/page.tsx        # Daftar artis & guest star
│   │   │   └── schedule/page.tsx      # Rundown & jadwal panggung
│   │   ├── (auth)/                    # Autentikasi Google OAuth & Callback
│   │   ├── (audience)/                # Katalog tiket (/tickets) & E-Tiket Saya (/my-tickets)
│   │   ├── (gate)/                    # Pemindai kamera petugas lapangan (/gate/scan)
│   │   ├── (admin)/                   # Dasbor monitoring live, kuota, & kehadiran
│   │   └── api/                       # REST Route Handlers (/api/checkin, /api/health, dll.)
│   ├── modules/                       # Domain Modules (Modular Monolith)
│   │   ├── event-catalog/             # Domain logic acara, artis, jadwal, & panggung
│   │   ├── ticketing/                 # Domain logic kuota, klaim tiket atomik, & tiket saya
│   │   ├── attendance/                # Domain logic verifikasi check-in, scanner, & ekspor CSV
│   │   └── shared/                    # Klien Supabase, utilitas RBAC, audit log, & komponen UI
│   └── lib/                           # Helper utilitas global
├── supabase/
│   ├── migrations/                    # 7 berkas migrasi SQL (DDL, Stored Procedure, RLS)
│   └── seed.sql                       # Data benih awal acara, panggung, dan tiket
├── tests/
│   ├── unit/                          # Unit testing utilitas, RBAC, domain error
│   ├── integration/                   # Pengujian konkurensi (T-01 s/d T-08)
│   ├── e2e/                           # Pengujian siklus hidup tiket end-to-end
│   └── load/                          # Pengujian beban war tiket (k6)
├── components.json                    # Konfigurasi shadcn/ui
├── next.config.ts                     # Konfigurasi Next.js
├── package.json                       # Dependensi & skrip npm
├── tailwind.config.ts                 # Konfigurasi Tailwind CSS
└── vitest.config.ts                   # Konfigurasi runner Vitest
```

| Path | Fungsi |
| --- | --- |
| `src/app/(public)/` | Halaman landing page publik festival: navigasi utama, daftar musisi/pembicara (`/lineup`), serta rundown jadwal interaktif (`/schedule`). |
| `src/app/(audience)/` | Halaman penonton untuk memilih kategori tiket (`/tickets`) dan melihat e-tiket digital ber-QR token (`/my-tickets`). |
| `src/app/(gate)/` | Halaman pemindai QR berbasis kamera (`/gate/scan`) untuk staf gerbang lapangan dilengkapi riwayat pemindaian (`/gate/history`). |
| `src/app/(admin)/` | Dasbor pemantauan operasional realtime: grafik kedatangan penonton, manajemen jenis tiket, dan ekspor log kehadiran. |
| `src/modules/event-catalog/` | Modul domain independen untuk pengelolaan artis, panggung festival, dan validasi bentrok jadwal penampilan. |
| `src/modules/ticketing/` | Modul domain pengelolaan kuota tiket dan eksekusi klaim tiket atomik anti-overselling via PostgreSQL RPC. |
| `src/modules/attendance/` | Modul domain verifikasi tiket di pintu masuk, pencatatan log check-in anti double-entry, dan ekspor data CSV. |
| `src/modules/shared/` | Komponen bersama: otorisasi peran pengguna (RBAC), klien Supabase terisolasi, audit logger, dan UI primitives. |
| `supabase/migrations/` | Skrip DDL terstruktur (0001 s/d 0007) mencakup definisi tabel, stored procedure concurrency, RLS policies, dan channel realtime. |
| `tests/` | Kumpulan 49 test cases otomatis mencakup unit test, simulasi konkurensi war tiket, checkin gerbang, dan skenario e2e. |

---

### 1.5 Penjelasan singkat project

**Latar Belakang & Masalah:**  
Dalam perhelatan festival dan kegiatan akbar kampus di Institut Teknologi Sumatera (ITERA), panitia kerap menghadapi dua kendala teknis utama:
1. Lonjakan trafik serentak saat perebutan tiket gratis/berbayar (*war ticket*) yang sering menyebabkan *overselling* (tiket terjual melebihi kapasitas) dan duplikasi klaim akibat kondisi balapan (*race condition*).
2. Antrean panjang di pintu masuk (*gate*) akibat lambatnya proses verifikasi manual serta potensi kecurangan tiket ganda (*double entry* / tiket satu dipakai berulang kali).

**TerraFest (Terra Festival ITERA)** hadir sebagai solusi platform web modern terintegrasi yang menggabungkan landing page festival yang memikat dengan mesin transaksi tiket atomik tingkat tinggi dan sistem manajemen kehadiran lapangan berkecepatan tinggi.

**Fitur Utama yang Berjalan:**  
- **Landing Page Festival & Lineup Interaktif:** Eksplorasi pengisi acara (musisi/pembicara), bio profil, stage lokasi, dan jadwal rundown acara tanpa tumpang tindih waktu.
- **War Tiket Atomik Anti-Overselling:** Menggunakan transaksi basis data PL/pgSQL `SELECT ... FOR UPDATE` dengan proteksi konkurensi ketat, batas kuota per akun pengguna, serta idempotensi klaim ganda.
- **E-Tiket Digital & Token Kriptografis Unik:** Penerbitan tiket instan ber-QR code unik berbasis hash SHA-256 untuk mempermudah akses penonton dan mencegah pemalsuan (*anti-spoofing*).
- **Pemindai Kamera Lapangan Anti Double-Entry:** Pemindai QR berbasis web responsif untuk panitia gerbang dengan banner visual kontras tinggi (minimal 40% layar) yang menolak tiket yang telah digunakan atau tidak valid secara instan.
- **Dasbor Realtime & Ekspor CSV Panitia:** Dasbor pemantauan kedatangan penonton *live* via WebSocket, pemantauan sisa kuota tiket, serta ekspor rekonsiliasi data kehadiran format CSV UTF-8 dengan BOM.

**Alur Penggunaan:**  
1. **Pengunjung Umum:** Membuka beranda TerraFest untuk melihat informasi acara, musisi tamu di `/lineup`, dan jadwal penampilan di `/schedule`.
2. **Klaim Tiket:** Pengunjung login dengan akun Google, membuka `/tickets`, dan memilih kategori tiket. Setelah klaim berhasil, tiket ber-QR unik muncul di `/my-tickets`.
3. **Pemeriksaan di Pintu Masuk:** Petugas gate lapangan membuka `/gate/scan` dan mengarahkan kamera ke QR tiket penonton. Sistem memverifikasi status dalam hitungan milidetik; layar menampilkan warna hijau terang (Tiket Sah) atau merah (Tiket Sudah Pernah Dipakai / Palsu).
4. **Pemantauan Admin:** Koordinator panitia memantau laju kedatangan dan grafik kehadiran penonton secara langsung di `/admin` serta dapat mengunduh laporan kehadiran dalam bentuk berkas CSV.

**Batas Kemampuan (Scope Boundary):**  
- Pada versi kaderisasi ini, TerraFest memfokuskan autentikasi akun Google OAuth ITERA/Gmail dan menggratiskan tiket festival (*zero-cost war ticket claim*), sehingga belum menyertakan gateway pembayaran pihak ketiga (Payment Gateway Midtrans/Xendit).
- Pemindaian tiket di lapangan membutuhkan konektivitas internet aktif pada perangkat pemindai untuk verifikasi langsung ke basis data pusat (*realtime live check-in*).

---

### 1.6 Screenshot (opsional)

Tangkapan layar antarmuka TerraFest:
- **Landing Page Publik:** Hero banner festival, highlight musisi, dan CTA klaim tiket.
- **Jadwal & Lineup:** Tampilan kartu lineup musisi dan tabel rundown panggung.
- **Tiket Saya:** Tampilan e-ticket dengan barcode QR dinamis penonton.
- **Gate Scanner & Dasbor Admin:** Antarmuka pemindai panitia dan grafik realtime kehadiran.

---

<!-- ============================================================ -->
<!-- SYARAT WAJIB KADERISASI                                      -->
<!-- ============================================================ -->

## 2. Syarat Wajib (Kaderisasi HMIF ITERA)

Sebagai bagian dari rangkaian kegiatan kaderisasi HMIF ITERA, seluruh anggota Kelompok 3 telah memenuhi syarat:

1. **Follow GitHub HMIF ITERA** — [github.com/hmif-itera](https://github.com/hmif-itera)
2. **Follow LinkedIn HMIF ITERA** — [linkedin.com/company/himpunan-mahasiswa-informatika-itera](https://www.linkedin.com/company/himpunan-mahasiswa-informatika-itera/)

---

## 3. Ketentuan Tambahan

- Bahasa pemrograman, framework, dan pustaka bebas selama website bisa di-deploy dan diakses publik.
- Website hasil jiplakan tanpa modifikasi berarti akan didiskualifikasi.
- Joki atau pengerjaan oleh pihak di luar kelompok ditindak sesuai aturan kaderisasi.
- Penilaian: Desain & UI/UX (25%), Fungsionalitas (25%), Kerja Sama Tim & Proses (25%), Kualitas Teknis & Deployment (25%).
- Seluruh spesifikasi teknis dan rincian user story mengacu pada dokumen `SKPL PRD TERRAFEST (Terra Festival ITERA).md`.
