// ===========================================
// FILE: peminjamanController.js
// DESKRIPSI: Controller untuk mengelola peminjaman
// ===========================================
const Peminjaman = require('../models/peminjaman');
const Alat = require('../models/alat');
const LogAktivitas = require('../models/logAktivitas');

// ===== GET ALL PEMINJAMAN =====
// Endpoint: GET /api/peminjaman
const getAll = (req, res) => {
    Peminjaman.getAll((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data peminjaman",
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data peminjaman",
            data: results
        });
    });
};

// ===== GET PEMINJAMAN BY ID =====
// Endpoint: GET /api/peminjaman/:id
const getById = (req, res) => {
    const { id } = req.params;

    Peminjaman.getById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data peminjaman",
                error: err.message
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan"
            });
        }
        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};

// ===== GET MY PEMINJAMAN =====
// Endpoint: GET /api/peminjaman/my
// Untuk peminjam melihat riwayat peminjamannya
const getMyPeminjaman = (req, res) => {
    const userId = req.userId;

    Peminjaman.getByUser(userId, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data peminjaman",
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
};

// ===== GET PENDING PEMINJAMAN =====
// Endpoint: GET /api/peminjaman/pending
// Untuk petugas melihat peminjaman yang perlu diapprove
const getPending = (req, res) => {
    Peminjaman.getPending((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data peminjaman pending",
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
};

// ===== GET ACTIVE PEMINJAMAN =====
// Endpoint: GET /api/peminjaman/active
// Untuk melihat peminjaman yang sedang berjalan
const getActive = (req, res) => {
    Peminjaman.getActive((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data peminjaman aktif",
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
};

// ===== CREATE PEMINJAMAN (AJUKAN PEMINJAMAN) =====
// Endpoint: POST /api/peminjaman
const create = (req, res) => {
    const data = req.body;
    data.id_peminjam = req.userId; // ID peminjam dari token

    // Validasi input
    if (!data.id_alat || !data.tanggal_harus_kembali) {
        return res.status(400).json({
            success: false,
            message: "ID alat dan tanggal kembali wajib diisi"
        });
    }

    // Cek ketersediaan alat
    Alat.getById(data.id_alat, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Alat tidak ditemukan"
            });
        }

        const alat = results[0];
        const jumlahPinjam = data.jumlah_pinjam || 1;

        if (alat.jumlah_tersedia < jumlahPinjam) {
            return res.status(400).json({
                success: false,
                message: `Stok tidak cukup. Tersedia: ${alat.jumlah_tersedia}`
            });
        }

        // Buat peminjaman
        Peminjaman.create(data, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengajukan peminjaman",
                    error: err.message
                });
            }

            // Catat log aktivitas
            LogAktivitas.create({
                id_user: req.userId,
                aksi: 'CREATE',
                tabel_terkait: 'peminjaman',
                id_data: results.insertId,
                keterangan: `Pengajuan peminjaman alat: ${alat.nama_alat}`
            }, () => { });

            res.status(201).json({
                success: true,
                message: "Berhasil mengajukan peminjaman. Menunggu persetujuan petugas.",
                data: { id: results.insertId }
            });
        });
    });
};

// ===== APPROVE PEMINJAMAN =====
// Endpoint: PUT /api/peminjaman/:id/approve
const approve = (req, res) => {
    const { id } = req.params;
    const id_petugas = req.userId;

    // Ambil data peminjaman dulu
    Peminjaman.getById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan"
            });
        }

        const peminjaman = results[0];

        if (peminjaman.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Peminjaman ini sudah diproses sebelumnya"
            });
        }

        // Kurangi jumlah tersedia alat
        Alat.updateJumlahTersedia(peminjaman.id_alat, peminjaman.jumlah_pinjam, 'kurang', (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Gagal memperbarui stok alat"
                });
            }

            // Approve peminjaman
            Peminjaman.approve(id, id_petugas, (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Gagal menyetujui peminjaman",
                        error: err.message
                    });
                }

                // Catat log aktivitas
                LogAktivitas.create({
                    id_user: id_petugas,
                    aksi: 'APPROVE',
                    tabel_terkait: 'peminjaman',
                    id_data: id,
                    keterangan: `Peminjaman disetujui: ID ${id}`
                }, () => { });

                res.status(200).json({
                    success: true,
                    message: "Peminjaman berhasil disetujui"
                });
            });
        });
    });
};

// ===== REJECT PEMINJAMAN =====
// Endpoint: PUT /api/peminjaman/:id/reject
const reject = (req, res) => {
    const { id } = req.params;
    const { catatan } = req.body;
    const id_petugas = req.userId;

    Peminjaman.reject(id, id_petugas, catatan, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal menolak peminjaman",
                error: err.message
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan atau sudah diproses"
            });
        }

        // Catat log aktivitas
        LogAktivitas.create({
            id_user: id_petugas,
            aksi: 'REJECT',
            tabel_terkait: 'peminjaman',
            id_data: id,
            keterangan: `Peminjaman ditolak: ID ${id}`
        }, () => { });

        res.status(200).json({
            success: true,
            message: "Peminjaman berhasil ditolak"
        });
    });
};

// ===== DELETE PEMINJAMAN =====
// Endpoint: DELETE /api/peminjaman/:id
// ===== GET RETURN REQUESTS =====
// Endpoint: GET /api/peminjaman/return-requests
// Untuk petugas melihat pengajuan pengembalian
const getReturnRequests = (req, res) => {
    Peminjaman.getAll((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data pengajuan pengembalian",
                error: err.message
            });
        }

        // Filter manual karena Peminjaman.getAll ambil semua
        // Alternatif: buat model function khusus biar lebih efisien
        const returnRequests = results.filter(item => item.status === 'menunggu_pengembalian');

        res.status(200).json({
            success: true,
            data: returnRequests
        });
    });
};

// Modifikasi deletePeminjaman agar tidak bisa hapus yang aktif
const deletePeminjaman = (req, res) => {
    const { id } = req.params;

    Peminjaman.deleteById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal menghapus peminjaman",
                error: err.message
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan"
            });
        }

        // Catat log aktivitas
        LogAktivitas.create({
            id_user: req.userId,
            aksi: 'DELETE',
            tabel_terkait: 'peminjaman',
            id_data: id,
            keterangan: `Peminjaman dihapus: ID ${id}`
        }, () => { });

        res.status(200).json({
            success: true,
            message: "Berhasil menghapus peminjaman"
        });
    });
};

// ===== REQUEST RETURN (AJUKAN PENGEMBALIAN) =====
// Endpoint: PUT /api/peminjaman/:id/request-return
// Untuk peminjam mengajukan pengembalian alat
const requestReturn = (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    // Ambil data peminjaman
    Peminjaman.getById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Peminjaman tidak ditemukan"
            });
        }

        const peminjaman = results[0];

        // Validasi: pastikan ini peminjaman milik user yang request
        if (peminjaman.id_peminjam !== userId) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses ke peminjaman ini"
            });
        }

        // Validasi: hanya status 'dipinjam' yang bisa diajukan pengembalian
        if (peminjaman.status !== 'dipinjam') {
            return res.status(400).json({
                success: false,
                message: "Hanya peminjaman dengan status 'dipinjam' yang bisa dikembalikan"
            });
        }

        // Update status menjadi 'menunggu_pengembalian'
        Peminjaman.updateStatus(id, 'menunggu_pengembalian', (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengajukan pengembalian",
                    error: err.message
                });
            }

            // Catat log aktivitas
            LogAktivitas.create({
                id_user: userId,
                aksi: 'REQUEST_RETURN',
                tabel_terkait: 'peminjaman',
                id_data: id,
                keterangan: `Pengajuan pengembalian alat: ${peminjaman.nama_alat}`
            }, () => { });

            res.status(200).json({
                success: true,
                message: "Pengajuan pengembalian berhasil! Silakan serahkan alat ke petugas."
            });
        });
    });
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    getMyPeminjaman,
    getPending,
    getActive,
    create,
    approve,
    reject,
    deletePeminjaman,
    requestReturn,
    getReturnRequests
};
