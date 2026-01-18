// ===========================================
// FILE: pengembalianController.js
// DESKRIPSI: Controller untuk mengelola pengembalian alat
// ===========================================
const Pengembalian = require('../models/pengembalian');
const Peminjaman = require('../models/peminjaman');
const Alat = require('../models/alat');
const LogAktivitas = require('../models/logAktivitas');

// ===== GET ALL PENGEMBALIAN =====
// Endpoint: GET /api/pengembalian
const getAll = (req, res) => {
    Pengembalian.getAll((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data pengembalian",
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data pengembalian",
            data: results
        });
    });
};

// ===== GET PENGEMBALIAN BY ID =====
// Endpoint: GET /api/pengembalian/:id
const getById = (req, res) => {
    const { id } = req.params;

    Pengembalian.getById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data pengembalian",
                error: err.message
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pengembalian tidak ditemukan"
            });
        }
        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};

// ===== CREATE PENGEMBALIAN =====
// Endpoint: POST /api/pengembalian
// Memproses pengembalian alat
const create = (req, res) => {
    const { id_peminjaman, kondisi_alat, catatan } = req.body;
    const id_petugas = req.userId;

    // Validasi input
    if (!id_peminjaman) {
        return res.status(400).json({
            success: false,
            message: "ID peminjaman wajib diisi"
        });
    }

    // Ambil data peminjaman
    Peminjaman.getById(id_peminjaman, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan"
            });
        }

        const peminjaman = results[0];

        // Cek apakah peminjaman statusnya 'dipinjam' atau 'menunggu_pengembalian'
        if (peminjaman.status !== 'dipinjam' && peminjaman.status !== 'menunggu_pengembalian') {
            return res.status(400).json({
                success: false,
                message: "Status peminjaman tidak valid untuk dikembalikan"
            });
        }

        // Data untuk pengembalian
        const dataReturn = {
            id_peminjaman,
            id_petugas,
            kondisi_alat,
            catatan,
            tanggal_harus_kembali: peminjaman.tanggal_harus_kembali
        };

        // Buat record pengembalian
        Pengembalian.create(dataReturn, (err, results) => {
            if (err) {
                // Jika sudah ada pengembalian untuk peminjaman ini
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        success: false,
                        message: "Peminjaman ini sudah dikembalikan"
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: "Gagal memproses pengembalian",
                    error: err.message
                });
            }

            // Update status peminjaman menjadi 'dikembalikan'
            Peminjaman.updateStatus(id_peminjaman, 'dikembalikan', (err) => {
                if (err) console.error("Gagal update status peminjaman:", err);
            });

            // Kembalikan jumlah tersedia alat
            Alat.updateJumlahTersedia(peminjaman.id_alat, peminjaman.jumlah_pinjam, 'tambah', (err) => {
                if (err) console.error("Gagal update jumlah alat:", err);
            });

            // Hitung denda untuk response (dengan kondisi)
            const { terlambat_hari, denda } = Pengembalian.hitungDenda(
                peminjaman.tanggal_harus_kembali,
                new Date(),
                kondisi_alat
            );

            // Catat log aktivitas
            LogAktivitas.create({
                id_user: id_petugas,
                aksi: 'CREATE',
                tabel_terkait: 'pengembalian',
                id_data: results.insertId,
                keterangan: `Pengembalian alat: ${peminjaman.nama_alat}. Denda: Rp ${denda}`
            }, () => { });

            res.status(201).json({
                success: true,
                message: "Berhasil memproses pengembalian",
                data: {
                    id: results.insertId,
                    terlambat_hari,
                    denda,
                    denda_formatted: `Rp ${denda.toLocaleString('id-ID')}`
                }
            });
        });
    });
};

// ===== DELETE PENGEMBALIAN =====
// Endpoint: DELETE /api/pengembalian/:id
const deletePengembalian = (req, res) => {
    const { id } = req.params;

    Pengembalian.deleteById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal menghapus pengembalian",
                error: err.message
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Pengembalian tidak ditemukan"
            });
        }

        // Catat log aktivitas
        LogAktivitas.create({
            id_user: req.userId,
            aksi: 'DELETE',
            tabel_terkait: 'pengembalian',
            id_data: id,
            keterangan: `Pengembalian dihapus: ID ${id}`
        }, () => { });

        res.status(200).json({
            success: true,
            message: "Berhasil menghapus pengembalian"
        });
    });
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    create,
    deletePengembalian
};
