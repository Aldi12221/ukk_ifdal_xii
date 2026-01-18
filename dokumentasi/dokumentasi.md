# DOKUMENTASI APLIKASI PEMINJAMAN ALAT
## UKK Rekayasa Perangkat Lunak 2025/2026

---

## 1. DESKRIPSI PROGRAM

### 1.1 Gambaran Umum
Aplikasi Peminjaman Alat adalah sistem informasi berbasis web yang digunakan untuk mengelola peminjaman dan pengembalian alat/peralatan. Sistem ini memiliki 3 level pengguna dengan hak akses berbeda.

### 1.2 Teknologi yang Digunakan
- **Backend**: Node.js + Express.js
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)

### 1.3 Level Pengguna dan Hak Akses

| Fitur | Admin | Petugas | Peminjam |
|-------|:-----:|:-------:|:--------:|
| Login/Logout | ✓ | ✓ | ✓ |
| CRUD User | ✓ | - | - |
| CRUD Alat | ✓ | - | - |
| CRUD Kategori | ✓ | - | - |
| CRUD Peminjaman | ✓ | - | - |
| CRUD Pengembalian | ✓ | - | ✓ |
| Log Aktivitas | ✓ | - | - |
| Menyetujui Peminjaman | - | ✓ | - |
| Memantau Pengembalian | - | ✓ | - |
| Mencetak Laporan | - | ✓ | - |
| Melihat Daftar Alat | - | - | ✓ |
| Mengajukan Peminjaman | - | - | ✓ |
| Mengembalikan Alat | - | ✓ | ✓ |

---

## 2. ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   ROLES     │       │   USERS     │       │  KATEGORI   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──────<│ id (PK)     │       │ id (PK)     │
│ role        │       │ username    │       │ nama_kategori│
└─────────────┘       │ email       │       │ deskripsi   │
                      │ password    │       └──────┬──────┘
                      │ nama_lengkap│              │
                      │ alamat      │              │
                      │ role_id (FK)│              │
                      └──────┬──────┘              │
                             │                     │
            ┌────────────────┼─────────────────────┤
            │                │                     │
            ▼                ▼                     ▼
┌─────────────────┐   ┌─────────────┐      ┌─────────────┐
│   PEMINJAMAN    │   │LOG_AKTIVITAS│      │    ALAT     │
├─────────────────┤   ├─────────────┤      ├─────────────┤
│ id (PK)         │   │ id (PK)     │      │ id (PK)     │
│ id_peminjam (FK)│   │ id_user (FK)│      │ nama_alat   │
│ id_alat (FK)    │──<│ aksi        │      │ deskripsi   │
│ jumlah_pinjam   │   │ tabel_terkait│     │ gambar      │
│ tanggal_pinjam  │   │ keterangan  │      │ jumlah      │
│ tanggal_kembali │   └─────────────┘      │ jumlah_tersedia│
│ status          │                        │ kategori_id (FK)│
│ id_petugas (FK) │                        │ kondisi     │
└────────┬────────┘                        └─────────────┘
         │
         ▼
┌─────────────────┐
│  PENGEMBALIAN   │
├─────────────────┤
│ id (PK)         │
│ id_peminjaman(FK)│
│ id_petugas (FK) │
│ tanggal_kembali │
│ kondisi_alat    │
│ terlambat_hari  │
│ denda           │
└─────────────────┘
```

### Relasi Antar Tabel:
1. **roles** 1 → N **users**: Satu role memiliki banyak user
2. **users** 1 → N **peminjaman**: Satu user (peminjam) memiliki banyak peminjaman
3. **kategori** 1 → N **alat**: Satu kategori memiliki banyak alat
4. **alat** 1 → N **peminjaman**: Satu alat bisa dipinjam berkali-kali
5. **peminjaman** 1 → 1 **pengembalian**: Satu peminjaman memiliki satu pengembalian
6. **users** 1 → N **log_aktivitas**: Satu user memiliki banyak log aktivitas

---

## 3. FLOWCHART / PSEUDOCODE

### 3.1 Proses Login

```
MULAI
│
├── INPUT email, password
│
├── QUERY user dari database WHERE email = input_email
│
├── IF user tidak ditemukan THEN
│   └── TAMPILKAN "Email tidak terdaftar"
│   └── KEMBALI ke form login
│
├── IF password tidak cocok THEN
│   └── TAMPILKAN "Password salah"
│   └── KEMBALI ke form login
│
├── BUAT token JWT dengan user.id dan user.role_id
│
├── SIMPAN token ke localStorage
│
├── IF role_id = 1 THEN
│   └── REDIRECT ke /admin
├── ELSE IF role_id = 2 THEN
│   └── REDIRECT ke /petugas
├── ELSE
│   └── REDIRECT ke /peminjam
│
SELESAI
```

### 3.2 Proses Peminjaman Alat

```
MULAI
│
├── [PEMINJAM] Pilih alat yang tersedia
│
├── INPUT jumlah_pinjam, tanggal_kembali
│
├── VALIDASI: jumlah_pinjam <= jumlah_tersedia?
│   ├── IF TIDAK THEN
│   │   └── TAMPILKAN "Stok tidak cukup"
│   │   └── KEMBALI ke form
│
├── INSERT ke tabel peminjaman dengan status = 'pending'
│
├── TAMPILKAN "Pengajuan berhasil, menunggu persetujuan"
│
├── [PETUGAS] Lihat daftar peminjaman pending
│
├── PILIH: Setujui atau Tolak?
│   │
│   ├── IF SETUJUI THEN
│   │   ├── UPDATE peminjaman SET status = 'dipinjam'
│   │   ├── UPDATE alat SET jumlah_tersedia = jumlah_tersedia - jumlah_pinjam
│   │   └── CATAT log aktivitas
│   │
│   └── IF TOLAK THEN
│       ├── UPDATE peminjaman SET status = 'ditolak'
│       └── CATAT alasan penolakan
│
SELESAI
```

### 3.3 Proses Pengembalian Alat dan Perhitungan Denda

```
MULAI
│
├── [PETUGAS] Pilih peminjaman yang akan dikembalikan
│
├── AMBIL data peminjaman (tanggal_harus_kembali)
│
├── HITUNG keterlambatan:
│   └── terlambat_hari = MAX(0, HARI_INI - tanggal_harus_kembali)
│
├── HITUNG denda:
│   └── denda = terlambat_hari × Rp 5.000
│
├── INPUT kondisi_alat (baik/rusak_ringan/rusak_berat)
│
├── START TRANSACTION
│   │
│   ├── INSERT ke tabel pengembalian
│   │   (id_peminjaman, id_petugas, kondisi_alat, terlambat_hari, denda)
│   │
│   ├── UPDATE peminjaman SET status = 'dikembalikan'
│   │
│   ├── UPDATE alat SET jumlah_tersedia = jumlah_tersedia + jumlah_pinjam
│   │
│   └── CATAT log aktivitas
│
├── COMMIT TRANSACTION
│
├── TAMPILKAN info pengembalian:
│   ├── "Pengembalian berhasil"
│   ├── IF terlambat > 0 THEN
│   │   └── "Terlambat X hari, Denda: Rp Y"
│
SELESAI
```

### 3.3 Proses Pengembalian Alat (Oleh Peminjam)

```
MULAI
│
├── [PEMINJAM] Buka Riwayat Peminjaman
│
├── PILIH Peminjaman yang berstatus 'dipinjam'
│
├── KLIK tombol "Ajukan Pengembalian"
│
├── SISTEM update status peminjaman menjadi 'menunggu_pengembalian'
│
├── TAMPILKAN "Pengajuan berhasil, silakan serahkan alat ke petugas"
│
SELESAI
```

### 3.4 Proses Verifikasi Pengembalian dan Denda (Oleh Petugas)

```
MULAI
│
├── [PETUGAS] Lihat menu "Pengajuan Pengembalian" di Dashboard
│
├── PILIH pengajuan pengembalian yang masuk
│
├── VALIDASI kondisi fisik alat:
│   ├── Baik
│   ├── Rusak Ringan (+Rp 20.000)
│   └── Rusak Berat (+Rp 50.000)
│
├── HITUNG keterlambatan:
│   └── terlambat_hari = MAX(0, HARI_INI - tanggal_harus_kembali)
│
├── HITUNG denda total:
│   ├── denda_terlambat = terlambat_hari × Rp 5.000
│   └── total_denda = denda_terlambat + denda_kerusakan
│
├── INPUT kondisi_alat, denda_tambahan(opsional), dan catatan
│
├── KONFIRMASI (Klik "Proses")
│
├── START TRANSACTION
│   │
│   ├── INSERT ke tabel pengembalian
│   │   (id_peminjaman, id_petugas, kondisi_alat, terlambat_hari, denda)
│   │
│   ├── UPDATE peminjaman SET status = 'dikembalikan'
│   │
│   ├── UPDATE alat SET jumlah_tersedia = jumlah_tersedia + jumlah_pinjam
│   │
│   └── CATAT log aktivitas
│
├── COMMIT TRANSACTION
│
├── TAMPILKAN info pengembalian & total denda
│
SELESAI
```
```

---

## 4. DOKUMENTASI MODUL

### 4.1 Modul User (Admin)

| Aspek | Keterangan |
|-------|------------|
| **Input** | username, email, password, nama_lengkap, alamat, role_id |
| **Proses** | Validasi email unik, hash password dengan bcrypt, simpan ke database |
| **Output** | Data user tersimpan, response JSON success/error |

**Fungsi Utama:**
- `getAll()` - Mengambil semua user
- `getById(id)` - Mengambil user berdasarkan ID
- `create(data)` - Membuat user baru
- `update(id, data)` - Mengupdate user
- `deleteById(id)` - Menghapus user

### 4.2 Modul Kategori (Admin)

| Aspek | Keterangan |
|-------|------------|
| **Input** | nama_kategori, deskripsi |
| **Proses** | Validasi nama tidak kosong, simpan ke database |
| **Output** | Data kategori tersimpan |

### 4.3 Modul Alat (Admin)

| Aspek | Keterangan |
|-------|------------|
| **Input** | nama_alat, deskripsi, gambar, jumlah, kategori_id, kondisi |
| **Proses** | Validasi input, upload gambar (multer), set jumlah_tersedia = jumlah, simpan |
| **Output** | Data alat tersimpan dengan gambar dan stok otomatis |

### 4.4 Modul Peminjaman

| Aspek | Keterangan |
|-------|------------|
| **Input** | id_alat, jumlah_pinjam, tanggal_harus_kembali, catatan |
| **Proses** | Cek ketersediaan, buat peminjaman status pending. (Peminjam juga bisa mengajukan return via tombol 'Ajukan Pengembalian') |
| **Output** | Peminjaman tercatat, menunggu approval (atau status berubah jadi menunggu_pengembalian) |

### 4.5 Modul Pengembalian

| Aspek | Keterangan |
|-------|------------|
| **Input** | id_peminjaman, kondisi_alat (baik/rusak_ringan/rusak_berat), catatan |
| **Proses** | Hitung denda (keterlambatan + kerusakan), update stok alat tambah, catat pengembalian |
| **Output** | Pengembalian tercatat, denda dihitung otomatis, stok kembali |

---

## 5. SKENARIO PENGUJIAN

| No | Kasus Uji | Langkah | Hasil yang Diharapkan | Status |
|----|-----------|---------|----------------------|--------|
| 1 | Login dengan kredensial salah | Masukkan email/password salah | Gagal login, muncul pesan "Password salah" atau "Email tidak terdaftar" | ⬜ |
| 2 | Tambah alat baru | Admin login → Kelola Alat → Tambah Alat → Isi form → Simpan | Alat tersimpan, muncul di daftar | ⬜ |
| 3 | Ajukan peminjaman | Peminjam login → Ajukan Peminjaman → Pilih alat → Submit | Peminjaman tercatat dengan status "pending" | ⬜ |
| 4 | Proses pengembalian dengan denda | Petugas login → Proses Pengembalian → Pilih peminjaman terlambat | Denda terhitung otomatis berdasarkan hari keterlambatan | ⬜ |
| 5 | Cek privilege user | Peminjam coba akses /admin | Ditolak, redirect ke dashboard peminjam | ⬜ |

---

## 6. STRUKTUR FOLDER PROYEK

```
ukk_ifdal/
├── backend/
│   ├── controllers/          # Logic bisnis
│   │   ├── userController.js
│   │   ├── kategoriController.js
│   │   ├── alatController.js
│   │   ├── peminjamanController.js
│   │   ├── pengembalianController.js
│   │   └── logAktivitasController.js
│   ├── models/              # Akses database
│   │   ├── user.js
│   │   ├── kategori.js
│   │   ├── alat.js
│   │   ├── peminjaman.js
│   │   ├── pengembalian.js
│   │   └── logAktivitas.js
│   ├── middleware/          # Middleware
│   │   └── authMiddleware.js
│   ├── routes/              # Routing API
│   │   └── routes.js
│   ├── db/                  # Koneksi database
│   │   └── db.js
│   ├── app.js              # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Komponen reusable
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Halaman per role
│   │   │   ├── admin/
│   │   │   ├── petugas/
│   │   │   └── peminjam/
│   │   ├── services/       # API service
│   │   └── App.jsx         # Main component
│   └── package.json
│
├── database/
│   └── ukk_ifdal.sql       # Database export
│
└── dokumentasi/
    └── dokumentasi.md      # Dokumentasi lengkap
```

---

## 7. CARA MENJALANKAN APLIKASI

### 7.1 Persiapan
1. Pastikan MySQL/XAMPP sudah berjalan
2. Import `database/ukk_ifdal.sql` ke MySQL

### 7.2 Menjalankan Backend
```bash
cd backend
npm install
npm run dev
```
Server berjalan di: http://localhost:3000

### 7.3 Menjalankan Frontend
```bash
cd frontend
npm install
npm run dev
```
Aplikasi berjalan di: http://localhost:5173

### 7.4 Akun Default
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Petugas | petugas@example.com | password |
| Peminjam | peminjam@example.com | password |

---

**Dibuat oleh:** [Nama Siswa]  
**Tanggal:** Januari 2026  
**Sekolah:** SMK [Nama Sekolah]
