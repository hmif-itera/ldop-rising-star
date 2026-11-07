# Lapangan

Kontrak untuk `/api/lapangan` dan `/api/lapangan/:id`. Route menggunakan runtime
default Node.js untuk mendukung Prisma dan pemrosesan gambar dengan `sharp` sebelum
gambar disimpan di Cloudflare R2.

## Ringkasan

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/lapangan` | Publik; menampilkan lapangan aktif dan nonaktif |
| POST | `/api/lapangan` | ADMIN |
| GET | `/api/lapangan/:id` | Publik; semua status, lapangan nonaktif hanya untuk dilihat |
| PUT | `/api/lapangan/:id` | ADMIN |
| PATCH | `/api/lapangan/:id` | ADMIN |
| DELETE | `/api/lapangan/:id` | ADMIN |

## Model respons

Field `Lapangan` yang muncul di semua respons sukses (kecuali `DELETE`):

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | ID dokumen (ObjectId, 24 karakter hex). |
| `nama` | string | Nama lapangan. |
| `harga` | number | Harga sebagai bilangan bulat. |
| `aktif` | boolean | Status lapangan. Lapangan nonaktif tetap dapat dilihat. |
| `lokasi` | string \| null | Link Google Maps lokasi lapangan (https), atau `null` jika belum diisi. |
| `deskripsi` | string \| null | Deskripsi berbentuk paragraf, atau `null` jika belum diisi. Antarparagraf dipisahkan baris kosong (`\n\n`). |
| `gambar` | string \| null | Key objek gambar di R2, bukan URL publik. |
| `gambarUrl` | string \| null | URL gambar publik, atau `null` jika belum ada gambar. |
| `createdAt` | string | Waktu pembuatan dalam serialisasi JSON tanggal. |

Semua error berbentuk `{ "message": string }`.

## Ketentuan lokasi

Field `lokasi` bersifat opsional dan harus berupa link Google Maps. Link dibaca dengan
parser URL, lalu disimpan dalam bentuk yang sudah dinormalkan (nama host huruf kecil,
karakter khusus di-encode). Maksimal 500 karakter.

| Bentuk link yang diterima | Contoh |
|---|---|
| Link bagikan dari aplikasi Google Maps | `https://maps.app.goo.gl/AbCdEf123456` |
| Link `google.com/maps` (juga `google.co.id`) | `https://www.google.com/maps/place/Kampus+ITERA/@-5.36,105.31,17z` |
| Link pencarian koordinat | `https://www.google.com/maps?q=-5.36,105.31` |
| Link `maps.google.com` | `https://maps.google.com/?q=itera` |
| Link pendek lama | `https://goo.gl/maps/AbCdEf` |

Nilai berikut ditolak dengan 400: protokol selain `https`, domain selain di atas
(termasuk subdomain palsu seperti `google.com.contoh.com`), link yang memuat
username/password atau port, link `google.com` di luar path `/maps`, serta teks yang
bukan URL (misalnya nama tempat). Nilai kosong disimpan sebagai `null`.

Karena nilainya sudah divalidasi, konsumen dapat memakainya langsung sebagai `href`:

```tsx
<a href={lapangan.lokasi} target="_blank" rel="noopener noreferrer">Lihat di Google Maps</a>
```

## Ketentuan deskripsi

Field `deskripsi` bersifat opsional, berbentuk paragraf, dan maksimal 2000 karakter
(dihitung setelah dirapikan). Sebelum disimpan, `\r\n` diubah menjadi `\n`, tiga baris
baru atau lebih dirapatkan menjadi satu baris kosong, lalu teks di-trim. Baris baru
tunggal dan baris kosong antarparagraf dipertahankan. Teks yang kosong setelah
dirapikan disimpan sebagai `null`.

Konsumen yang menampilkan `deskripsi` perlu mempertahankan baris baru, misalnya dengan
`white-space: pre-line` atau memecah teks menjadi paragraf berdasarkan `\n\n`.

## Ketentuan gambar

Berlaku untuk field `gambar` di `POST`, `PUT`, dan `PATCH`.

| Aturan | Nilai |
|---|---|
| Ukuran maksimal | 2 MB |
| MIME yang diterima | `image/jpeg`, `image/png`, `image/webp` |
| Validasi isi file | Isi file dibaca oleh `sharp`; file yang bukan gambar asli ditolak meski MIME-nya benar. |
| Hasil penyimpanan | Dipotong ke rasio 16:9 (1600×900), diputar sesuai orientasi EXIF, dikonversi ke WebP kualitas 80. |
| Nama objek | `lapangan/<uuid>.webp`, dibuat server. Nama file asli tidak dipakai. |

Database hanya menyimpan key (`gambar`). `gambarUrl` dibangun dari `R2_PUBLIC_URL`,
jadi domain CDN dapat diganti tanpa migrasi data. Gambar yang diganti atau dihapus,
termasuk saat lapangan dihapus, ikut dihapus dari R2.

## `GET /api/lapangan`

Publik; tidak memerlukan sesi. Mengembalikan semua lapangan, aktif maupun nonaktif,
terbaru lebih dahulu. Konsumen API dapat menggunakan field `aktif` untuk membedakan
lapangan yang tersedia dari lapangan yang hanya dapat dilihat.

`200 OK`

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "nama": "Lapangan ITERA",
    "harga": 200000,
    "aktif": true,
    "lokasi": "https://maps.app.goo.gl/AbCdEf123456",
    "deskripsi": "Lapangan futsal indoor dengan lantai sintetis.\n\nTersedia ruang ganti dan area parkir.",
    "gambar": "lapangan/6d8262a4-4da3-4d79-a7f3-93491ab317fa.webp",
    "gambarUrl": "https://cdn.example.com/lapangan/6d8262a4-4da3-4d79-a7f3-93491ab317fa.webp",
    "createdAt": "2026-10-26T10:00:00.000Z"
  }
]
```

Lapangan yang dibuat sebelum field `lokasi` dan `deskripsi` ditambahkan mengembalikan
`null` untuk keduanya. Nilai `lokasi` lama yang bukan link Google Maps (jika ada) tetap
terbaca apa adanya sampai lapangan itu diperbarui dengan link yang valid.

## `POST /api/lapangan`

Memerlukan sesi role `ADMIN`. Request harus berupa `multipart/form-data`.
Jangan mengisi header `Content-Type` secara manual dari browser; biarkan browser
menambahkan boundary.

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| `nama` | string | Ya | Setelah trim, 3–100 karakter. |
| `harga` | string angka | Ya | Harus dapat diparse sebagai bilangan bulat lebih dari 0. |
| `lokasi` | string | Tidak | Link Google Maps (https), maksimal 500 karakter. Lihat [Ketentuan lokasi](#ketentuan-lokasi). |
| `deskripsi` | string | Tidak | Paragraf, maksimal 2000 karakter. Lihat [Ketentuan deskripsi](#ketentuan-deskripsi). |
| `aktif` | string | Tidak | Nilai tepat `false` membuat status nonaktif; selain itu aktif. |
| `gambar` | file | Tidak | Lihat [Ketentuan gambar](#ketentuan-gambar). |

`201 Created`; objek lapangan hasil penyimpanan dengan `gambarUrl`.

| Status | Kondisi |
|---|---|
| 400 | Body bukan multipart, nama/harga tidak valid, `lokasi` bukan link Google Maps yang valid, `deskripsi` lebih dari 2000 karakter, atau file bukan gambar yang valid. |
| 401 | Belum masuk. |
| 403 | Role bukan `ADMIN`. |
| 413 | Gambar lebih besar dari 2 MB. |
| 415 | MIME gambar tidak didukung. |
| 500 | Gagal menyimpan data lapangan. Gambar yang sempat terunggah dihapus kembali. |
| 502 | Gagal mengunggah gambar ke penyimpanan objek. |

Validasi field teks dijalankan sebelum gambar diunggah, sehingga request yang
ditolak tidak meninggalkan file di R2.

## `GET /api/lapangan/:id`

Publik; tidak memerlukan sesi. Detail lapangan tetap dapat dilihat meski statusnya
nonaktif. Lapangan nonaktif bersifat hanya untuk dilihat oleh konsumen publik.

`200 OK`; objek lapangan dengan `gambarUrl`.

| Status | Kondisi |
|---|---|
| 404 | ID bukan ObjectId yang valid atau lapangan tidak ada. |

## `PUT /api/lapangan/:id` dan `PATCH /api/lapangan/:id`

Memerlukan sesi role `ADMIN`. Request harus berupa `multipart/form-data`.

- `PUT` mengganti data teks secara penuh: `nama` dan `harga` wajib. `aktif` yang
  tidak dikirim dianggap `true`, sedangkan `lokasi` dan `deskripsi` yang tidak
  dikirim dikosongkan menjadi `null`.
- `PATCH` bersifat parsial: hanya field yang dikirim yang diubah. Request tanpa satu
  pun perubahan ditolak dengan 400. Untuk mengosongkan `lokasi` atau `deskripsi`,
  kirim field tersebut dengan nilai kosong.

| Field | Tipe | Aturan |
|---|---|---|
| `nama` | string | Sama seperti `POST`. Wajib pada `PUT`. |
| `harga` | string angka | Sama seperti `POST`. Wajib pada `PUT`. |
| `lokasi` | string | Sama seperti `POST`. Nilai kosong menghapus lokasi. |
| `deskripsi` | string | Sama seperti `POST`. Nilai kosong menghapus deskripsi. |
| `aktif` | string | Nilai tepat `false` menonaktifkan; selain itu mengaktifkan. |
| `gambar` | file | Mengganti gambar. Lihat [Ketentuan gambar](#ketentuan-gambar). |
| `hapusGambar` | string | Nilai tepat `true` menghapus gambar. Diabaikan jika `gambar` juga dikirim. |

Jika `gambar` dan `hapusGambar` sama-sama tidak dikirim, gambar tidak berubah (berlaku
juga untuk `PUT`). Gambar lama dihapus dari R2 hanya setelah data baru berhasil
tersimpan.

`200 OK`; objek lapangan hasil perubahan dengan `gambarUrl`.

| Status | Kondisi |
|---|---|
| 400 | Body bukan multipart, nama/harga tidak valid, `lokasi` bukan link Google Maps yang valid, `deskripsi` melebihi batas, file bukan gambar valid, atau (`PATCH`) tidak ada perubahan. |
| 401 / 403 | Belum masuk / role bukan `ADMIN`. |
| 404 | ID tidak valid atau lapangan tidak ada. |
| 413 / 415 | Gambar terlalu besar / MIME tidak didukung. |
| 500 | Gagal menyimpan perubahan. Gambar baru yang sempat terunggah dihapus kembali. |
| 502 | Gagal mengunggah gambar ke penyimpanan objek. |

## `DELETE /api/lapangan/:id`

Memerlukan sesi role `ADMIN`. Menghapus lapangan beserta gambarnya.

`200 OK`

```json
{ "message": "Lapangan dihapus." }
```

| Status | Kondisi |
|---|---|
| 401 / 403 | Belum masuk / role bukan `ADMIN`. |
| 404 | ID tidak valid atau lapangan tidak ada. |
| 409 | Lapangan sudah memiliki booking. Gunakan `PATCH` dengan `aktif=false` sebagai gantinya. |
| 500 | Gagal menghapus lapangan. |