# Indeks API

Kontrak integrasi FE/BE disimpan per fitur di [`docs/api/`](docs/api/).
Dokumen mengikuti perilaku handler saat ini; endpoint yang masih berupa kerangka
ditandai sebagai direncanakan dan tidak dianggap sudah tersedia.

| Fitur | Method | Endpoint | Role | Kontrak |
|---|---|---|---|---|
| Pendaftaran akun | POST | `/api/auth/register` | Publik | [Pendaftaran akun](docs/api/pendaftaran.md) |
| Daftar lapangan | GET | `/api/lapangan` | Publik; semua status | [Lapangan](docs/api/lapangan.md) |
| Buat lapangan | POST | `/api/lapangan` | ADMIN | [Lapangan](docs/api/lapangan.md) |
| Detail lapangan | GET | `/api/lapangan/:id` | Publik; semua status, lapangan nonaktif hanya untuk dilihat | [Lapangan](docs/api/lapangan.md) |
| Ubah lapangan | PUT, PATCH | `/api/lapangan/:id` | ADMIN | [Lapangan](docs/api/lapangan.md) |
| Hapus lapangan | DELETE | `/api/lapangan/:id` | ADMIN | [Lapangan](docs/api/lapangan.md) |
| Daftar dan buat rating lapangan | GET, POST | `/api/lapangan/:id/ratings` | Publik untuk GET; USER/ADMIN untuk POST | [Rating lapangan](docs/api/rating.md) |
| Detail, ubah, hapus rating | GET, PUT, PATCH, DELETE | `/api/ratings/:id` | Publik untuk GET; pemilik rating untuk perubahan | [Rating lapangan](docs/api/rating.md) |

Daftar rute yang lebih luas ada di [README.md bagian 4](README.md#4-struktur-api).

## Memelihara kontrak

- Gunakan nama file berdasarkan fitur, tanpa tanggal, misalnya `booking.md`.
- Setiap kontrak menjelaskan method, URL, autentikasi, input, tipe field, contoh
  respons, aturan bisnis, dan error yang perlu ditangani konsumen.
- Saat perilaku endpoint berubah, perbarui kontraknya dalam perubahan yang sama.
- Tandai perilaku yang masih direncanakan secara eksplisit. Kontrak menjelaskan
  implementasi yang dirujuk, bukan bukti fitur sudah dirilis atau diuji di produksi.
- Simpan satu acuan kontrak di `docs/api/`; dokumen lain cukup menautkannya.
