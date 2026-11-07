# Pendaftaran akun

## `POST /api/auth/register`

Membuat akun pengguna. Endpoint ini publik dan tidak memerlukan sesi.

### Request

Kirim JSON dengan `Content-Type: application/json`.

| Field | Tipe | Wajib | Aturan |
|---|---|---|---|
| `nama` | string | Ya | Setelah trim tidak boleh kosong; maksimal 100 karakter. |
| `email` | string | Ya | Format email sederhana; spasi luar dihapus dan nilai disimpan huruf kecil. |
| `password` | string | Ya | 8–128 karakter. |

```json
{
  "nama": "Hirzi",
  "email": "hirzi@example.com",
  "password": "contoh123"
}
```

### Respons berhasil

`201 Created`

```json
{ "message": "Akun berhasil dibuat." }
```

Password disimpan sebagai hash. Role awal mengikuti default database, yaitu `USER`.

### Error

| Status | Bentuk respons | Kondisi |
|---|---|---|
| 400 | `{ "message": string }` | JSON tidak valid, nama/email tidak valid, atau password di luar batas. |
| 409 | `{ "message": "Email ini sudah dipakai." }` | Email sudah terdaftar. |
| 503 | `{ "message": string }` | Koneksi database tidak tersedia. |
| 500 | `{ "message": string }` | Kegagalan server saat membuat akun. |
