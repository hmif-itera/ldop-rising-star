# Rating lapangan

API rating mengizinkan pengguna yang masuk memberi nilai dan komentar pada lapangan.
Satu pengguna dapat memiliki satu rating per lapangan; rating itu dapat diubah atau
hapus oleh pemiliknya. Daftar dan detail rating dapat dibaca tanpa login.

## Model `Rating`

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | ID dokumen MongoDB (ObjectId 24 karakter hex). |
| `lapanganId` | string | ID lapangan yang dinilai. |
| `userId` | string | ID pengguna pemberi rating. |
| `rating` | number | Nilai 0 sampai 5, termasuk pecahan. |
| `komentar` | string \| null | Komentar opsional, maksimal 2000 karakter. |
| `createdAt` | string | Waktu pembuatan. |
| `updatedAt` | string | Waktu perubahan terakhir. |

Respons daftar dan detail juga menyertakan `user.nama` dan `user.foto` (tanpa data
akun sensitif).

Semua error berbentuk `{ "message": string }`.

## `GET /api/lapangan/:id/ratings`

Publik. Mengembalikan daftar terbaru lebih dahulu, rata-rata rating, dan jumlah rating.

`200 OK`

```json
{
  "lapanganId": "507f1f77bcf86cd799439011",
  "rataRata": 4.5,
  "jumlah": 2,
  "ratings": [
    {
      "id": "507f191e810c19729de860ea",
      "lapanganId": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860eb",
      "rating": 5,
      "komentar": "Lapangan bersih dan nyaman.",
      "createdAt": "2026-11-06T10:00:00.000Z",
      "updatedAt": "2026-11-06T10:00:00.000Z",
      "user": { "nama": "Ayu", "foto": null }
    }
  ]
}
```

| Status | Kondisi |
|---|---|
| 404 | ID tidak valid atau lapangan tidak ada. |
| 500 | Gagal memuat rating. |

## `POST /api/lapangan/:id/ratings`

Memerlukan sesi role `USER` atau `ADMIN`. Body JSON:

```json
{ "rating": 4.5, "komentar": "Lapangan bersih dan nyaman." }
```

`rating` wajib berupa angka 0 sampai 5. `komentar` opsional; kirim string kosong
atau `null` untuk menyimpan tanpa komentar. Komentar dibatasi 2000 karakter.

`201 Created`; objek rating yang dibuat.

| Status | Kondisi |
|---|---|
| 400 | JSON tidak valid, rating di luar rentang, atau komentar tidak valid. |
| 401 / 403 | Belum masuk / role tidak diizinkan. |
| 404 | Lapangan tidak ditemukan. |
| 409 | Pengguna sudah memberi rating pada lapangan tersebut. Gunakan `PATCH` untuk mengubahnya. |
| 500 | Gagal menyimpan rating. |

## `GET /api/ratings/:id`

Publik; mengembalikan objek rating beserta `user.nama` dan `user.foto`.

| Status | Kondisi |
|---|---|
| 404 | ID tidak valid atau rating tidak ada. |
| 500 | Gagal memuat rating. |

## `PUT /api/ratings/:id` dan `PATCH /api/ratings/:id`

Memerlukan sesi `USER` atau `ADMIN` dan hanya pemilik rating yang dapat mengubahnya.

- `PUT` mengganti rating dan komentar. `rating` wajib; jika `komentar` tidak dikirim,
  nilainya dikosongkan menjadi `null`.
- `PATCH` memperbarui hanya field yang dikirim. Kirim `komentar: null` atau string
  kosong untuk menghapus komentar.

Body menggunakan field yang sama dengan `POST`. Respons sukses `200 OK` berisi objek
rating terbaru.

| Status | Kondisi |
|---|---|
| 400 | JSON atau field tidak valid; `PATCH` tanpa perubahan. |
| 401 / 403 | Belum masuk / bukan pemilik rating. |
| 404 | ID tidak valid atau rating tidak ditemukan. |
| 500 | Gagal menyimpan perubahan. |

## `DELETE /api/ratings/:id`

Memerlukan sesi `USER` atau `ADMIN` dan hanya pemilik rating yang dapat menghapusnya.

`200 OK`

```json
{ "message": "Rating berhasil dihapus." }
```

| Status | Kondisi |
|---|---|
| 401 / 403 | Belum masuk / bukan pemilik rating. |
| 404 | ID tidak valid atau rating tidak ditemukan. |
| 500 | Gagal menghapus rating. |
