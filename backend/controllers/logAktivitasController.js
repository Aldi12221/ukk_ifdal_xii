// ===========================================
// FILE: logAktivitasController.js
// DESKRIPSI: Controller untuk mengelola log aktivitas
// ===========================================
const LogAktivitas = require('../models/logAktivitas');

// ===== GET ALL LOG AKTIVITAS =====
// Endpoint: GET /api/log-aktivitas
// Hanya bisa diakses oleh Admin
const getAll = (req, res) => {
    LogAktivitas.getAll((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil log aktivitas",
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil log aktivitas",
            data: results
        });
    });
};

// Export fungsi
module.exports = {
    getAll
};
