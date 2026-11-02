# Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL) / Product Requirement Document (PRD)

## TERRAFEST: Platform Manajemen Acara dan Tiket Konser Terra Festival ITERA

Versi 1.0 | Disusun oleh: Senior Product Manager & Software Architect | Tanggal: 29 Oktober 2026 | Status: Draft untuk Review | Konteks: Tugas LDOP Rising Stars

| Atribut Dokumen | Keterangan |
| --- | --- |
| Nama Dokumen | SKPL/PRD TERRAFEST |
| Versi | 1.0 (Draft) |
| Penyusun | Pangestu Anton (Software Engineer) dengan peran Product Manager dan Software Architect |
| Pemangku Kepentingan | Panitia Terra Festival, Tim Teknis, Staf Gate, Penonton, Dosen/Mentor LDOP |
| Klasifikasi | Internal Proyek |
| Dokumen Terkait | Basis data (Bab 8), Alur Sistem (Bab 9) |

---

## BAB 1: PENDAHULUAN DAN IKHTISAR

### 1.1 Latar Belakang Masalah

Terra Festival (TERRAFEST) merupakan festival musik tahunan yang diselenggarakan di lingkungan Institut Teknologi Sumatera (ITERA). Acara ini dihadiri ribuan penonton yang berasal dari mahasiswa, alumni, dan masyarakat umum. Pada penyelenggaraan sebelumnya, panitia menghadapi sejumlah persoalan operasional yang berulang dan berdampak langsung pada pengalaman penonton serta kredibilitas penyelenggara.

Pertama, informasi acara (line-up, jadwal panggung, denah, harga, dan ketentuan masuk) tersebar di banyak kanal seperti poster media sosial, grup pesan singkat, dan unggahan perorangan. Akibatnya, calon penonton kesulitan memperoleh informasi tunggal yang konsisten dan terkini.

Kedua, pada saat pembukaan penjualan tiket (war ticket), permintaan melonjak dalam waktu singkat. Tanpa mekanisme kontrol konkurensi yang benar, sistem berisiko menjual tiket melebihi kuota (overselling), yang berujung pada konflik antara penonton dan panitia.

Ketiga, tiket yang dibagikan dalam bentuk gambar statis atau bukti transfer mudah digandakan sehingga membuka risiko tiket palsu dan penggunaan ganda (double entry).

Keempat, proses verifikasi manual di pintu masuk (gate) berjalan lambat. Staf harus mencocokkan data secara visual atau melalui daftar kertas, sehingga terbentuk antrean panjang (bottleneck) yang memicu ketidaknyamanan dan risiko keamanan kerumunan.

Berdasarkan kondisi tersebut, dibutuhkan satu platform terpadu yang menyatukan katalog informasi acara, penerbitan tiket berbasis identitas pengguna, dan verifikasi kehadiran berbasis QR Code secara waktu nyata (real-time).

### 1.2 Rumusan Masalah dan Dampak

| ID | Masalah | Akar Penyebab | Dampak | Solusi dalam Sistem |
| --- | --- | --- | --- | --- |
| P-01 | Informasi berserakan | Tidak ada sumber kebenaran tunggal (single source of truth) | Penonton bingung, pertanyaan berulang ke panitia | Modul EventCatalog sebagai pusat informasi resmi |
| P-02 | Antrean panjang di gate | Verifikasi manual dan tidak terdigitalisasi | Waktu masuk lama, kerumunan menumpuk | Modul Attendance dengan scan QR cepat (target di bawah 400 ms) |
| P-03 | Risiko tiket palsu | QR/tiket statis tanpa validasi server dan tanpa keterikatan identitas | Kerugian finansial, penolakan di gate | Token QR unik, tervalidasi server, terikat ke akun Google pengguna |
| P-04 | Risiko overselling | Race condition saat war ticket | Kuota terlampaui, komplain dan reputasi turun | Atomic transaction dengan penguncian baris (SELECT ... FOR UPDATE) di database |
| P-05 | Penggunaan tiket ganda | Tidak ada status penggunaan tiket yang terpusat | Satu tiket dipakai berulang oleh beberapa orang | Status tiket dan log check-in tunggal dengan penolakan scan ganda |

### 1.3 Tujuan Sistem

Tujuan umum sistem adalah menyediakan platform web terintegrasi yang andal, aman, dan cepat untuk mendukung seluruh siklus penyelenggaraan Terra Festival, dari penyebaran informasi hingga pencatatan kehadiran.

| Kode | Tujuan Khusus | Indikator Keberhasilan (KPI) | Target |
| --- | --- | --- | --- |
| G-01 | Menyediakan satu sumber informasi acara yang resmi | Persentase informasi acara yang diakses melalui platform | Lebih dari 90 persen pengunjung memperoleh informasi dari platform |
| G-02 | Menjamin kuota tiket tidak pernah terlampaui | Jumlah tiket terklaim dibanding kuota | 0 kasus overselling |
| G-03 | Mengeliminasi tiket palsu dan penggunaan ganda | Jumlah check-in sah ganda untuk tiket yang sama | 0 kasus |
| G-04 | Mempercepat proses masuk gate | Waktu rata-rata verifikasi per penonton | Kurang dari 3 detik end-to-end, scan di bawah 400 ms |
| G-05 | Memberi visibilitas kehadiran waktu nyata kepada panitia | Latensi pembaruan dasbor kehadiran | Kurang dari 2 detik |
| G-06 | Menyederhanakan autentikasi pengguna | Tingkat keberhasilan login Google | Lebih dari 98 persen |

### 1.4 Ruang Lingkup

#### 1.4.1 In-Scope (Termasuk Dalam Rilis Ini)

| No | Area | Cakupan |
| --- | --- | --- |
| 1 | Autentikasi | Login menggunakan akun Google (OAuth 2.0 melalui Supabase GoTrue), manajemen sesi, dan penetapan peran (role) |
| 2 | Katalog Acara | Informasi festival, line-up artis, jadwal rundown, lokasi, serta pengumuman resmi |
| 3 | Ticketing | Definisi kategori tiket dan kuota, klaim tiket oleh penonton, penerbitan QR Code, daftar tiket milik pengguna |
| 4 | Pencegahan Overselling | Klaim tiket atomik di level database menggunakan penguncian baris |
| 5 | Attendance | Pemindaian QR Code oleh staf gate, verifikasi, check-in, pencatatan log, dan penolakan scan ganda |
| 6 | Dasbor Panitia | Pemantauan sisa kuota dan jumlah kehadiran secara real-time, manajemen data katalog dan tiket |
| 7 | Keamanan Data | Row-Level Security, audit log, dan kontrol akses berbasis peran |
| 8 | Deployment | Penerapan pada Vercel dan Supabase dengan pipeline CI/CD dasar |

#### 1.4.2 Out-of-Scope (Tidak Termasuk Dalam Rilis Ini)

| No | Area | Alasan Pengecualian |
| --- | --- | --- |
| 1 | Pembayaran daring (payment gateway, e-wallet, virtual account) | Rilis ini mengasumsikan tiket gratis atau tervalidasi di luar sistem. Integrasi pembayaran dijadwalkan pada fase berikutnya |
| 2 | Aplikasi mobile native (Android/iOS) | Cukup diwakili oleh Progressive Web App (responsif) |
| 3 | Penjualan merchandise dan food court | Di luar domain tiket dan kehadiran |
| 4 | Pengiriman tiket fisik atau cetak | Tiket bersifat digital sepenuhnya |
| 5 | Fitur sosial (komentar, chat antar penonton) | Tidak mendukung tujuan inti |
| 6 | Refund dan penjualan kembali (resale) tiket | Memerlukan kebijakan bisnis tambahan |
| 7 | Autentikasi selain Google (email-password, Apple, dan lain-lain) | Disederhanakan untuk mengurangi permukaan serangan |
| 8 | Analitik lanjutan dan business intelligence | Cukup rekapitulasi dasar pada dasbor |

### 1.5 Asumsi dan Batasan

| Kode | Jenis | Uraian |
| --- | --- | --- |
| A-01 | Asumsi | Seluruh penonton memiliki akun Google aktif dan perangkat dengan koneksi internet |
| A-02 | Asumsi | Area gate memiliki jangkauan jaringan seluler atau Wi-Fi yang memadai untuk perangkat staf |
| A-03 | Asumsi | Perangkat staf gate memiliki kamera belakang yang berfungsi dan peramban modern |
| B-01 | Batasan | Menggunakan layanan tier Supabase dan Vercel sesuai paket yang tersedia, sehingga kuota koneksi dan bandwidth perlu dipantau |
| B-02 | Batasan | Pengembangan dilaksanakan dalam kerangka waktu tugas LDOP Rising Stars dengan sumber daya tim terbatas |
| B-03 | Batasan | Pemindaian kamera di peramban mensyaratkan konteks aman (HTTPS) |

### 1.6 Daftar Singkatan dan Istilah

| Singkatan | Kepanjangan / Pengertian |
| --- | --- |
| SKPL | Spesifikasi Kebutuhan Perangkat Lunak |
| PRD | Product Requirement Document |
| ITERA | Institut Teknologi Sumatera |
| LDOP | Program pengembangan Rising Stars (konteks tugas proyek) |
| FR | Functional Requirement (Kebutuhan Fungsional) |
| NFR | Non-Functional Requirement (Kebutuhan Non-Fungsional) |
| RLS | Row-Level Security |
| RPC | Remote Procedure Call, pemanggilan fungsi database dari klien melalui Supabase |
| DDL | Data Definition Language |
| PL/pgSQL | Procedural Language/PostgreSQL |
| QR | Quick Response (Code) |
| JWT | JSON Web Token |
| OAuth | Open Authorization |
| GoTrue | Layanan autentikasi yang digunakan Supabase Auth |
| SSR | Server-Side Rendering |
| RSC | React Server Components |
| CI/CD | Continuous Integration / Continuous Deployment |
| UUID | Universally Unique Identifier |
| ACID | Atomicity, Consistency, Isolation, Durability |
| API | Application Programming Interface |
| UI/UX | User Interface / User Experience |
| Gate Staff | Petugas pintu masuk yang memverifikasi tiket |
| War Ticket | Periode pembukaan penjualan dengan lonjakan permintaan serentak |
| Overselling | Penjualan atau klaim tiket melebihi kuota |
| Public Service Interface | Antarmuka layanan publik suatu modul, satu-satunya pintu komunikasi antar modul |

---

## BAB 2: SPESIFIKASI TECH STACK

### 2.1 Ringkasan Tumpukan Teknologi

| Lapisan | Teknologi | Versi Acuan | Peran Utama |
| --- | --- | --- | --- |
| Framework Aplikasi | Next.js (App Router) | 15.x | Routing, rendering, Server Actions, Route Handlers |
| Backend-as-a-Service | Supabase | Platform terkelola | Auth, PostgreSQL, Realtime, RLS, RPC |
| Gaya Antarmuka | Tailwind CSS dan shadcn/ui | Tailwind 3.x/4.x | Sistem desain utilitas dan komponen UI aksesibel |
| Pemindai QR | html5-qrcode | 2.3.x | Membaca QR Code dari kamera perangkat staf gate |
| Pembuat QR | qrcode.react | 4.x | Merender QR Code pada halaman tiket penonton |
| Hosting | Vercel | Platform terkelola | Deployment, CDN global, preview environment, HTTPS |
| Bahasa | TypeScript | 5.x | Keamanan tipe pada seluruh modul |

### 2.2 Fungsi Spesifik Setiap Teknologi

#### 2.2.1 Next.js (App Router)

| Fungsi | Penjelasan dalam Sistem TERRAFEST |
| --- | --- |
| Routing berbasis berkas | Direktori `src/app/` mendefinisikan rute halaman penonton, gate staff, dan admin |
| React Server Components | Halaman katalog (line-up, jadwal) dirender di server sehingga cepat dimuat dan ramah SEO untuk pencarian informasi festival |
| Server Actions | Menjadi lapisan delivery tipis yang memanggil Public Service Interface modul, misalnya aksi klaim tiket |
| Route Handlers | Menyediakan endpoint HTTP untuk kebutuhan khusus seperti verifikasi check-in dari perangkat gate dan callback autentikasi |
| Middleware | Memeriksa sesi dan peran pengguna sebelum mengakses rute terproteksi (`/admin`, `/gate`) |
| Layouts bersarang | Memisahkan tata letak area publik, area penonton, area gate, dan area admin |
| Caching dan revalidasi | Data katalog yang jarang berubah di-cache dan direvalidasi saat admin memperbarui konten |

#### 2.2.2 Supabase

| Komponen | Fungsi dalam Sistem |
| --- | --- |
| GoTrue Auth (Google OAuth) | Menangani login melalui akun Google, menerbitkan JWT sesi, dan menyimpan identitas pengguna di skema `auth` |
| PostgreSQL | Basis data relasional utama. Menyimpan seluruh tabel modul dengan prefix `catalog_`, `ticket_`, `attendance_`, serta `shared_` |
| Stored Procedure (RPC) | Menjalankan logika kritis secara atomik, yaitu `claim_ticket` dan `verify_and_checkin_ticket` |
| Row-Level Security | Menegakkan hak akses di level baris sehingga pengguna hanya dapat mengakses data miliknya |
| Realtime | Menyiarkan perubahan (misalnya jumlah check-in dan sisa kuota) ke dasbor panitia tanpa polling |
| Pengelolaan kunci | `anon key` untuk klien dengan RLS aktif, `service_role key` hanya di server untuk operasi terkontrol |

#### 2.2.3 Tailwind CSS dan shadcn/ui

| Fungsi | Penjelasan |
| --- | --- |
| Tailwind CSS | Utility-first styling untuk antarmuka responsif dengan pendekatan mobile-first, penting karena mayoritas penonton mengakses dari ponsel |
| shadcn/ui | Kumpulan komponen (Button, Dialog, Table, Tabs, Toast, Badge, Skeleton) yang dimiliki langsung di dalam kode, berbasis Radix UI sehingga aksesibel |
| Design tokens | Warna, tipografi, dan jarak diatur melalui variabel CSS sehingga identitas visual TERRAFEST konsisten |
| Mode kontras tinggi | Indikator hasil scan (hijau sah, merah ditolak) dirancang kontras agar terbaca di bawah sinar matahari |

#### 2.2.4 html5-qrcode

| Fungsi | Penjelasan |
| --- | --- |
| Akses kamera | Menggunakan kamera belakang perangkat staf gate melalui API `getUserMedia` |
| Dekode QR | Membaca payload token dari QR Code dalam bingkai video secara kontinu |
| Konfigurasi performa | Parameter `fps`, `qrbox`, dan `aspectRatio` disetel agar dekode cepat pada perangkat kelas menengah |
| Eksekusi di klien | Dijalankan sebagai Client Component dan hanya mengirim string token ke server untuk diverifikasi, tanpa menafsirkan keabsahan di sisi klien |

#### 2.2.5 qrcode.react

| Fungsi | Penjelasan |
| --- | --- |
| Render QR | Menampilkan QR Code dari token tiket pada halaman Tiket Saya (SVG atau canvas) |
| Tingkat koreksi kesalahan | Menggunakan level `M` atau `Q` agar tetap terbaca meski layar tergores atau kecerahan rendah |
| Muatan minimal | QR hanya memuat token acak (bukan data pribadi), sehingga tidak membocorkan informasi bila terfoto |

#### 2.2.6 Vercel

| Fungsi | Penjelasan |
| --- | --- |
| Hosting dan CDN | Menyajikan aplikasi Next.js melalui jaringan edge global dengan HTTPS otomatis |
| Preview Deployment | Setiap pull request memiliki lingkungan pratinjau untuk pengujian sebelum rilis |
| Environment Variables | Menyimpan kredensial Supabase secara aman terpisah dari kode |
| Observability | Log fungsi dan analitik dasar untuk memantau galat saat hari acara |
| Skalabilitas | Fungsi serverless menskalakan otomatis menghadapi lonjakan lalu lintas saat war ticket |

---

## BAB 3: ARSITEKTUR MODULAR MONOLITH

### 3.1 Konsep Arsitektur

Modular Monolith adalah pola arsitektur di mana seluruh aplikasi dikemas dan di-deploy sebagai satu unit (satu codebase, satu artefak deployment), tetapi di dalamnya dibagi menjadi modul-modul domain bisnis yang berbatas tegas (bounded context). Setiap modul memiliki logika, data, dan antarmuka publiknya sendiri, serta tidak boleh bergantung pada detail internal modul lain.

| Aspek | Monolith Konvensional | Modular Monolith (Dipilih) | Microservices |
| --- | --- | --- | --- |
| Unit deployment | Satu | Satu | Banyak |
| Batas domain | Kabur | Tegas dan ditegakkan | Tegas (jaringan) |
| Kompleksitas operasional | Rendah | Rendah | Tinggi |
| Konsistensi data | Mudah | Mudah (transaksi lokal) | Sulit (konsistensi eventual) |
| Kesesuaian tim kecil dan tenggat singkat | Baik | Sangat baik | Kurang |
| Jalur migrasi ke microservices | Sulit | Mudah (modul dapat diekstrak) | Tidak relevan |

Alasan pemilihan: tim kecil, waktu pengembangan terbatas, kebutuhan transaksi atomik yang kuat pada klaim tiket, serta kebutuhan menjaga kemungkinan evolusi di masa depan.

### 3.2 Tanggung Jawab Empat Modul

| Modul | Tanggung Jawab | Entitas Dimiliki | Prefix Tabel | Public Service Interface (Contoh) |
| --- | --- | --- | --- | --- |
| EventCatalog | Mengelola informasi festival: acara, artis, jadwal, lokasi, pengumuman | Event, Artist, Schedule, Venue, Announcement | `catalog_` | `getEventById`, `listArtists`, `getSchedule` |
| Ticketing | Mengelola kategori tiket, kuota, klaim tiket, dan penerbitan token QR | TicketType, Ticket | `ticket_` | `claimTicket`, `listMyTickets`, `getQuotaStatus` |
| Attendance | Memverifikasi tiket di gate, mencatat check-in, mencegah scan ganda | CheckinLog, GateSession | `attendance_` | `verifyAndCheckin`, `getAttendanceSummary` |
| Shared | Kemampuan lintas modul: autentikasi, profil, peran, audit log, utilitas, klien Supabase, tipe dasar | Profile, Role, AuditLog | `shared_` | `getCurrentUser`, `requireRole`, `writeAuditLog` |

#### 3.2.1 Rincian Tanggung Jawab

| Modul | Boleh Dilakukan | Tidak Boleh Dilakukan |
| --- | --- | --- |
| EventCatalog | CRUD konten acara oleh admin, menyajikan data baca ke publik | Menghitung kuota atau mengelola status tiket |
| Ticketing | Menegakkan kuota, menerbitkan tiket, mengubah status tiket menjadi `CLAIMED` atau `CANCELLED` | Mencatat check-in atau menulis ke tabel `attendance_` |
| Attendance | Memvalidasi token, mencatat check-in, memanggil Ticketing untuk membaca/menandai status tiket melalui jalur resmi | Membuat atau mengubah kuota tiket |
| Shared | Menyediakan identitas pengguna dan pemeriksaan peran | Memuat logika bisnis domain tertentu |

### 3.3 Aturan Ketat Komunikasi Antar Modul

| No | Aturan | Penjelasan | Konsekuensi Pelanggaran |
| --- | --- | --- | --- |
| R-01 | Dilarang query lintas tabel langsung | Modul A tidak boleh melakukan SELECT, JOIN, INSERT, UPDATE, atau DELETE pada tabel milik modul B | Pull request ditolak pada code review dan pemeriksaan lint |
| R-02 | Wajib melalui Public Service Interface | Komunikasi lintas modul hanya melalui fungsi yang diekspor dari berkas `index.ts` modul tujuan | Impor jalur dalam (deep import) dilarang |
| R-03 | Tabel bersifat privat modul | Setiap tabel hanya dapat diakses langsung oleh modul pemiliknya (ditandai prefix) | Pelanggaran dianggap defek arsitektur |
| R-04 | Tidak ada foreign key lintas modul yang memaksa coupling logika | Referensi antar modul disimpan sebagai ID (UUID) tanpa mengimpor entitas internal. Constraint FK lintas modul hanya diperbolehkan pada kunci identitas stabil dan didokumentasikan | Wajib persetujuan arsitek |
| R-05 | Ketergantungan searah | Attendance boleh bergantung pada Ticketing dan Shared. Ticketing boleh bergantung pada EventCatalog dan Shared. EventCatalog hanya bergantung pada Shared. Tidak ada ketergantungan siklik | Siklus ketergantungan dilarang |
| R-06 | Tipe data lintas modul berupa DTO | Modul mengembalikan Data Transfer Object, bukan entitas basis data mentah | Menjaga enkapsulasi skema internal |
| R-07 | Lapisan delivery tipis | Berkas di `src/app/` hanya memvalidasi input, memanggil service modul, dan merender hasil. Logika bisnis tidak diletakkan di sini | Logika di lapisan app dipindahkan saat review |

#### 3.3.1 Matriks Ketergantungan Antar Modul

| Dari / Ke | EventCatalog | Ticketing | Attendance | Shared |
| --- | --- | --- | --- | --- |
| EventCatalog | Self | Tidak | Tidak | Ya |
| Ticketing | Ya (validasi event) | Self | Tidak | Ya |
| Attendance | Tidak | Ya (verifikasi tiket) | Self | Ya |
| Shared | Tidak | Tidak | Tidak | Self |

#### 3.3.2 Contoh Pola Benar dan Salah

```ts
// SALAH: Attendance membaca tabel milik Ticketing secara langsung
const { data } = await supabase
  .from('ticket_tickets')
  .select('*')
  .eq('qr_token', token);

// BENAR: Attendance memanggil Public Service Interface Ticketing
import { ticketingService } from '@/modules/ticketing';
const ticket = await ticketingService.getTicketByToken(token);
```

### 3.4 Enkapsulasi Transaksi di Level Database

Operasi yang bersifat kritis terhadap konsistensi (klaim tiket dan check-in) tidak dikerjakan sebagai rangkaian beberapa query dari aplikasi, melainkan dienkapsulasi dalam satu Stored Procedure PostgreSQL. Dengan demikian seluruh langkah berjalan dalam satu transaksi ACID.

| Prinsip | Penjelasan | Manfaat |
| --- | --- | --- |
| Satu RPC satu transaksi | Pemeriksaan kuota, penguncian, penyisipan tiket, dan pembaruan penghitung dilakukan di dalam satu fungsi | Atomik. Gagal sebagian berarti seluruhnya dibatalkan |
| Penguncian pesimis | `SELECT ... FOR UPDATE` pada baris kategori tiket | Permintaan serentak diserialisasi sehingga tidak ada race condition |
| Kepemilikan fungsi oleh modul | `claim_ticket` dimiliki Ticketing. `verify_and_checkin_ticket` dimiliki Attendance | Batas modul tetap terjaga walau berada di database yang sama |
| Hak eksekusi terkontrol | `SECURITY DEFINER` dengan `search_path` terkunci dan `EXECUTE` hanya untuk peran yang berhak | Mencegah eskalasi hak akses |
| Idempotensi | Klaim dan check-in dirancang aman terhadap pengiriman ulang | Tahan terhadap klik ganda dan retry jaringan |

> Catatan arsitektural: pada `verify_and_checkin_ticket`, fungsi Attendance menyentuh tabel Ticketing di dalam satu transaksi. Ini adalah satu-satunya pengecualian terkontrol terhadap R-01, dan dibenarkan karena kebutuhan atomisitas. Pengecualian dibatasi dengan membaca dan mengubah tiket hanya melalui fungsi internal milik Ticketing (`ticket_internal_mark_used`), bukan DML langsung dari modul Attendance.

### 3.5 Diagram Arsitektur

```text
+--------------------------------------------------------------------------------+
|                               KLIEN (BROWSER)                                  |
|   Penonton (HP)          Gate Staff (HP + Kamera)          Admin (Laptop)      |
|   qrcode.react           html5-qrcode                      shadcn/ui Dashboard |
+-----------------+------------------------+--------------------+----------------+
                  | HTTPS                  | HTTPS              | HTTPS
                  v                        v                    v
+--------------------------------------------------------------------------------+
|                         VERCEL (EDGE + SERVERLESS)                             |
|  +--------------------------------------------------------------------------+  |
|  |                      NEXT.JS APP ROUTER  (src/app/)                      |  |
|  |   Middleware (sesi + peran)                                              |  |
|  |   Pages (RSC)  |  Server Actions  |  Route Handlers   <- LAPISAN DELIVERY |  |
|  +----------------------------------+---------------------------------------+  |
|                                     | memanggil hanya Public Service Interface |
|  +----------------------------------v---------------------------------------+  |
|  |                    MODULAR MONOLITH  (src/modules/)                      |  |
|  |                                                                          |  |
|  |  +----------------+   +----------------+   +--------------------+        |  |
|  |  | EventCatalog   |<--|   Ticketing    |<--|    Attendance      |        |  |
|  |  | (catalog_*)    |   |  (ticket_*)    |   |  (attendance_*)    |        |  |
|  |  | index.ts [API] |   | index.ts [API] |   |  index.ts [API]    |        |  |
|  |  +-------+--------+   +--------+-------+   +----------+---------+        |  |
|  |          |                     |                      |                  |  |
|  |          +---------------------+----------------------+                  |  |
|  |                                |                                         |  |
|  |                      +---------v----------+                              |  |
|  |                      |       Shared       |                              |  |
|  |                      | auth, role, audit  |                              |  |
|  |                      +---------+----------+                              |  |
|  +--------------------------------+-----------------------------------------+  |
+-----------------------------------+--------------------------------------------+
                                    | supabase-js (anon key + JWT, RLS aktif)
                                    v
+--------------------------------------------------------------------------------+
|                                  SUPABASE                                      |
|  +----------------+  +----------------------------------------------------+    |
|  | GoTrue Auth    |  |                 POSTGRESQL                         |    |
|  | (Google OAuth) |  |  catalog_*   ticket_*   attendance_*   shared_*    |    |
|  +----------------+  |  RPC: claim_ticket | verify_and_checkin_ticket     |    |
|                      |  RLS policies  |  Triggers  |  Indexes             |    |
|  +----------------+  +----------------------------------------------------+    |
|  | Realtime       |<--- Postgres Changes (kuota, check-in) ---> Dasbor Admin   |
|  +----------------+                                                            |
+--------------------------------------------------------------------------------+

Keterangan arah panah antar modul: A <-- B berarti B bergantung pada A (B memanggil A).
```

---

## BAB 4: RANCANGAN STRUKTUR DIREKTORI (NEXT.JS APP ROUTER)

### 4.1 Prinsip Penataan

| Prinsip | Penjelasan |
| --- | --- |
| Pemisahan delivery dan domain | `src/app/` hanya berisi routing dan presentasi. `src/modules/` berisi seluruh logika domain |
| Satu pintu per modul | Setiap modul mengekspor Public Service Interface melalui `index.ts` |
| Tiga lapisan dalam modul | `domain` (tipe dan aturan), `application` (use case), `infrastructure` (akses data), plus `ui` untuk komponen khusus modul |
| Aturan impor | Larangan deep import lintas modul ditegakkan melalui ESLint (`no-restricted-imports`) |

### 4.2 Struktur Direktori Lengkap

```text
terrafest/
├── .github/
│   └── workflows/
│       └── ci.yml                      # lint, typecheck, test
├── supabase/
│   ├── migrations/
│   │   ├── 0001_shared_schema.sql
│   │   ├── 0002_catalog_schema.sql
│   │   ├── 0003_ticket_schema.sql
│   │   ├── 0004_attendance_schema.sql
│   │   ├── 0005_rpc_claim_ticket.sql
│   │   ├── 0006_rpc_verify_checkin.sql
│   │   └── 0007_rls_policies.sql
│   ├── seed.sql
│   └── config.toml
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/                            # LAPISAN DELIVERY (routing, presentasi)
│   │   ├── (public)/
│   │   │   ├── page.tsx                # beranda festival
│   │   │   ├── lineup/page.tsx
│   │   │   ├── schedule/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── auth/callback/route.ts  # callback OAuth Google
│   │   ├── (audience)/
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx            # daftar tiket tersedia / klaim
│   │   │   │   └── actions.ts          # Server Action klaim tiket
│   │   │   ├── my-tickets/
│   │   │   │   └── page.tsx            # tiket saya + QR
│   │   │   └── layout.tsx
│   │   ├── (gate)/
│   │   │   └── gate/
│   │   │       ├── scan/page.tsx       # pemindai QR
│   │   │       ├── history/page.tsx
│   │   │       └── layout.tsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── page.tsx            # dasbor realtime
│   │   │       ├── events/page.tsx
│   │   │       ├── ticket-types/page.tsx
│   │   │       ├── attendance/page.tsx
│   │   │       └── layout.tsx
│   │   ├── api/
│   │   │   ├── checkin/route.ts        # endpoint verifikasi dari gate
│   │   │   └── health/route.ts
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── modules/                        # LOGIKA DOMAIN (modular monolith)
│   │   ├── event-catalog/
│   │   │   ├── index.ts                # PUBLIC SERVICE INTERFACE
│   │   │   ├── domain/
│   │   │   │   ├── event.entity.ts
│   │   │   │   └── artist.entity.ts
│   │   │   ├── application/
│   │   │   │   ├── get-event.usecase.ts
│   │   │   │   └── list-artists.usecase.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── catalog.repository.ts   # akses tabel catalog_*
│   │   │   ├── ui/
│   │   │   │   ├── lineup-card.tsx
│   │   │   │   └── schedule-table.tsx
│   │   │   └── dto/
│   │   │       └── catalog.dto.ts
│   │   │
│   │   ├── ticketing/
│   │   │   ├── index.ts                # PUBLIC SERVICE INTERFACE
│   │   │   ├── domain/
│   │   │   │   ├── ticket.entity.ts
│   │   │   │   └── ticket-status.ts
│   │   │   ├── application/
│   │   │   │   ├── claim-ticket.usecase.ts # memanggil RPC claim_ticket
│   │   │   │   ├── list-my-tickets.usecase.ts
│   │   │   │   └── get-quota.usecase.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── ticket.repository.ts    # akses tabel ticket_*
│   │   │   ├── ui/
│   │   │   │   ├── ticket-qr.tsx           # qrcode.react
│   │   │   │   └── claim-button.tsx
│   │   │   └── dto/
│   │   │       └── ticket.dto.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── index.ts                # PUBLIC SERVICE INTERFACE
│   │   │   ├── domain/
│   │   │   │   ├── checkin.entity.ts
│   │   │   │   └── checkin-result.ts
│   │   │   ├── application/
│   │   │   │   ├── verify-and-checkin.usecase.ts  # memanggil RPC
│   │   │   │   └── attendance-summary.usecase.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── attendance.repository.ts
│   │   │   ├── ui/
│   │   │   │   ├── qr-scanner.tsx          # html5-qrcode
│   │   │   │   └── scan-result-banner.tsx
│   │   │   └── dto/
│   │   │       └── attendance.dto.ts
│   │   │
│   │   └── shared/
│   │       ├── index.ts                # PUBLIC SERVICE INTERFACE
│   │       ├── auth/
│   │       │   ├── get-current-user.ts
│   │       │   └── require-role.ts
│   │       ├── supabase/
│   │       │   ├── client.ts               # klien browser
│   │       │   ├── server.ts               # klien server (cookies)
│   │       │   └── middleware.ts
│   │       ├── audit/
│   │       │   └── write-audit-log.ts
│   │       ├── errors/
│   │       │   └── app-error.ts
│   │       ├── types/
│   │       │   └── database.types.ts       # tipe hasil generate Supabase
│   │       └── ui/                         # komponen shadcn/ui
│   │           ├── button.tsx
│   │           ├── dialog.tsx
│   │           └── toast.tsx
│   │
│   ├── middleware.ts                   # proteksi rute berdasarkan sesi dan peran
│   └── lib/
│       └── utils.ts                    # util umum (cn, format tanggal)
├── tests/
│   ├── unit/
│   ├── integration/                    # termasuk uji konkurensi claim_ticket
│   └── e2e/
├── .env.example
├── .eslintrc.cjs                       # aturan no-restricted-imports antar modul
├── components.json                     # konfigurasi shadcn/ui
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.3 Aturan Impor yang Ditegakkan

| Dari | Boleh Impor | Tidak Boleh Impor |
| --- | --- | --- |
| `src/app/**` | `@/modules/<modul>` (hanya `index.ts`) | `@/modules/<modul>/infrastructure/*`, `domain/*` |
| `modules/ticketing/**` | `@/modules/event-catalog`, `@/modules/shared` | `@/modules/attendance`, folder dalam modul lain |
| `modules/attendance/**` | `@/modules/ticketing`, `@/modules/shared` | `@/modules/event-catalog` secara langsung, folder dalam modul lain |
| `modules/event-catalog/**` | `@/modules/shared` | `@/modules/ticketing`, `@/modules/attendance` |
| `modules/shared/**` | Pustaka eksternal saja | Modul domain apa pun |

```js
// .eslintrc.cjs (cuplikan penegakan aturan R-02)
module.exports = {
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            '@/modules/*/infrastructure/*',
            '@/modules/*/domain/*',
            '@/modules/*/application/*',
          ],
        }],
      },
    },
  ],
};
```

---

## BAB 5: PERSONA DAN USER STORIES

### 5.1 Profil Persona

#### 5.1.1 Persona 1: Audience (Penonton)

| Atribut | Uraian |
| --- | --- |
| Nama Fiktif | Rara Anindya |
| Usia / Latar Belakang | 20 tahun, mahasiswa semester 5 ITERA, aktif di media sosial |
| Perangkat Utama | Ponsel Android kelas menengah, koneksi seluler tidak selalu stabil |
| Kemahiran Teknologi | Menengah. Terbiasa memesan tiket daring |
| Tujuan | Mendapatkan tiket dengan cepat saat war ticket, mengetahui jadwal artis favorit, masuk gate tanpa antre lama |
| Titik Nyeri (Pain Points) | Takut kehabisan tiket, tidak tahu informasi resmi, khawatir tiket tidak sah atau dipakai orang lain, gate macet |
| Kebutuhan Sistem | Login Google satu ketukan, klaim tiket cepat dan jelas hasilnya, QR tiket yang mudah dibuka, informasi line-up dan rundown terpusat |
| Kutipan Representatif | Saya ingin satu tempat resmi untuk tahu jadwal dan dapat tiket, tanpa takut kena tiket palsu |
| Metrik Keberhasilan | Klaim tiket berhasil atau mendapat kepastian cepat bila kuota habis, waktu masuk gate kurang dari 1 menit |

#### 5.1.2 Persona 2: Gate Staff (Petugas Gerbang)

| Atribut | Uraian |
| --- | --- |
| Nama Fiktif | Dimas Pratama |
| Usia / Latar Belakang | 21 tahun, anggota divisi keamanan dan akses panitia (volunteer) |
| Perangkat Utama | Ponsel milik panitia dengan kamera belakang, berdiri di luar ruangan dalam waktu lama |
| Kemahiran Teknologi | Dasar hingga menengah. Memerlukan antarmuka sangat sederhana |
| Tujuan | Memverifikasi tiket secepat mungkin, tidak salah meloloskan atau menolak penonton |
| Titik Nyeri | Antrean menumpuk, cahaya matahari menyulitkan membaca layar, takut tiket palsu atau ganda lolos, tidak jelas alasan penolakan |
| Kebutuhan Sistem | Scan otomatis tanpa menekan banyak tombol, hasil berkode warna besar dan jelas (hijau, merah, kuning), alasan penolakan eksplisit, riwayat scan terbaru |
| Kutipan Representatif | Saya butuh hasilnya langsung jelas dalam sekali scan, boleh masuk atau tidak, dan kenapa |
| Metrik Keberhasilan | Waktu verifikasi per orang kurang dari 3 detik, tidak ada galat keputusan |

#### 5.1.3 Persona 3: Admin (Panitia Inti / Pengelola Sistem)

| Atribut | Uraian |
| --- | --- |
| Nama Fiktif | Salsabila Rahman |
| Usia / Latar Belakang | 22 tahun, koordinator divisi acara dan teknologi Terra Festival |
| Perangkat Utama | Laptop, juga memantau dari ponsel saat hari acara |
| Kemahiran Teknologi | Menengah hingga tinggi |
| Tujuan | Mengelola konten acara, mengatur kuota tiket, memantau penjualan dan kehadiran waktu nyata, mengambil keputusan cepat bila terjadi gangguan |
| Titik Nyeri | Data tersebar di banyak berkas, tidak tahu sisa kuota aktual, sulit membuktikan jumlah penonton masuk, kesulitan mengelola akses staf |
| Kebutuhan Sistem | Dasbor real-time, CRUD katalog dan kategori tiket, penetapan peran staf gate, ekspor rekap, jejak audit |
| Kutipan Representatif | Saya perlu melihat berapa tiket tersisa dan berapa orang sudah masuk saat ini juga |
| Metrik Keberhasilan | Pembaruan dasbor kurang dari 2 detik, data kuota selalu konsisten |

### 5.2 Daftar User Stories dan Kriteria Penerimaan

Format: Sebagai \[persona\], saya ingin \[kebutuhan\], agar \[manfaat\]. Prioritas menggunakan skema MoSCoW (Must, Should, Could).

| ID | Persona | User Story | Kriteria Penerimaan (Acceptance Criteria) | Prioritas |
| --- | --- | --- | --- | --- |
| US-01 | Audience | Sebagai penonton, saya ingin login menggunakan akun Google, agar saya tidak perlu membuat dan mengingat kata sandi baru | (1) Tombol Masuk dengan Google tampil di halaman login. (2) Setelah persetujuan Google, pengguna diarahkan ke halaman awal dengan sesi aktif. (3) Profil dasar (nama, email, foto) tersimpan otomatis pada pengguna baru dengan peran default `audience`. (4) Bila login dibatalkan atau gagal, pesan galat yang jelas tampil dan pengguna dapat mencoba ulang. (5) Sesi tetap aktif setelah penyegaran halaman | Must |
| US-02 | Audience | Sebagai penonton, saya ingin melihat line-up dan jadwal rundown festival, agar saya dapat merencanakan kehadiran | (1) Halaman line-up menampilkan nama artis, foto, panggung, dan waktu tampil. (2) Jadwal dapat difilter per hari atau panggung. (3) Halaman dapat diakses tanpa login. (4) Halaman termuat kurang dari 2 detik pada jaringan 4G. (5) Perubahan jadwal oleh admin tercermin setelah revalidasi | Must |
| US-03 | Audience | Sebagai penonton, saya ingin melihat kategori tiket beserta harga dan sisa kuota, agar saya dapat memilih tiket yang sesuai | (1) Setiap kategori menampilkan nama, harga, deskripsi, dan status ketersediaan (Tersedia, Hampir Habis, Habis). (2) Sisa kuota diperbarui secara real-time tanpa memuat ulang halaman. (3) Kategori dengan kuota 0 menonaktifkan tombol klaim. (4) Jendela waktu penjualan (mulai dan selesai) ditampilkan dengan jelas | Must |
| US-04 | Audience | Sebagai penonton, saya ingin mengklaim tiket saat penjualan dibuka, agar saya mendapatkan hak masuk acara | (1) Hanya pengguna yang login yang dapat mengklaim. (2) Klaim berhasil bila kuota tersedia dan jendela penjualan terbuka. (3) Klaim yang berhasil langsung mengurangi kuota secara atomik. (4) Saat kuota habis, pengguna menerima pesan Kuota habis. (5) Pengguna tidak dapat mengklaim melebihi batas per akun (default 2 tiket per kategori, dikonfigurasi admin). (6) Klik ganda atau pengiriman ulang tidak membuat tiket duplikat | Must |
| US-05 | Audience | Sebagai penonton, saya ingin melihat tiket saya beserta QR Code, agar saya dapat menunjukkannya di gate | (1) Halaman Tiket Saya menampilkan semua tiket milik pengguna dengan status (Aktif, Terpakai, Dibatalkan). (2) Tiket aktif menampilkan QR Code yang dirender dari token unik. (3) QR terbaca pada kecerahan layar sedang. (4) Pengguna tidak dapat melihat tiket milik orang lain. (5) Halaman dirancang ringan agar tetap termuat pada koneksi lemah | Must |
| US-06 | Gate Staff | Sebagai gate staff, saya ingin memindai QR Code tiket dengan kamera ponsel, agar verifikasi berlangsung cepat | (1) Halaman scan meminta izin kamera dan membuka kamera belakang secara default. (2) QR terdeteksi otomatis tanpa menekan tombol. (3) Waktu dekode QR di sisi klien rata-rata kurang dari 400 ms pada perangkat uji. (4) Hanya pengguna berperan `gate_staff` atau `admin` yang dapat mengakses halaman scan. (5) Setelah satu scan, pemindai berhenti sejenak (debounce) agar tidak memindai ulang QR yang sama | Must |
| US-07 | Gate Staff | Sebagai gate staff, saya ingin melihat hasil verifikasi yang jelas secara visual, agar saya dapat segera memutuskan penonton boleh masuk atau tidak | (1) Tiket sah menampilkan banner hijau besar dengan nama pemegang dan kategori tiket. (2) Tiket tidak valid menampilkan banner merah dengan alasan. (3) Tiket sudah dipakai menampilkan banner kuning berisi waktu dan gate check-in sebelumnya. (4) Banner terlihat jelas di bawah sinar matahari (kontras memadai). (5) Banner dapat ditutup otomatis setelah 3 detik atau dengan satu ketukan | Must |
| US-08 | Gate Staff | Sebagai gate staff, saya ingin sistem menolak tiket yang sudah pernah di-scan, agar tidak ada penggunaan ganda | (1) Check-in pertama mengubah status tiket menjadi `USED` secara atomik. (2) Scan kedua pada tiket yang sama ditolak dengan alasan ALREADY\_USED. (3) Dua perangkat yang memindai tiket yang sama secara bersamaan hanya menghasilkan satu check-in sah. (4) Setiap percobaan, sah maupun ditolak, tercatat di log kehadiran | Must |
| US-09 | Gate Staff | Sebagai gate staff, saya ingin melihat riwayat scan terbaru saya, agar saya dapat memeriksa ulang keputusan bila terjadi sengketa | (1) Riwayat menampilkan minimal 50 scan terakhir dengan waktu, hasil, dan nama pemegang. (2) Riwayat hanya menampilkan data milik staf yang bersangkutan. (3) Daftar dapat disegarkan secara manual | Should |
| US-10 | Admin | Sebagai admin, saya ingin mengelola data event, artis, dan jadwal, agar informasi di platform selalu akurat | (1) Admin dapat membuat, mengubah, dan menghapus (soft delete) event, artis, dan sesi jadwal. (2) Validasi mencegah jadwal bentrok pada panggung yang sama. (3) Perubahan terlihat di halaman publik setelah disimpan. (4) Setiap perubahan tercatat di audit log. (5) Pengguna non-admin tidak dapat mengakses fitur ini | Must |
| US-11 | Admin | Sebagai admin, saya ingin mengatur kategori tiket, kuota, harga, dan jendela penjualan, agar penjualan sesuai kapasitas venue | (1) Admin dapat membuat kategori dengan kuota total, batas klaim per akun, serta waktu mulai dan selesai. (2) Kuota total tidak boleh diubah menjadi lebih kecil dari jumlah tiket yang sudah terklaim. (3) Perubahan kuota tercatat di audit log. (4) Kategori yang telah memiliki tiket tidak dapat dihapus, hanya dinonaktifkan | Must |
| US-12 | Admin | Sebagai admin, saya ingin memantau sisa kuota dan jumlah penonton yang sudah masuk secara real-time, agar saya dapat mengambil keputusan operasional | (1) Dasbor menampilkan total kuota, terklaim, sisa, dan jumlah check-in per kategori. (2) Angka diperbarui kurang dari 2 detik setelah ada klaim atau check-in. (3) Dasbor menampilkan grafik laju kedatangan per interval 5 menit. (4) Indikator koneksi realtime (terhubung atau terputus) terlihat. (5) Hanya admin yang dapat membuka dasbor | Must |
| US-13 | Admin | Sebagai admin, saya ingin menetapkan peran pengguna sebagai gate staff, agar hanya petugas resmi yang dapat memindai tiket | (1) Admin dapat mencari pengguna berdasarkan email dan mengubah perannya. (2) Perubahan peran berlaku pada permintaan berikutnya tanpa menunggu masa berlaku sesi lama habis. (3) Admin tidak dapat menurunkan perannya sendiri bila ia satu-satunya admin. (4) Perubahan peran tercatat di audit log | Must |
| US-14 | Admin | Sebagai admin, saya ingin mengekspor rekap kehadiran dan penjualan, agar saya dapat membuat laporan pasca acara | (1) Ekspor tersedia dalam format CSV. (2) Berkas memuat kolom tiket, kategori, status, dan waktu check-in. (3) Hanya admin yang dapat mengunduh. (4) Data pribadi dibatasi seperlunya (nama dan email) | Could |

---

## BAB 6: KEBUTUHAN FUNGSIONAL (FR)

### 6.1 Konvensi Penomoran

| Kode | Domain | Modul Pemilik |
| --- | --- | --- |
| FR-AUTH | Autentikasi, sesi, dan otorisasi peran | Shared |
| FR-CAT | Katalog acara | EventCatalog |
| FR-TCK | Tiket, kuota, dan klaim | Ticketing |
| FR-ATT | Verifikasi dan kehadiran | Attendance |
| FR-ADM | Dasbor dan administrasi | Lintas modul (melalui Public Service Interface) |
| FR-AUD | Audit dan pencatatan | Shared |

### 6.2 FR-AUTH: Autentikasi dan Otorisasi

| Kode | Nama Kebutuhan | Deskripsi | Input | Output / Hasil | Prioritas |
| --- | --- | --- | --- | --- | --- |
| FR-AUTH-01 | Login Google OAuth | Sistem harus memungkinkan pengguna masuk menggunakan akun Google melalui Supabase GoTrue | Aksi klik Masuk dengan Google, persetujuan di layar Google | Sesi terautentikasi (JWT dalam cookie), pengalihan ke halaman tujuan | Must |
| FR-AUTH-02 | Penanganan callback OAuth | Sistem harus menukar kode otorisasi menjadi sesi pada rute callback | Parameter `code` dari penyedia OAuth | Sesi tersimpan, pengguna diarahkan. Galat dikembalikan ke halaman login dengan pesan | Must |
| FR-AUTH-03 | Pembuatan profil otomatis | Saat pengguna pertama kali masuk, sistem harus membuat profil dengan peran default `audience` | Data identitas dari auth | Baris `shared_profiles` baru (nama, email, avatar, peran) | Must |
| FR-AUTH-04 | Manajemen sesi | Sistem harus memperbarui token sesi secara otomatis dan menyediakan logout | Cookie sesi, aksi logout | Sesi diperpanjang atau dihapus | Must |
| FR-AUTH-05 | Otorisasi berbasis peran | Sistem harus membatasi akses rute dan fungsi berdasarkan peran `audience`, `gate_staff`, `admin` | JWT dan peran pengguna | Akses diizinkan atau ditolak (HTTP 403 / pengalihan) | Must |
| FR-AUTH-06 | Proteksi rute melalui middleware | Rute `/gate/*` dan `/admin/*` harus dicegat sebelum dirender bila peran tidak sesuai | URL permintaan, sesi | Pengalihan ke login atau halaman Akses Ditolak | Must |
| FR-AUTH-07 | Pengelolaan peran oleh admin | Admin harus dapat mengubah peran pengguna lain | ID pengguna, peran baru | Peran diperbarui, entri audit log tercipta | Must |

### 6.3 FR-CAT: Katalog Acara

| Kode | Nama Kebutuhan | Deskripsi | Input | Output / Hasil | Prioritas |
| --- | --- | --- | --- | --- | --- |
| FR-CAT-01 | Tampilan informasi festival | Sistem harus menampilkan informasi umum festival (nama, tanggal, lokasi, deskripsi, syarat dan ketentuan) | ID event atau event aktif | Halaman beranda dan detail acara | Must |
| FR-CAT-02 | Daftar artis dan line-up | Sistem harus menampilkan daftar artis beserta foto, genre, dan tautan sosial | Filter opsional (hari, panggung) | Daftar artis terurut | Must |
| FR-CAT-03 | Jadwal rundown | Sistem harus menampilkan jadwal tampil per panggung dan hari | Tanggal atau panggung | Tabel atau linimasa jadwal | Must |
| FR-CAT-04 | Informasi lokasi dan denah | Sistem harus menampilkan lokasi venue, gate, dan titik penting | ID venue | Informasi dan gambar denah | Should |
| FR-CAT-05 | Pengumuman resmi | Sistem harus menampilkan pengumuman panitia yang dapat disematkan (pin) | Data pengumuman | Daftar pengumuman terbaru | Should |
| FR-CAT-06 | CRUD konten katalog | Admin harus dapat membuat, mengubah, dan menonaktifkan event, artis, jadwal, venue, dan pengumuman | Formulir data tervalidasi | Data tersimpan, halaman publik diperbarui | Must |
| FR-CAT-07 | Validasi jadwal bentrok | Sistem harus menolak sesi jadwal yang tumpang tindih pada panggung yang sama | Panggung, waktu mulai, waktu selesai | Pesan galat atau penyimpanan berhasil | Should |
| FR-CAT-08 | Revalidasi cache | Perubahan katalog harus memicu revalidasi cache halaman publik | Peristiwa perubahan data | Halaman publik menampilkan data terbaru | Should |

### 6.4 FR-TCK: Ticketing

| Kode | Nama Kebutuhan | Deskripsi | Input | Output / Hasil | Prioritas |
| --- | --- | --- | --- | --- | --- |
| FR-TCK-01 | Manajemen kategori tiket | Admin harus dapat membuat dan mengubah kategori tiket (nama, harga, kuota total, batas per akun, jendela penjualan, status aktif) | Data kategori | Kategori tersimpan dengan penghitung kuota | Must |
| FR-TCK-02 | Tampilan ketersediaan tiket | Sistem harus menampilkan kategori dan sisa kuota kepada penonton | ID event | Daftar kategori dengan status ketersediaan | Must |
| FR-TCK-03 | Klaim tiket atomik | Sistem harus memproses klaim tiket melalui RPC `claim_ticket` yang menggunakan SELECT ... FOR UPDATE agar kuota tidak pernah terlampaui | `ticket_type_id`, `quantity` (default 1), identitas pengguna dari JWT | `ticket_id` dan token QR bila berhasil. Kode galat bila gagal (`SOLD_OUT`, `LIMIT_REACHED`, `SALE_NOT_OPEN`, `UNAUTHENTICATED`) | Must |
| FR-TCK-04 | Batas klaim per akun | Sistem harus membatasi jumlah tiket aktif per akun per kategori | ID pengguna, kategori | Klaim ditolak dengan `LIMIT_REACHED` bila melebihi batas | Must |
| FR-TCK-05 | Validasi jendela penjualan | Sistem harus menolak klaim di luar waktu mulai dan selesai penjualan | Waktu server saat klaim | `SALE_NOT_OPEN` atau `SALE_CLOSED` | Must |
| FR-TCK-06 | Penerbitan token QR | Sistem harus menghasilkan token acak kriptografis yang unik untuk setiap tiket | Proses klaim | `qr_token` unik (minimal 128 bit entropi) tersimpan dan tidak dapat ditebak | Must |
| FR-TCK-07 | Daftar tiket milik pengguna | Sistem harus menampilkan tiket yang hanya dimiliki pengguna yang login | JWT pengguna | Daftar tiket dengan status dan QR | Must |
| FR-TCK-08 | Render QR Code | Sistem harus merender QR Code dari token tiket menggunakan qrcode.react | `qr_token` | Elemen QR pada halaman Tiket Saya | Must |
| FR-TCK-09 | Pembatalan tiket oleh admin | Admin harus dapat membatalkan tiket, dan kuota dikembalikan | `ticket_id`, alasan | Status `CANCELLED`, kuota bertambah, audit log tercipta | Should |
| FR-TCK-10 | Idempotensi klaim | Pengiriman klaim berulang dengan kunci idempoten sama tidak boleh membuat tiket ganda | `idempotency_key` | Mengembalikan hasil klaim sebelumnya | Should |
| FR-TCK-11 | Layanan publik Ticketing | Modul harus menyediakan antarmuka (`getTicketByToken`, `markTicketUsed`, `getQuotaStatus`) bagi modul lain | Parameter tiap fungsi | DTO tiket atau status | Must |
| FR-TCK-12 | Siaran kuota real-time | Perubahan sisa kuota harus disiarkan melalui Supabase Realtime | Perubahan tabel kuota | Pembaruan UI tanpa muat ulang | Should |

### 6.5 FR-ATT: Attendance

| Kode | Nama Kebutuhan | Deskripsi | Input | Output / Hasil | Prioritas |
| --- | --- | --- | --- | --- | --- |
| FR-ATT-01 | Pemindaian QR di gate | Sistem harus menyediakan antarmuka pemindai kamera menggunakan html5-qrcode untuk gate staff | Aliran video kamera | String token QR terdeteksi | Must |
| FR-ATT-02 | Verifikasi dan check-in atomik | Sistem harus memverifikasi token dan mencatat check-in melalui RPC `verify_and_checkin_ticket` dalam satu transaksi | `qr_token`, `gate_id`, identitas staf dari JWT | Hasil: `SUCCESS`, `INVALID_TOKEN`, `ALREADY_USED`, `CANCELLED`, `UNAUTHORIZED` beserta data pemegang | Must |
| FR-ATT-03 | Pencegahan scan ganda | Sistem harus menolak check-in kedua untuk tiket yang sama, termasuk saat dua scan terjadi bersamaan | Token tiket sama | `ALREADY_USED` dengan waktu dan gate check-in awal | Must |
| FR-ATT-04 | Pencatatan log percobaan | Setiap percobaan scan (sah maupun ditolak) harus dicatat untuk audit | Hasil verifikasi, staf, gate, waktu | Baris `attendance_checkin_logs` | Must |
| FR-ATT-05 | Umpan balik hasil visual | Sistem harus menampilkan banner berkode warna dan alasan hasil scan | Hasil RPC | Banner hijau, merah, atau kuning | Must |
| FR-ATT-06 | Sesi gate | Staf harus dapat memilih gate (misalnya Gate A, Gate B) sebelum mulai memindai | Pilihan gate | Gate tercatat pada setiap log check-in | Should |
| FR-ATT-07 | Riwayat scan staf | Sistem harus menampilkan riwayat scan terbaru milik staf | ID staf | Daftar log terbaru | Should |
| FR-ATT-08 | Ringkasan kehadiran | Sistem harus menyajikan agregat jumlah check-in per kategori dan per interval waktu | Rentang waktu, event | Data ringkasan untuk dasbor | Must |
| FR-ATT-09 | Siaran check-in real-time | Check-in baru harus disiarkan ke dasbor admin melalui Supabase Realtime | Insert pada tabel log | Pembaruan dasbor tanpa polling | Should |
| FR-ATT-10 | Pemindaian ulang aman | Pemindai harus menerapkan jeda (debounce) sehingga satu QR tidak diproses berulang oleh bingkai video berturut-turut | Bingkai video | Satu permintaan per QR dalam jendela jeda | Must |
| FR-ATT-11 | Pengisian manual darurat | Bila kamera gagal, staf dapat memasukkan kode tiket secara manual | Kode tiket teks | Proses verifikasi sama dengan hasil scan | Could |

### 6.6 FR-ADM dan FR-AUD: Administrasi dan Audit

| Kode | Nama Kebutuhan | Deskripsi | Input | Output / Hasil | Prioritas |
| --- | --- | --- | --- | --- | --- |
| FR-ADM-01 | Dasbor real-time | Admin harus dapat melihat kuota, tiket terklaim, dan check-in secara langsung | Langganan Realtime | Kartu metrik dan grafik yang terus diperbarui | Must |
| FR-ADM-02 | Pencarian dan detail tiket | Admin harus dapat mencari tiket berdasarkan email, ID, atau nama pemegang | Kata kunci | Daftar dan detail tiket | Should |
| FR-ADM-03 | Ekspor data | Admin harus dapat mengekspor rekap tiket dan kehadiran dalam format CSV | Filter dan rentang | Berkas CSV | Could |
| FR-ADM-04 | Manajemen pengguna dan peran | Admin harus dapat mencari pengguna dan menetapkan peran | Email atau ID | Peran diperbarui | Must |
| FR-AUD-01 | Audit log perubahan | Sistem harus mencatat aksi sensitif (ubah kuota, batalkan tiket, ubah peran, ubah katalog) | Aktor, aksi, entitas, data sebelum dan sesudah | Baris `shared_audit_logs` yang tidak dapat diubah | Must |
| FR-AUD-02 | Penanganan galat terstandar | Sistem harus mengembalikan kode dan pesan galat yang konsisten (struktur `AppError`) | Kondisi galat | Respons terstruktur (kode, pesan, rincian) | Should |

### 6.7 Matriks Keterlacakan: User Story ke Kebutuhan Fungsional

| User Story | Kebutuhan Fungsional Terkait |
| --- | --- |
| US-01 | FR-AUTH-01, FR-AUTH-02, FR-AUTH-03, FR-AUTH-04 |
| US-02 | FR-CAT-01, FR-CAT-02, FR-CAT-03 |
| US-03 | FR-TCK-02, FR-TCK-12 |
| US-04 | FR-TCK-03, FR-TCK-04, FR-TCK-05, FR-TCK-06, FR-TCK-10 |
| US-05 | FR-TCK-07, FR-TCK-08 |
| US-06 | FR-ATT-01, FR-ATT-10, FR-AUTH-05 |
| US-07 | FR-ATT-02, FR-ATT-05 |
| US-08 | FR-ATT-02, FR-ATT-03, FR-ATT-04 |
| US-09 | FR-ATT-07 |
| US-10 | FR-CAT-06, FR-CAT-07, FR-CAT-08, FR-AUD-01 |
| US-11 | FR-TCK-01, FR-TCK-09, FR-AUD-01 |
| US-12 | FR-ADM-01, FR-ATT-08, FR-ATT-09, FR-TCK-12 |
| US-13 | FR-AUTH-07, FR-ADM-04 |
| US-14 | FR-ADM-03 |

---

## BAB 7: KEBUTUHAN NON-FUNGSIONAL (NFR)

Angka kapasitas pada bab ini merupakan target acuan awal berdasarkan asumsi skala festival kampus (sekitar 2.000 pengguna konkuren pada puncak war ticket dan beberapa ribu penonton pada hari acara). Angka tersebut wajib divalidasi melalui uji beban sebelum rilis.

### 7.1 Matriks Kinerja (Performance)

| Kode | Aspek | Metrik | Target | Metode Pengukuran |
| --- | --- | --- | --- | --- |
| NFR-PERF-01 | Dekode QR | Waktu dari QR terlihat di bingkai kamera hingga string token terdekode | Rata-rata kurang dari 400 ms (p95 kurang dari 600 ms) pada ponsel kelas menengah | Instrumentasi `performance.now()` pada pemindai, uji pada minimal 3 perangkat |
| NFR-PERF-02 | Eksekusi RPC verifikasi | Durasi `verify_and_checkin_ticket` di database | p95 kurang dari 100 ms | `EXPLAIN ANALYZE`, `pg_stat_statements` |
| NFR-PERF-03 | Verifikasi end-to-end | Waktu dari token terdekode hingga banner hasil tampil | p95 kurang dari 1,5 detik pada jaringan 4G | Real User Monitoring dan uji lapangan |
| NFR-PERF-04 | Throughput gate | Waktu proses per penonton (termasuk interaksi manusia) | Kurang dari 3 detik | Simulasi alur gate |
| NFR-PERF-05 | Klaim tiket | Durasi `claim_ticket` pada beban konkuren | p95 kurang dari 300 ms pada 500 permintaan serentak ke satu kategori | Uji beban (k6) |
| NFR-PERF-06 | Kapasitas war ticket | Pengguna konkuren yang dapat dilayani | Minimal 2.000 pengguna konkuren, lonjakan 200 klaim per detik | Uji beban dan uji lonjakan |
| NFR-PERF-07 | Halaman katalog | Largest Contentful Paint | Kurang dari 2,5 detik pada 4G | Lighthouse, Vercel Analytics |
| NFR-PERF-08 | Realtime | Latensi dari perubahan data hingga UI diperbarui | Kurang dari 2 detik | Uji ujung ke ujung dengan stempel waktu |
| NFR-PERF-09 | Bundle halaman scan | Ukuran JavaScript awal halaman gate | Kurang dari 300 KB (gzip) | `next build` dan analisis bundle |

### 7.2 Keamanan (Security)

#### 7.2.1 Kontrol Keamanan

| Kode | Kategori | Persyaratan | Implementasi |
| --- | --- | --- | --- |
| NFR-SEC-01 | Enkripsi saat transit | Seluruh lalu lintas wajib HTTPS (TLS 1.2 atau lebih tinggi) | HTTPS otomatis Vercel dan Supabase, header HSTS aktif |
| NFR-SEC-02 | Enkripsi saat disimpan | Data basis data terenkripsi at rest | Enkripsi terkelola oleh penyedia infrastruktur Supabase (AES-256) |
| NFR-SEC-03 | Row-Level Security | RLS wajib aktif pada seluruh tabel skema `public` | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` dan kebijakan per peran (Bab 8.5) |
| NFR-SEC-04 | Atomic Transaction | Klaim tiket dan check-in wajib atomik dan bebas race condition | RPC PL/pgSQL, `SELECT ... FOR UPDATE`, constraint CHECK sebagai jaring pengaman |
| NFR-SEC-05 | Keunikan dan keacakan token QR | Token tidak dapat ditebak dan tidak memuat data pribadi | Minimal 128 bit entropi dari `gen_random_uuid()`, disimpan unik |
| NFR-SEC-06 | Pengelolaan kunci | `service_role key` tidak boleh terekspos ke klien | Hanya di variabel lingkungan server, tanpa awalan `NEXT_PUBLIC_` |
| NFR-SEC-07 | Keamanan OAuth | Redirect URL hanya dari daftar izin (allow-list) | Konfigurasi Supabase Auth dan Google Cloud Console |
| NFR-SEC-08 | RBAC berlapis | Otorisasi diperiksa di middleware, di service, dan di database | Middleware, `requireRole`, kebijakan RLS, dan pemeriksaan peran di dalam RPC |
| NFR-SEC-09 | Validasi input | Seluruh input divalidasi di server | Skema validasi (misalnya Zod) dan parameterisasi query |
| NFR-SEC-10 | Pembatasan laju (rate limiting) | Klaim dan verifikasi dibatasi per pengguna dan per IP | Rate limit pada Route Handler dan Server Action (misalnya Upstash atau middleware Vercel) |
| NFR-SEC-11 | Jejak audit | Aksi sensitif tercatat dan tidak dapat diubah | Tabel `shared_audit_logs` append-only (trigger penolak UPDATE dan DELETE) |
| NFR-SEC-12 | Header keamanan | CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | Konfigurasi `next.config.ts`. Izin kamera dibatasi untuk origin sendiri |
| NFR-SEC-13 | Hardening fungsi database | Fungsi `SECURITY DEFINER` dengan `search_path` terkunci dan hak EXECUTE minimal | `SET search_path = public`, `REVOKE EXECUTE ... FROM PUBLIC` |
| NFR-SEC-14 | Privasi dan data pribadi | Data pribadi dikumpulkan seminimal mungkin dan dikelola sesuai UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022) | Hanya nama, email, dan foto profil dari Google. Kebijakan privasi ditampilkan |
| NFR-SEC-15 | Keamanan rantai pasok | Dependensi dipindai kerentanannya | `npm audit` dan Dependabot pada CI |

#### 7.2.2 Model Ancaman dan Mitigasi

| Ancaman | Skenario | Mitigasi | Risiko Residual |
| --- | --- | --- | --- |
| Tiket palsu | Penyerang membuat QR rekayasa | Token acak 128 bit+ dan validasi ke database, bukan validasi format di klien | Sangat rendah |
| Penebakan token (brute force) | Mencoba token acak massal | Ruang token sangat besar, rate limit, log `INVALID_TOKEN` dan pemantauan | Sangat rendah |
| Penggandaan screenshot QR | Pemilik membagikan tangkapan layar ke banyak orang | Tiket sekali pakai: scan pertama menang, scan berikutnya `ALREADY_USED`. Log mencatat waktu dan gate | Orang pertama yang memindai tetap sah. QR dinamis berotasi dipertimbangkan pada fase berikutnya |
| Overselling | Ribuan klaim serentak | Kunci baris dan CHECK `quota_claimed <= quota_total` | Tidak ada |
| Scan ganda serentak | Dua staf memindai tiket sama bersamaan | Kunci baris pada tiket dan indeks unik parsial check-in sukses | Tidak ada |
| Eskalasi hak akses | Pengguna mengubah perannya sendiri | Pencabutan UPDATE pada kolom `role`, perubahan peran hanya via RPC admin | Rendah |
| Penyalahgunaan kunci API | Pembuatan permintaan langsung ke PostgREST | RLS aktif, pencabutan DML langsung pada tabel kritis | Rendah |
| DoS saat war ticket | Lonjakan trafik atau bot | CDN Vercel, rate limit, antrean berbasis kunci baris | Sedang, dipantau saat uji beban |

### 7.3 Keandalan (Reliability)

| Kode | Persyaratan | Target | Strategi |
| --- | --- | --- | --- |
| NFR-REL-01 | Ketersediaan pada jendela kritis (pembukaan tiket dan hari acara) | Minimal 99,5 persen | Infrastruktur terkelola, pemantauan, dan code freeze menjelang acara |
| NFR-REL-02 | Pencadangan data | RPO paling lama 24 jam (idealnya 15 menit dengan PITR bila paket mendukung), RTO paling lama 1 jam | Backup otomatis Supabase, prosedur pemulihan yang diuji |
| NFR-REL-03 | Konsistensi data | Tidak ada kuota negatif atau melebihi total | Constraint CHECK dan transaksi atomik |
| NFR-REL-04 | Penanganan kegagalan jaringan | Klik ganda atau retry tidak menghasilkan duplikasi | Kunci idempotensi pada klaim, debounce pada pemindai |
| NFR-REL-05 | Degradasi terkendali | Bila Realtime terputus, antarmuka tetap berfungsi dengan polling berkala | Fallback polling 5 detik dan indikator status koneksi |
| NFR-REL-06 | Prosedur darurat gate | Operasi gate tetap berjalan bila kamera atau jaringan bermasalah | Input kode manual (FR-ATT-11), gate cadangan, SOP kertas sebagai pilihan terakhir |
| NFR-REL-07 | Observabilitas | Galat dan metrik utama terpantau | Log Vercel, log Supabase, alert pada tingkat galat tinggi |
| NFR-REL-08 | Pengujian beban sebelum rilis | Skenario war ticket dan gate puncak tervalidasi | Uji k6 dan uji konkurensi pada RPC |

### 7.4 Kegunaan (Usability) dan Kompatibilitas

| Kode | Persyaratan | Target |
| --- | --- | --- |
| NFR-USA-01 | Desain mobile-first | Seluruh halaman penonton dan gate nyaman pada layar 360 px |
| NFR-USA-02 | Aksesibilitas | Mengacu WCAG 2.1 level AA (kontras warna, label, fokus keyboard) |
| NFR-USA-03 | Bahasa antarmuka | Bahasa Indonesia sebagai bahasa utama dengan pesan galat yang jelas dan dapat ditindaklanjuti |
| NFR-USA-04 | Efisiensi alur klaim | Dari halaman tiket hingga tiket terbit maksimal 3 langkah (pilih, konfirmasi, selesai) |
| NFR-USA-05 | Antarmuka scan | Banner hasil menutupi minimal 40 persen layar, target sentuh minimal 44 px, kontras tinggi di luar ruangan |
| NFR-USA-06 | Umpan balik sistem | Setiap aksi memberi indikator pemuatan (skeleton atau spinner) dan notifikasi hasil (toast) |
| NFR-USA-07 | Kompatibilitas peramban | Dua versi terbaru Chrome, Safari, Firefox, dan Edge. Android 9 ke atas dan iOS 15 ke atas |
| NFR-USA-08 | Pembelajaran | Gate staff dapat menggunakan pemindai tanpa pelatihan lebih dari 10 menit |

### 7.5 Pemeliharaan, Skalabilitas, dan Kemampuan Uji

| Kode | Persyaratan | Strategi |
| --- | --- | --- |
| NFR-MNT-01 | Modularitas | Batas modul ditegakkan ESLint dan code review (Bab 3 dan 4) |
| NFR-MNT-02 | Migrasi basis data berversi | Seluruh perubahan skema berupa berkas migrasi berurutan di `supabase/migrations/` |
| NFR-MNT-03 | Keamanan tipe | Tipe database dihasilkan otomatis (`supabase gen types`) dan TypeScript strict mode |
| NFR-MNT-04 | Cakupan pengujian | Minimal 70 persen pada lapisan domain dan application, wajib ada uji konkurensi `claim_ticket` dan `verify_and_checkin_ticket` |
| NFR-MNT-05 | CI/CD | Lint, typecheck, dan test wajib lulus sebelum penggabungan. Preview deployment pada setiap pull request |
| NFR-SCL-01 | Skalabilitas vertikal dan horizontal | Lapisan aplikasi serverless menskalakan otomatis. Database dapat ditingkatkan kapasitasnya. Modul dapat diekstrak menjadi layanan terpisah bila dibutuhkan |
| NFR-SCL-02 | Titik panas kuota | Penguncian baris pada kategori tiket diterima sebagai trade-off. Bila throughput tidak memadai, alternatif adalah pemecahan penghitung kuota (sharded counter) atau antrean permintaan |

---

## BAB 8: SKEMA BASIS DATA DAN KODE IMPLEMENTASI

### 8.1 Konvensi dan Gambaran Relasi

| Konvensi | Aturan |
| --- | --- |
| Prefix tabel | `shared_`, `catalog_`, `ticket_`, `attendance_` menandai kepemilikan modul |
| Kunci primer | UUID (`gen_random_uuid()`), kecuali log berurutan yang memakai `bigint identity` |
| Waktu | Seluruh stempel waktu bertipe `timestamptz` (UTC) |
| Fungsi | Diberi prefix modul pemilik: `shared_*`, `ticket_*`. RPC publik yang dipanggil klien: `claim_ticket`, `verify_and_checkin_ticket` |
| Referensi lintas modul | Memakai kolom UUID. FK lintas modul hanya untuk kunci identitas stabil dan telah disetujui arsitek (ditandai komentar `-- CROSS-MODULE`) |
| Berkas migrasi | Dijalankan berurutan sesuai penomoran pada Bab 4 |

```text
auth.users 1---1 shared_profiles 1---* ticket_tickets
                                   |
catalog_venues 1---* catalog_events 1---* ticket_types 1---* ticket_tickets
                        |  \
                        |   +--* catalog_stages 1---* catalog_schedules *---1 catalog_artists
                        +--* catalog_announcements

attendance_gates 1---* attendance_checkin_logs
  (referensi lunak berupa UUID ke ticket_tickets dan ticket_types, tanpa FK lintas modul)
shared_audit_logs: dicatat oleh seluruh modul melalui shared_write_audit()
```

### 8.2 DDL Modul Shared (0001\_shared\_schema.sql)

```sql
-- Ekstensi untuk constraint jadwal tidak bertabrakan
create extension if not exists btree_gist;

create type public.shared_user_role as enum ('audience', 'gate_staff', 'admin');

create or replace function public.shared_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.shared_profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  role        public.shared_user_role not null default 'audience',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_shared_profiles_updated
  before update on public.shared_profiles
  for each row execute function public.shared_set_updated_at();

-- Profil otomatis saat pengguna pertama kali login Google (FR-AUTH-03)
create or replace function public.shared_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.shared_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.shared_handle_new_user();

-- Fungsi bantu otorisasi (membaca peran dari tabel, bukan dari JWT,
-- agar perubahan peran berlaku seketika)
create or replace function public.shared_current_role()
returns public.shared_user_role
language sql stable security definer set search_path = public as $$
  select role from public.shared_profiles where id = auth.uid() and is_active;
$$;

create or replace function public.shared_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.shared_current_role() = 'admin', false);
$$;

create or replace function public.shared_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.shared_current_role() in ('gate_staff', 'admin'), false);
$$;

create or replace function public.shared_is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.shared_profiles where id = auth.uid() and is_active);
$$;

-- Audit log append-only (FR-AUD-01)
create table public.shared_audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.shared_profiles (id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);
create index ix_shared_audit_entity  on public.shared_audit_logs (entity_type, entity_id);
create index ix_shared_audit_created on public.shared_audit_logs (created_at desc);

create or replace function public.shared_audit_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'shared_audit_logs bersifat append-only';
end;
$$;

create trigger trg_shared_audit_immutable
  before update or delete on public.shared_audit_logs
  for each row execute function public.shared_audit_immutable();

create or replace function public.shared_write_audit(
  p_action text, p_entity_type text, p_entity_id text,
  p_old jsonb default null, p_new jsonb default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.shared_audit_logs (actor_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_old, p_new);
end;
$$;

-- Perubahan peran hanya melalui RPC admin (FR-AUTH-07)
create or replace function public.shared_admin_set_user_role(
  p_user_id uuid, p_role public.shared_user_role
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_old    public.shared_user_role;
  v_admins integer;
begin
  if not public.shared_is_admin() then
    return jsonb_build_object('success', false, 'code', 'FORBIDDEN');
  end if;

  select role into v_old from public.shared_profiles where id = p_user_id for update;
  if not found then
    return jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
  end if;

  if v_old = 'admin' and p_role <> 'admin' then
    select count(*) into v_admins from public.shared_profiles where role = 'admin' and is_active;
    if v_admins <= 1 then
      return jsonb_build_object('success', false, 'code', 'LAST_ADMIN');
    end if;
  end if;

  update public.shared_profiles set role = p_role where id = p_user_id;
  perform public.shared_write_audit('USER_ROLE_CHANGED', 'profile', p_user_id::text,
            jsonb_build_object('role', v_old), jsonb_build_object('role', p_role));

  return jsonb_build_object('success', true, 'code', 'OK');
end;
$$;
```

### 8.3 DDL Modul EventCatalog (0002\_catalog\_schema.sql)

```sql
create table public.catalog_venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  latitude    numeric(9,6),
  longitude   numeric(9,6),
  map_url     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.catalog_events (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  terms         text,
  venue_id      uuid references public.catalog_venues (id) on delete set null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint ck_catalog_events_period check (ends_at > starts_at)
);

create table public.catalog_artists (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  genre          text,
  bio            text,
  photo_url      text,
  instagram_url  text,
  spotify_url    text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.catalog_stages (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references public.catalog_events (id) on delete cascade,
  name      text not null,
  unique (event_id, name)
);

create table public.catalog_schedules (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.catalog_events (id) on delete cascade,
  stage_id    uuid not null references public.catalog_stages (id) on delete restrict,
  artist_id   uuid not null references public.catalog_artists (id) on delete restrict,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  notes       text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint ck_catalog_schedules_period check (ends_at > starts_at),
  -- FR-CAT-07: dua sesi pada panggung yang sama tidak boleh tumpang tindih
  constraint ex_catalog_schedules_no_overlap
    exclude using gist (stage_id with =, tstzrange(starts_at, ends_at) with &&)
    where (deleted_at is null)
);
create index ix_catalog_schedules_event_time on public.catalog_schedules (event_id, starts_at);

create table public.catalog_announcements (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.catalog_events (id) on delete cascade,
  title         text not null,
  body          text not null,
  is_pinned     boolean not null default false,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create trigger trg_catalog_venues_updated    before update on public.catalog_venues    for each row execute function public.shared_set_updated_at();
create trigger trg_catalog_events_updated    before update on public.catalog_events    for each row execute function public.shared_set_updated_at();
create trigger trg_catalog_artists_updated   before update on public.catalog_artists   for each row execute function public.shared_set_updated_at();
create trigger trg_catalog_schedules_updated before update on public.catalog_schedules for each row execute function public.shared_set_updated_at();
```

### 8.4 DDL Modul Ticketing dan Attendance (0003 dan 0004)

```sql
-- ===== 0003_ticket_schema.sql =====
create type public.ticket_status as enum ('ACTIVE', 'USED', 'CANCELLED');

create table public.ticket_types (
  id              uuid primary key default gen_random_uuid(),
  -- CROSS-MODULE: referensi stabil ke EventCatalog (disetujui arsitek)
  event_id        uuid not null references public.catalog_events (id) on delete restrict,
  name            text not null,
  description     text,
  price_idr       numeric(12,2) not null default 0 check (price_idr >= 0),
  quota_total     integer not null check (quota_total > 0),
  quota_claimed   integer not null default 0 check (quota_claimed >= 0),
  max_per_user    smallint not null default 2 check (max_per_user between 1 and 10),
  sale_starts_at  timestamptz not null,
  sale_ends_at    timestamptz not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (event_id, name),
  constraint ck_ticket_types_sale_window check (sale_ends_at > sale_starts_at),
  -- JARING PENGAMAN TERAKHIR terhadap overselling, berlaku walau terjadi bug aplikasi
  constraint ck_ticket_types_quota_not_exceeded check (quota_claimed <= quota_total)
);

create table public.ticket_tickets (
  id               uuid primary key default gen_random_uuid(),
  ticket_type_id   uuid not null references public.ticket_types (id) on delete restrict,
  -- CROSS-MODULE: identitas pemilik dari modul Shared
  owner_id         uuid not null references public.shared_profiles (id) on delete restrict,
  qr_token         text not null unique
                   default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  status           public.ticket_status not null default 'ACTIVE',
  idempotency_key  text check (char_length(idempotency_key) <= 100),
  claimed_at       timestamptz not null default now(),
  used_at          timestamptz,
  cancelled_at     timestamptz,
  cancel_reason    text,
  constraint ck_ticket_used_has_timestamp check (status <> 'USED' or used_at is not null)
);
create index ix_ticket_tickets_owner       on public.ticket_tickets (owner_id);
create index ix_ticket_tickets_type_status on public.ticket_tickets (ticket_type_id, status);
create index ix_ticket_tickets_idempotency on public.ticket_tickets (owner_id, ticket_type_id, idempotency_key)
  where idempotency_key is not null;

create trigger trg_ticket_types_updated
  before update on public.ticket_types
  for each row execute function public.shared_set_updated_at();

-- ===== 0004_attendance_schema.sql =====
create type public.attendance_result as enum
  ('SUCCESS', 'INVALID_TOKEN', 'ALREADY_USED', 'CANCELLED', 'UNAUTHORIZED');

create table public.attendance_gates (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null,          -- referensi lunak ke catalog_events (tanpa FK)
  name       text not null,
  is_active  boolean not null default true,
  unique (event_id, name)
);

create table public.attendance_checkin_logs (
  id              bigint generated always as identity primary key,
  gate_id         uuid references public.attendance_gates (id) on delete set null,
  staff_id        uuid references public.shared_profiles (id) on delete set null,
  ticket_id       uuid,              -- referensi lunak ke ticket_tickets.id
  ticket_type_id  uuid,              -- salinan (snapshot) agar ringkasan tidak perlu join lintas modul
  token_hash      text not null,     -- SHA-256 dari token yang dipindai (token mentah tidak disimpan)
  result          public.attendance_result not null,
  scanned_at      timestamptz not null default now(),
  client_info     jsonb
);
create index ix_attendance_logs_scanned_at on public.attendance_checkin_logs (scanned_at desc);
create index ix_attendance_logs_staff      on public.attendance_checkin_logs (staff_id, scanned_at desc);
create index ix_attendance_logs_type       on public.attendance_checkin_logs (ticket_type_id) where result = 'SUCCESS';

-- Jaring pengaman: satu tiket hanya boleh memiliki satu check-in sukses
create unique index uq_attendance_one_success_per_ticket
  on public.attendance_checkin_logs (ticket_id) where result = 'SUCCESS';
```

### 8.5 Row-Level Security dan Hak Akses (0007\_rls\_policies.sql)

Prinsip: tolak secara default (deny by default). Tabel kritis (`ticket_tickets`, `attendance_checkin_logs`, `shared_audit_logs`) tidak dapat ditulis langsung oleh klien. Seluruh penulisan melalui RPC `SECURITY DEFINER`. Pada Supabase, hak akses default pada tabel baru diberikan ke `anon` dan `authenticated`, sehingga pencabutan hak secara eksplisit di bawah ini wajib dijalankan.

```sql
-- 1) Aktifkan RLS pada seluruh tabel
do $$
declare t text;
begin
  foreach t in array array[
    'shared_profiles','shared_audit_logs',
    'catalog_venues','catalog_events','catalog_artists','catalog_stages',
    'catalog_schedules','catalog_announcements',
    'ticket_types','ticket_tickets',
    'attendance_gates','attendance_checkin_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- 2) Pencabutan hak DML langsung pada tabel kritis
revoke all on public.ticket_tickets, public.attendance_checkin_logs, public.shared_audit_logs
  from anon, authenticated;
grant select on public.ticket_tickets, public.attendance_checkin_logs, public.shared_audit_logs
  to authenticated;

-- Profil: pengguna hanya boleh mengubah nama dan avatar, bukan peran
revoke insert, update, delete on public.shared_profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.shared_profiles to authenticated;

-- Katalog dan kategori tiket: anon hanya boleh membaca
revoke insert, update, delete on
  public.catalog_venues, public.catalog_events, public.catalog_artists, public.catalog_stages,
  public.catalog_schedules, public.catalog_announcements, public.ticket_types, public.attendance_gates
  from anon;

-- 3) shared_profiles
create policy shared_profiles_select_own_or_admin on public.shared_profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shared_is_admin());

create policy shared_profiles_update_own on public.shared_profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 4) Katalog: publik membaca konten terbit
create policy catalog_events_public_read on public.catalog_events
  for select to anon, authenticated using (is_published);
create policy catalog_venues_public_read on public.catalog_venues
  for select to anon, authenticated using (true);
create policy catalog_artists_public_read on public.catalog_artists
  for select to anon, authenticated using (is_active);
create policy catalog_stages_public_read on public.catalog_stages
  for select to anon, authenticated using (true);
create policy catalog_schedules_public_read on public.catalog_schedules
  for select to anon, authenticated using (deleted_at is null);
create policy catalog_announcements_public_read on public.catalog_announcements
  for select to anon, authenticated using (true);

-- 5) Ticketing
create policy ticket_types_public_read on public.ticket_types
  for select to anon, authenticated using (is_active);

create policy ticket_tickets_select_own_or_admin on public.ticket_tickets
  for select to authenticated
  using (owner_id = (select auth.uid()) or public.shared_is_admin());

-- 6) Attendance
create policy attendance_gates_staff_read on public.attendance_gates
  for select to authenticated using (public.shared_is_staff());

create policy attendance_logs_select_scope on public.attendance_checkin_logs
  for select to authenticated
  using (staff_id = (select auth.uid()) or public.shared_is_admin());

-- 7) Audit: hanya admin yang dapat membaca
create policy shared_audit_admin_read on public.shared_audit_logs
  for select to authenticated using (public.shared_is_admin());

-- 8) Admin: akses penuh pada tabel konfigurasi dan konten
do $$
declare t text;
begin
  foreach t in array array[
    'catalog_venues','catalog_events','catalog_artists','catalog_stages',
    'catalog_schedules','catalog_announcements','ticket_types','attendance_gates'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.shared_is_admin()) with check (public.shared_is_admin())',
      t || '_admin_all', t);
  end loop;
end $$;

-- 9) Realtime: siarkan perubahan kuota dan check-in (tetap tunduk pada RLS)
alter publication supabase_realtime add table public.ticket_types, public.attendance_checkin_logs;
```

| Tabel | Anon | Audience | Gate Staff | Admin |
| --- | --- | --- | --- | --- |
| `shared_profiles` | Tidak | Baca dan ubah profil sendiri (nama, avatar) | Sama seperti audience | Baca semua. Ubah peran via RPC |
| `catalog_*` | Baca konten terbit | Baca konten terbit | Baca konten terbit | CRUD penuh |
| `ticket_types` | Baca kategori aktif | Baca kategori aktif | Baca kategori aktif | CRUD penuh |
| `ticket_tickets` | Tidak | Baca milik sendiri. Tulis hanya via `claim_ticket` | Tidak langsung. Verifikasi via RPC | Baca semua. Batal via RPC |
| `attendance_gates` | Tidak | Tidak | Baca | CRUD penuh |
| `attendance_checkin_logs` | Tidak | Tidak | Baca log sendiri. Tulis via RPC | Baca semua |
| `shared_audit_logs` | Tidak | Tidak | Tidak | Baca |

### 8.6 Stored Procedure (RPC) Kritis

#### 8.6.1 `claim_ticket`: Klaim Tiket Atomik Anti-Overselling (0005\_rpc\_claim\_ticket.sql)

Strategi: baris kategori tiket dikunci dengan `SELECT ... FOR UPDATE`. Seluruh klaim serentak pada kategori yang sama diserialisasi oleh PostgreSQL, sehingga pemeriksaan kuota dan penambahan penghitung terjadi tanpa sela. Pemeriksaan idempotensi dan batas per akun dilakukan setelah kunci diperoleh agar bebas race condition. Fungsi mengembalikan JSONB berisi kode hasil yang terstandar untuk ditampilkan oleh antarmuka.

```sql
create or replace function public.claim_ticket(
  p_ticket_type_id  uuid,
  p_quantity        integer default 1,
  p_idempotency_key text    default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_type    public.ticket_types%rowtype;
  v_owned   integer;
  v_tickets jsonb;
begin
  -- 1. Autentikasi
  if v_uid is null or not public.shared_is_active_user() then
    return jsonb_build_object('success', false, 'code', 'UNAUTHENTICATED',
             'message', 'Silakan masuk terlebih dahulu.');
  end if;

  -- 2. Validasi jumlah
  if p_quantity is null or p_quantity < 1 or p_quantity > 5 then
    return jsonb_build_object('success', false, 'code', 'INVALID_QUANTITY',
             'message', 'Jumlah tiket harus antara 1 dan 5.');
  end if;

  -- 3. KUNCI baris kategori: seluruh klaim serentak pada kategori ini antre di sini
  select * into v_type
    from public.ticket_types
   where id = p_ticket_type_id and is_active
     for update;

  if not found then
    return jsonb_build_object('success', false, 'code', 'TYPE_NOT_FOUND',
             'message', 'Kategori tiket tidak ditemukan.');
  end if;

  -- 4. Idempotensi: permintaan ulang dengan kunci sama mengembalikan hasil sebelumnya
  if p_idempotency_key is not null then
    select coalesce(jsonb_agg(jsonb_build_object('ticket_id', id, 'qr_token', qr_token)
                              order by claimed_at), '[]'::jsonb)
      into v_tickets
      from public.ticket_tickets
     where owner_id = v_uid
       and ticket_type_id = v_type.id
       and idempotency_key = p_idempotency_key;

    if jsonb_array_length(v_tickets) > 0 then
      return jsonb_build_object('success', true, 'code', 'OK', 'replayed', true,
               'tickets', v_tickets,
               'remaining', v_type.quota_total - v_type.quota_claimed);
    end if;
  end if;

  -- 5. Jendela penjualan (memakai waktu server)
  if now() < v_type.sale_starts_at then
    return jsonb_build_object('success', false, 'code', 'SALE_NOT_OPEN',
             'message', 'Penjualan belum dibuka.');
  end if;
  if now() > v_type.sale_ends_at then
    return jsonb_build_object('success', false, 'code', 'SALE_CLOSED',
             'message', 'Penjualan telah ditutup.');
  end if;

  -- 6. Batas per akun
  select count(*) into v_owned
    from public.ticket_tickets
   where owner_id = v_uid
     and ticket_type_id = v_type.id
     and status in ('ACTIVE', 'USED');

  if v_owned + p_quantity > v_type.max_per_user then
    return jsonb_build_object('success', false, 'code', 'LIMIT_REACHED',
             'message', format('Batas %s tiket per akun untuk kategori ini.', v_type.max_per_user));
  end if;

  -- 7. Kuota
  if v_type.quota_claimed + p_quantity > v_type.quota_total then
    return jsonb_build_object('success', false, 'code', 'SOLD_OUT',
             'message', 'Kuota tiket habis.');
  end if;

  -- 8. Tulis: penambahan penghitung dan penerbitan tiket dalam satu transaksi
  update public.ticket_types
     set quota_claimed = quota_claimed + p_quantity
   where id = v_type.id;

  with ins as (
    insert into public.ticket_tickets (ticket_type_id, owner_id, idempotency_key)
    select v_type.id, v_uid, p_idempotency_key
      from generate_series(1, p_quantity)
    returning id, qr_token
  )
  select jsonb_agg(jsonb_build_object('ticket_id', id, 'qr_token', qr_token))
    into v_tickets from ins;

  return jsonb_build_object('success', true, 'code', 'OK', 'replayed', false,
           'tickets', v_tickets,
           'remaining', v_type.quota_total - v_type.quota_claimed - p_quantity);
end;
$$;

revoke execute on function public.claim_ticket(uuid, integer, text) from public, anon;
grant  execute on function public.claim_ticket(uuid, integer, text) to authenticated;
```

Penjelasan mekanisme anti-overselling:

| Lapisan Pertahanan | Mekanisme | Fungsi |
| --- | --- | --- |
| Lapisan 1 | `SELECT ... FOR UPDATE` pada `ticket_types` | Menserialkan klaim serentak sehingga pemeriksaan dan penambahan kuota atomik |
| Lapisan 2 | Pemeriksaan `quota_claimed + p_quantity > quota_total` di dalam kunci | Menolak klaim melebihi kuota dengan kode `SOLD_OUT` |
| Lapisan 3 | CHECK `ck_ticket_types_quota_not_exceeded` | Menggagalkan transaksi bila terjadi bug logika, sehingga overselling mustahil di level data |
| Lapisan 4 | Idempotensi di dalam kunci | Klik ganda tidak menambah kuota dua kali |

#### 8.6.2 Fungsi Internal Ticketing: `ticket_internal_mark_used`

Fungsi ini adalah satu-satunya jalur bagi modul Attendance untuk mengubah status tiket. Dimiliki modul Ticketing, tidak dapat dipanggil langsung oleh klien.

```sql
create or replace function public.ticket_internal_mark_used(p_qr_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_t      public.ticket_tickets%rowtype;
  v_type   text;
  v_holder text;
begin
  -- KUNCI baris tiket: scan serentak pada tiket yang sama diserialisasi di sini
  select * into v_t from public.ticket_tickets where qr_token = p_qr_token for update;

  if not found then
    return jsonb_build_object('outcome', 'NOT_FOUND');
  end if;

  select name into v_type from public.ticket_types where id = v_t.ticket_type_id;
  select coalesce(full_name, email) into v_holder from public.shared_profiles where id = v_t.owner_id;

  if v_t.status = 'CANCELLED' then
    return jsonb_build_object('outcome', 'CANCELLED', 'ticket_id', v_t.id,
             'ticket_type_id', v_t.ticket_type_id, 'ticket_type_name', v_type,
             'holder_name', v_holder);
  end if;

  if v_t.status = 'USED' then
    return jsonb_build_object('outcome', 'ALREADY_USED', 'ticket_id', v_t.id,
             'ticket_type_id', v_t.ticket_type_id, 'ticket_type_name', v_type,
             'holder_name', v_holder, 'used_at', v_t.used_at);
  end if;

  update public.ticket_tickets
     set status = 'USED', used_at = now()
   where id = v_t.id;

  return jsonb_build_object('outcome', 'MARKED_USED', 'ticket_id', v_t.id,
           'ticket_type_id', v_t.ticket_type_id, 'ticket_type_name', v_type,
           'holder_name', v_holder, 'used_at', now());
end;
$$;

-- Tidak boleh dipanggil langsung oleh klien
revoke execute on function public.ticket_internal_mark_used(text) from public, anon, authenticated;
```

#### 8.6.3 `verify_and_checkin_ticket`: Verifikasi dan Check-in Atomik (0006\_rpc\_verify\_checkin.sql)

```sql
create or replace function public.verify_and_checkin_ticket(
  p_qr_token text,
  p_gate_id  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_staff     uuid := auth.uid();
  v_token     text := btrim(coalesce(p_qr_token, ''));
  v_hash      text;
  v_gate      public.attendance_gates%rowtype;
  v_mark      jsonb := null;
  v_result    public.attendance_result;
  v_ticket_id uuid;
  v_type_id   uuid;
begin
  -- 1. Otorisasi: hanya gate_staff atau admin (tanpa log untuk menghindari banjir log dari penyerang)
  if v_staff is null or not public.shared_is_staff() then
    return jsonb_build_object('success', false, 'code', 'UNAUTHORIZED',
             'message', 'Akses ditolak. Hanya gate staff atau admin.');
  end if;

  -- 2. Validasi gate
  select * into v_gate from public.attendance_gates where id = p_gate_id and is_active;
  if not found then
    return jsonb_build_object('success', false, 'code', 'GATE_NOT_FOUND',
             'message', 'Gate tidak ditemukan atau tidak aktif.');
  end if;

  -- 3. Hash token untuk log (token mentah tidak disimpan)
  v_hash := encode(sha256(convert_to(v_token, 'UTF8')), 'hex');

  -- 4. Verifikasi dan penandaan tiket (atomik, di bawah kunci baris tiket)
  if char_length(v_token) < 32 or char_length(v_token) > 128 then
    v_result := 'INVALID_TOKEN';
  else
    v_mark := public.ticket_internal_mark_used(v_token);
    v_result := (case v_mark ->> 'outcome'
                   when 'MARKED_USED'  then 'SUCCESS'
                   when 'ALREADY_USED' then 'ALREADY_USED'
                   when 'CANCELLED'    then 'CANCELLED'
                   else 'INVALID_TOKEN'
                 end)::public.attendance_result;
  end if;

  v_ticket_id := nullif(v_mark ->> 'ticket_id', '')::uuid;
  v_type_id   := nullif(v_mark ->> 'ticket_type_id', '')::uuid;

  -- 5. Catat log (sukses maupun gagal) dalam transaksi yang sama
  insert into public.attendance_checkin_logs
    (gate_id, staff_id, ticket_id, ticket_type_id, token_hash, result)
  values
    (v_gate.id, v_staff, v_ticket_id, v_type_id, v_hash, v_result);

  -- 6. Respons terstandar untuk banner di antarmuka gate
  return jsonb_build_object(
    'success',     v_result = 'SUCCESS',
    'code',        v_result::text,
    'message',     case v_result
                     when 'SUCCESS'      then 'Check-in berhasil. Silakan masuk.'
                     when 'ALREADY_USED' then 'Tiket sudah pernah digunakan.'
                     when 'CANCELLED'    then 'Tiket telah dibatalkan.'
                     else 'Tiket tidak valid.'
                   end,
    'gate',        v_gate.name,
    'holder_name', v_mark ->> 'holder_name',
    'ticket_type', v_mark ->> 'ticket_type_name',
    'used_at',     v_mark ->> 'used_at'
  );
end;
$$;

revoke execute on function public.verify_and_checkin_ticket(text, uuid) from public, anon;
grant  execute on function public.verify_and_checkin_ticket(text, uuid) to authenticated;
```

Jaminan perilaku untuk dua perangkat yang memindai tiket sama secara bersamaan:

| Langkah | Transaksi A | Transaksi B |
| --- | --- | --- |
| 1 | Mengunci baris tiket (`FOR UPDATE`) | Menunggu kunci |
| 2 | Mengubah status menjadi `USED`, mencatat log `SUCCESS`, commit | Masih menunggu |
| 3 | Selesai: banner hijau | Kunci diperoleh, membaca status `USED`, mengembalikan `ALREADY_USED`, mencatat log, banner kuning |
| Jaring pengaman | Indeks unik parsial `uq_attendance_one_success_per_ticket` menjamin tidak mungkin ada dua log `SUCCESS` untuk tiket yang sama |  |

#### 8.6.4 `ticket_admin_cancel_ticket`: Pembatalan Tiket oleh Admin

```sql
create or replace function public.ticket_admin_cancel_ticket(
  p_ticket_id uuid, p_reason text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_t public.ticket_tickets%rowtype;
begin
  if not public.shared_is_admin() then
    return jsonb_build_object('success', false, 'code', 'FORBIDDEN');
  end if;

  select * into v_t from public.ticket_tickets where id = p_ticket_id for update;
  if not found then
    return jsonb_build_object('success', false, 'code', 'NOT_FOUND');
  end if;
  if v_t.status <> 'ACTIVE' then
    return jsonb_build_object('success', false, 'code', 'NOT_CANCELLABLE',
             'message', 'Hanya tiket berstatus ACTIVE yang dapat dibatalkan.');
  end if;

  update public.ticket_tickets
     set status = 'CANCELLED', cancelled_at = now(), cancel_reason = p_reason
   where id = p_ticket_id;

  update public.ticket_types
     set quota_claimed = quota_claimed - 1
   where id = v_t.ticket_type_id;

  perform public.shared_write_audit('TICKET_CANCELLED', 'ticket', p_ticket_id::text,
            jsonb_build_object('status', v_t.status),
            jsonb_build_object('status', 'CANCELLED', 'reason', p_reason));

  return jsonb_build_object('success', true, 'code', 'OK');
end;
$$;

revoke execute on function public.ticket_admin_cancel_ticket(uuid, text) from public, anon;
grant  execute on function public.ticket_admin_cancel_ticket(uuid, text) to authenticated;

-- Fungsi shared juga dikunci
revoke execute on function public.shared_write_audit(text, text, text, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.shared_admin_set_user_role(uuid, public.shared_user_role) from public, anon;
grant  execute on function public.shared_admin_set_user_role(uuid, public.shared_user_role) to authenticated;
```

### 8.7 Pemanggilan dari Aplikasi dan Pengujian

#### 8.7.1 Pemanggilan RPC dari Modul (TypeScript)

```ts
// src/modules/ticketing/application/claim-ticket.usecase.ts
import { createServerClient } from '@/modules/shared';
import { randomUUID } from 'node:crypto';

export async function claimTicket(ticketTypeId: string, quantity = 1, idempotencyKey?: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('claim_ticket', {
    p_ticket_type_id: ticketTypeId,
    p_quantity: quantity,
    p_idempotency_key: idempotencyKey ?? randomUUID(),
  });
  if (error) throw new Error('CLAIM_RPC_FAILED');
  return data as { success: boolean; code: string; message?: string; tickets?: { ticket_id: string; qr_token: string }[]; remaining?: number };
}
```

```ts
// src/modules/attendance/application/verify-and-checkin.usecase.ts
import { createServerClient } from '@/modules/shared';

export async function verifyAndCheckin(qrToken: string, gateId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('verify_and_checkin_ticket', {
    p_qr_token: qrToken,
    p_gate_id: gateId,
  });
  if (error) throw new Error('CHECKIN_RPC_FAILED');
  return data as { success: boolean; code: string; message: string; holder_name?: string; ticket_type?: string; gate?: string; used_at?: string };
}
```

#### 8.7.2 Data Awal (Seed) Contoh

```sql
insert into public.catalog_venues (id, name, address)
values ('00000000-0000-0000-0000-0000000000a1', 'Lapangan Utama ITERA', 'Lampung Selatan');

insert into public.catalog_events (id, slug, name, venue_id, starts_at, ends_at, is_published)
values ('00000000-0000-0000-0000-0000000000e1', 'terrafest-2026', 'Terra Festival 2026',
        '00000000-0000-0000-0000-0000000000a1',
        '2026-12-12 10:00:00+07', '2026-12-12 23:00:00+07', true);

insert into public.ticket_types (event_id, name, price_idr, quota_total, max_per_user, sale_starts_at, sale_ends_at)
values
  ('00000000-0000-0000-0000-0000000000e1', 'Regular',   0, 3000, 2, now(), now() + interval '30 days'),
  ('00000000-0000-0000-0000-0000000000e1', 'Early Bird', 0,  500, 2, now(), now() + interval '7 days');

insert into public.attendance_gates (event_id, name)
values ('00000000-0000-0000-0000-0000000000e1', 'Gate A'),
       ('00000000-0000-0000-0000-0000000000e1', 'Gate B');
```

#### 8.7.3 Uji Konkurensi Anti-Overselling (Skenario Wajib)

| Skenario Uji | Langkah | Hasil yang Diharapkan |
| --- | --- | --- |
| T-01 Kuota 10, 200 pengguna klaim serentak | Buat kategori `quota_total = 10`, jalankan 200 panggilan `claim_ticket` paralel dari 200 akun uji | Tepat 10 sukses, 190 `SOLD_OUT`, `quota_claimed = 10`, jumlah baris tiket = 10 |
| T-02 Satu akun klik ganda | Dua panggilan paralel dengan `idempotency_key` sama | Satu set tiket, panggilan kedua `replayed = true` |
| T-03 Batas per akun | Satu akun mengklaim 3 kali dengan `max_per_user = 2` | Dua sukses pertama, berikutnya `LIMIT_REACHED` |
| T-04 Scan ganda serentak | Dua sesi staf memanggil `verify_and_checkin_ticket` pada token sama | Satu `SUCCESS`, satu `ALREADY_USED`, hanya satu log `SUCCESS` |
| T-05 Token acak | 1.000 token acak dipindai | Seluruhnya `INVALID_TOKEN`, tercatat di log |
| T-06 Akses tidak sah | Pengguna `audience` memanggil `verify_and_checkin_ticket` | `UNAUTHORIZED` |
| T-07 Eskalasi peran | Pengguna mencoba `update shared_profiles set role = 'admin'` | Ditolak (hak UPDATE pada kolom `role` dicabut) |
| T-08 Penulisan langsung | Pengguna mencoba `insert into ticket_tickets` melalui klien | Ditolak (hak INSERT dicabut dan tidak ada policy) |

```ts
// tests/integration/claim-ticket.concurrency.test.ts (ringkasan)
it('tidak pernah melebihi kuota saat 200 klaim serentak', async () => {
  const results = await Promise.all(testUsers.map((u) => u.client.rpc('claim_ticket', {
    p_ticket_type_id: typeId, p_quantity: 1, p_idempotency_key: crypto.randomUUID(),
  })));
  const ok = results.filter((r) => r.data?.code === 'OK').length;
  const soldOut = results.filter((r) => r.data?.code === 'SOLD_OUT').length;
  expect(ok).toBe(10);
  expect(soldOut).toBe(190);
  const { data } = await admin.from('ticket_types').select('quota_claimed').eq('id', typeId).single();
  expect(data!.quota_claimed).toBe(10);
});
```

---

## BAB 9: ALUR KERJA SISTEM END-TO-END

Bab ini menguraikan skenario utama dari persiapan oleh admin, klaim tiket oleh penonton, hingga check-in oleh gate staff di lapangan.

### 9.1 Ikhtisar Fase

| Fase | Aktor | Waktu | Hasil |
| --- | --- | --- | --- |
| A. Persiapan | Admin | H-30 sampai H-7 | Katalog, kategori tiket, gate, dan peran staf siap |
| B. Penemuan informasi | Audience | H-30 sampai hari acara | Penonton memperoleh informasi resmi |
| C. Klaim tiket (war ticket) | Audience | Saat penjualan dibuka | Tiket terbit dengan QR unik tanpa overselling |
| D. Persiapan hari acara | Audience dan Gate Staff | H-1 sampai H | Tiket siap ditunjukkan, staf siap memindai |
| E. Check-in di gate | Gate Staff dan Audience | Hari acara | Kehadiran tercatat, scan ganda ditolak |
| F. Pemantauan dan pasca acara | Admin | Selama dan setelah acara | Dasbor real-time dan rekap |

### 9.2 Diagram Alur Urutan (Sequence)

```text
  AUDIENCE            NEXT.JS (Vercel)            SUPABASE (Auth + PG)            GATE STAFF
     |                      |                             |                           |
  [FASE C: KLAIM TIKET]
     |-- klik Klaim -------->|                             |                           |
     |                      |-- cek sesi (JWT) ---------->|                           |
     |                      |-- rpc claim_ticket -------->|                           |
     |                      |                             |-- LOCK ticket_types (FOR UPDATE)
     |                      |                             |-- cek idempotensi, jendela, batas, kuota
     |                      |                             |-- UPDATE quota_claimed
     |                      |                             |-- INSERT ticket_tickets (qr_token)
     |                      |                             |-- COMMIT (kunci dilepas)  |
     |                      |<-- {success, tickets[], remaining}                      |
     |<-- tiket + QR -------|                             |                           |
     |                      |                             |== Realtime: kuota turun ==> Dasbor
  [FASE E: CHECK-IN]
     |-- tunjukkan QR ------------------------------------------------------------>|
     |                      |                             |    kamera + html5-qrcode  |
     |                      |<-- token terdekode (kurang dari 400 ms) ---------------|
     |                      |-- rpc verify_and_checkin -->|                           |
     |                      |                             |-- cek peran staf, gate    |
     |                      |                             |-- LOCK ticket_tickets (FOR UPDATE)
     |                      |                             |-- status ACTIVE -> USED   |
     |                      |                             |-- INSERT checkin_logs     |
     |                      |                             |-- COMMIT                  |
     |                      |<-- {SUCCESS, holder, type} -|                           |
     |                      |-------------------- banner HIJAU ---------------------->|
     |<-- dipersilakan masuk (kurang dari 3 detik total) -----------------------------|
     |                      |                             |== Realtime: check-in +1 => Dasbor
```

### 9.3 Skenario Langkah demi Langkah

#### 9.3.1 Fase A: Persiapan oleh Admin

| Langkah | Aksi | Sistem |
| --- | --- | --- |
| A1 | Admin login dengan Google | Profil dibuat otomatis. Peran awal `audience`, kemudian dinaikkan menjadi `admin` oleh pemilik sistem (pengaturan awal melalui SQL atau seed) |
| A2 | Admin mengisi event, venue, panggung, artis, jadwal | Data disimpan di tabel `catalog_*`. Validasi jadwal bentrok. Entri audit tercipta |
| A3 | Admin membuat kategori tiket (kuota, harga, batas per akun, jendela penjualan) | Baris `ticket_types` dengan `quota_claimed = 0` |
| A4 | Admin membuat gate (Gate A, Gate B) | Baris `attendance_gates` |
| A5 | Admin menetapkan peran `gate_staff` untuk relawan (setelah relawan login sekali) | RPC `shared_admin_set_user_role`, tercatat di audit log |
| A6 | Admin mempublikasikan event | `is_published = true`, halaman publik aktif |

#### 9.3.2 Fase B: Penemuan Informasi oleh Penonton

| Langkah | Aksi | Sistem |
| --- | --- | --- |
| B1 | Penonton membuka situs TERRAFEST (tanpa login) | Next.js merender halaman beranda dari cache (RSC) |
| B2 | Melihat line-up, jadwal, lokasi, dan pengumuman | Data dari EventCatalog melalui Public Service Interface |
| B3 | Melihat kategori tiket dan hitung mundur pembukaan penjualan | Data kategori dari Ticketing. Tombol klaim nonaktif sebelum jendela dibuka |

#### 9.3.3 Fase C: Klaim Tiket saat War Ticket

| Langkah | Aksi | Sistem | Hasil / Kode |
| --- | --- | --- | --- |
| C1 | Penonton menekan Masuk dengan Google | Supabase Auth mengarahkan ke Google, lalu callback `/auth/callback` menukar kode menjadi sesi | Sesi aktif (FR-AUTH-01, 02) |
| C2 | Pada waktu penjualan dibuka, penonton memilih kategori dan menekan Klaim Tiket | Client Component membuat `idempotency_key` unik, lalu memanggil Server Action | Permintaan terkirim |
| C3 | Server Action memvalidasi input dan sesi, memanggil `ticketingService.claimTicket` | Lapisan app tipis, logika di modul | RPC `claim_ticket` dipanggil |
| C4 | PostgreSQL mengunci baris kategori. Permintaan lain pada kategori yang sama antre | Pemeriksaan: autentikasi, jumlah, jendela penjualan, batas per akun, kuota | Salah satu kode di bawah |
| C5a | Semua pemeriksaan lolos | `quota_claimed` bertambah dan tiket diterbitkan dalam satu transaksi | `OK` beserta `qr_token` |
| C5b | Kuota tidak cukup | Tidak ada perubahan data | `SOLD_OUT` |
| C5c | Melebihi batas akun | Tidak ada perubahan data | `LIMIT_REACHED` |
| C5d | Di luar jendela | Tidak ada perubahan data | `SALE_NOT_OPEN` atau `SALE_CLOSED` |
| C6 | Antarmuka menampilkan hasil: sukses (arahkan ke Tiket Saya) atau pesan galat yang ramah | Toast dan state UI | Penonton mendapat kepastian |
| C7 | Sisa kuota pada seluruh klien terbuka diperbarui | Supabase Realtime menyiarkan perubahan `ticket_types` | Angka sisa kuota turun tanpa muat ulang |
| C8 | Bila jaringan terputus dan penonton menekan ulang | Kunci idempotensi sama dikirim ulang | Tiket yang sama dikembalikan, tidak ada duplikasi |

#### 9.3.4 Fase D: Persiapan Hari Acara

| Langkah | Aksi | Sistem |
| --- | --- | --- |
| D1 | Penonton membuka Tiket Saya | RLS membatasi hanya tiket milik sendiri. `qrcode.react` merender QR dari `qr_token` |
| D2 | Penonton menaikkan kecerahan layar dan menyiapkan QR (disarankan membuka halaman sebelum antre) | Halaman ringan dan berfungsi pada koneksi lemah |
| D3 | Gate staff login, memilih gate (misalnya Gate A) pada halaman scan | Middleware memverifikasi peran `gate_staff` atau `admin`. Gate tersimpan di state sesi |
| D4 | Gate staff mengizinkan akses kamera | `html5-qrcode` membuka kamera belakang. Indikator Siap memindai tampil |

#### 9.3.5 Fase E: Check-in di Gate

| Langkah | Aksi | Sistem | Hasil / Banner |
| --- | --- | --- | --- |
| E1 | Penonton menunjukkan QR. Kamera memindai | `html5-qrcode` mendekode token (target kurang dari 400 ms). Debounce mencegah pemrosesan ganda | String token |
| E2 | Klien mengirim token dan `gate_id` ke Route Handler `/api/checkin` | Handler memvalidasi format dan sesi, memanggil `attendanceService.verifyAndCheckin` | RPC dipanggil |
| E3 | RPC memeriksa peran staf dan gate aktif | Bila tidak berwenang, `UNAUTHORIZED` | Banner merah |
| E4 | Token dicari dan baris tiket dikunci (`FOR UPDATE`) melalui `ticket_internal_mark_used` | Scan serentak pada tiket sama diserialisasi |  |
| E5a | Tiket `ACTIVE` | Status menjadi `USED`, `used_at` terisi, log `SUCCESS` dicatat | Banner HIJAU: nama pemegang, kategori. Penonton dipersilakan masuk |
| E5b | Tiket sudah `USED` | Log `ALREADY_USED` dicatat | Banner KUNING: waktu dan info penggunaan sebelumnya. Staf menolak masuk dan merujuk ke koordinator |
| E5c | Tiket `CANCELLED` | Log `CANCELLED` dicatat | Banner MERAH: Tiket dibatalkan |
| E5d | Token tidak ditemukan atau format salah | Log `INVALID_TOKEN` dicatat (hanya hash token) | Banner MERAH: Tiket tidak valid |
| E6 | Banner otomatis tertutup setelah 3 detik atau diketuk, pemindai siap untuk penonton berikutnya | Antrean bergerak | Waktu per penonton kurang dari 3 detik |
| E7 | Check-in baru tersiar ke dasbor | Realtime pada `attendance_checkin_logs` | Jumlah kehadiran bertambah |

#### 9.3.6 Fase F: Pemantauan dan Pasca Acara

| Langkah | Aksi | Sistem |
| --- | --- | --- |
| F1 | Admin membuka dasbor selama acara | Langganan Realtime menampilkan kuota, kehadiran per kategori, dan laju kedatangan per 5 menit |
| F2 | Admin memantau lonjakan `INVALID_TOKEN` atau `ALREADY_USED` | Indikasi percobaan tiket palsu atau penggandaan, dapat ditindaklanjuti oleh tim keamanan |
| F3 | Admin membatalkan tiket bermasalah bila diperlukan | RPC `ticket_admin_cancel_ticket`, kuota dikembalikan, audit log tercipta |
| F4 | Setelah acara, admin mengekspor rekap CSV | Berkas berisi tiket, kategori, status, dan waktu check-in |
| F5 | Penutupan | Penjualan ditutup, akses staf dicabut (peran dikembalikan ke `audience`) |

### 9.4 Skenario Pengecualian dan Penanganan

| Kode | Situasi | Penanganan Sistem | Tindakan Operasional |
| --- | --- | --- | --- |
| EX-01 | Koneksi penonton putus saat klaim | Retry dengan kunci idempotensi yang sama aman | Penonton membuka Tiket Saya untuk memastikan |
| EX-02 | Dua staf memindai tiket sama bersamaan | Satu `SUCCESS`, satu `ALREADY_USED` | Staf kedua menolak masuk |
| EX-03 | Kamera gagal atau QR rusak | Input kode manual (FR-ATT-11) | Staf mengetik kode tiket dari layar penonton |
| EX-04 | Sinyal di gate lemah | Permintaan ringan (satu RPC), indikator memuat, retry otomatis terbatas | Pindah ke Gate cadangan atau hotspot panitia |
| EX-05 | Realtime terputus | Indikator status, fallback polling 5 detik | Admin menyegarkan dasbor |
| EX-06 | Penonton melaporkan tiket sudah terpakai padahal belum masuk | Admin memeriksa log (waktu, gate, staf) | Keputusan kasus per kasus, tiket dapat diganti dengan prosedur panitia |
| EX-07 | Lonjakan trafik berlebih saat war ticket | CDN dan rate limit menyerap lonjakan, antrean pada kunci baris | Pemantauan dan penambahan kapasitas basis data bila perlu |

---

## LAMPIRAN

### Lampiran A: Daftar Kode Hasil RPC

| RPC | Kode | Arti | Pesan Antarmuka (Contoh) |
| --- | --- | --- | --- |
| `claim_ticket` | `OK` | Klaim berhasil | Tiket berhasil diklaim |
| `claim_ticket` | `UNAUTHENTICATED` | Belum login atau akun nonaktif | Silakan masuk terlebih dahulu |
| `claim_ticket` | `INVALID_QUANTITY` | Jumlah di luar rentang | Jumlah tiket harus antara 1 dan 5 |
| `claim_ticket` | `TYPE_NOT_FOUND` | Kategori tidak ada atau nonaktif | Kategori tiket tidak ditemukan |
| `claim_ticket` | `SALE_NOT_OPEN` / `SALE_CLOSED` | Di luar jendela penjualan | Penjualan belum dibuka / sudah ditutup |
| `claim_ticket` | `LIMIT_REACHED` | Melebihi batas per akun | Batas tiket per akun tercapai |
| `claim_ticket` | `SOLD_OUT` | Kuota habis | Kuota tiket habis |
| `verify_and_checkin_ticket` | `SUCCESS` | Check-in berhasil | Silakan masuk |
| `verify_and_checkin_ticket` | `ALREADY_USED` | Tiket telah dipakai | Tiket sudah pernah digunakan |
| `verify_and_checkin_ticket` | `CANCELLED` | Tiket dibatalkan | Tiket telah dibatalkan |
| `verify_and_checkin_ticket` | `INVALID_TOKEN` | Token tidak dikenal | Tiket tidak valid |
| `verify_and_checkin_ticket` | `UNAUTHORIZED` | Bukan staf | Akses ditolak |
| `verify_and_checkin_ticket` | `GATE_NOT_FOUND` | Gate tidak valid | Gate tidak ditemukan |

### Lampiran B: Rencana Rilis (Milestone)

| Milestone | Cakupan | Kriteria Selesai |
| --- | --- | --- |
| M1: Fondasi | Struktur proyek, modul Shared, autentikasi Google, migrasi 0001 | Login Google dan pembuatan profil berfungsi, middleware peran aktif |
| M2: Katalog | Modul EventCatalog, halaman publik, CRUD admin | US-02, US-10 lulus uji penerimaan |
| M3: Ticketing | Kategori tiket, RPC `claim_ticket`, halaman Tiket Saya dan QR | US-03, US-04, US-05 lulus. Uji konkurensi T-01 sampai T-03 lulus |
| M4: Attendance | Pemindai, RPC `verify_and_checkin_ticket`, log, banner hasil | US-06 sampai US-09 lulus. Uji T-04 sampai T-08 lulus |
| M5: Dasbor dan Penguatan | Dasbor real-time, audit, RLS menyeluruh, rate limit, ekspor | US-11 sampai US-14 lulus, audit keamanan RLS selesai |
| M6: Uji Beban dan Gladi | Uji k6, gladi gate dengan relawan, perbaikan | Seluruh target NFR-PERF tercapai, SOP hari acara siap |

### Lampiran C: Risiko Proyek

| ID | Risiko | Probabilitas | Dampak | Mitigasi |
| --- | --- | --- | --- | --- |
| RK-01 | Batas koneksi atau kapasitas database saat war ticket | Sedang | Tinggi | Uji beban dini, pooling koneksi, rate limit, naikkan kapasitas sementara |
| RK-02 | Sinyal buruk di area gate | Tinggi | Tinggi | Permintaan ringan, gate cadangan, hotspot, input manual |
| RK-03 | Kamera ponsel staf tidak kompatibel | Sedang | Sedang | Daftar perangkat uji, input manual, ponsel cadangan |
| RK-04 | Kesalahan konfigurasi RLS | Rendah | Tinggi | Uji otomatis T-06 sampai T-08, review dua orang |
| RK-05 | Keterbatasan waktu tugas LDOP | Tinggi | Sedang | Prioritisasi MoSCoW, rilis bertahap per milestone |
| RK-06 | Penonton membagikan tangkapan layar QR | Sedang | Sedang | Sekali pakai, log, edukasi penonton. QR dinamis pada fase berikutnya |

### Lampiran D: Keputusan Terbuka untuk Dikonfirmasi

| No | Pertanyaan | Asumsi Dokumen Ini |
| --- | --- | --- |
| 1 | Apakah tiket gratis, atau berbayar dengan pembayaran di luar sistem? | Pembayaran di luar cakupan. Kolom `price_idr` disiapkan untuk fase berikutnya |
| 2 | Apakah penjualan dibatasi untuk civitas ITERA (domain email tertentu)? | Terbuka untuk semua akun Google. Pembatasan domain dapat ditambahkan pada `claim_ticket` |
| 3 | Berapa batas tiket per akun? | Default 2 per kategori, dapat dikonfigurasi admin |
| 4 | Berapa kapasitas penonton dan jumlah gate? | Contoh 3.500 tiket dan 2 gate. Disesuaikan dengan data panitia |

--- Akhir Dokumen ---
