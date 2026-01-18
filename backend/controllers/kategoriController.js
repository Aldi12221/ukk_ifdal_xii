// ===========================================
// FILE: kategoriController.js
// DESKRIPSI: Controller untuk mengelola kategori alat
// ===========================================
const Kategori = require('../models/kategori');
const LogAktivitas = require('../models/logAktivitas');

// ===== GET ALL KATEGORI =====
// Endpoint: GET /api/kategori
const getAll = (req, res) => {
    Kategori.getAll((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data kategori",
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data kategori",
            data: results
        });
    });
};

// ===== GET KATEGORI BY ID =====
// Endpoint: GET /api/kategori/:id
const getById = (req, res) => {
    const { id } = req.params;

    Kategori.getById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data kategori",
                error: err.message
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan"
            });
        }
        res.status(200).json({
            success: true,
            data: results[0]
        });
    });
};

// ===== CREATE KATEGORI =====
// Endpoint: POST /api/kategori
const create = (req, res) => {
    const data = req.body;

    // Validasi input
    if (!data.nama_kategori) {
        return res.status(400).json({
            success: false,
            message: "Nama kategori wajib diisi"
        });
    }

    Kategori.create(data, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal menambahkan kategori",
                error: err.message
            });
        }

        // Catat log aktivitas
        LogAktivitas.create({
            id_user: req.userId,
            aksi: 'CREATE',
            tabel_terkait: 'kategori',
            id_data: results.insertId,
            keterangan: `Kategori baru ditambahkan: ${data.nama_kategori}`
        }, () => { });

        res.status(201).json({
            success: true,
            message: "Berhasil menambahkan kategori",
            data: { id: results.insertId }
        });
    });
};

// ===== UPDATE KATEGORI =====
// Endpoint: PUT /api/kategori/:id
const update = (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Validasi input
    if (!data.nama_kategori) {
        return res.status(400).json({
            success: false,
            message: "Nama kategori wajib diisi"
        });
    }

    Kategori.update(id, data, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengupdate kategori",
                error: err.message
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan"
            });
        }

        // Catat log aktivitas
        LogAktivitas.create({
            id_user: req.userId,
            aksi: 'UPDATE',
            tabel_terkait: 'kategori',
            id_data: id,
            keterangan: `Kategori diupdate: ${data.nama_kategori}`
        }, () => { });

        res.status(200).json({
            success: true,
            message: "Berhasil mengupdate kategori"
        });
    });
};

// ===== DELETE KATEGORI =====
// Endpoint: DELETE /api/kategori/:id
const deleteKategori = (req, res) => {
    const { id } = req.params;

    Kategori.deleteById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal menghapus kategori",
                error: err.message
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan"
            });
        }

        // Catat log aktivitas
        LogAktivitas.create({
            id_user: req.userId,
            aksi: 'DELETE',
            tabel_terkait: 'kategori',
            id_data: id,
            keterangan: `Kategori dihapus: ID ${id}`
        }, () => { });

        res.status(200).json({
            success: true,
            message: "Berhasil menghapus kategori"
        });
    });
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteKategori
};
