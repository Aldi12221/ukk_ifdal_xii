// ===========================================
// FILE: logAktivitas.js (MODEL)
// DESKRIPSI: Semua fungsi untuk mengelola log aktivitas
// ===========================================
const db = require('../db/db');

// ===== GET ALL LOG =====
// Mengambil semua log aktivitas dengan nama user
const getAll = (callback) => {
    const query = `
        SELECT 
            log_aktivitas.*,
            users.nama_lengkap as nama_user,
            users.email as email_user
        FROM log_aktivitas
        LEFT JOIN users ON log_aktivitas.id_user = users.id
        ORDER BY log_aktivitas.created_at DESC
        LIMIT 100
    `;
    db.query(query, callback);
};

// ===== CREATE LOG =====
// Mencatat aktivitas baru
const create = (data, callback) => {
    const { id_user, aksi, tabel_terkait, id_data, keterangan } = data;

    const query = `
        INSERT INTO log_aktivitas (id_user, aksi, tabel_terkait, id_data, keterangan)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [id_user, aksi, tabel_terkait, id_data, keterangan], callback);
};

// ===== DELETE OLD LOGS =====
// Menghapus log yang sudah lama (lebih dari 30 hari)
const deleteOldLogs = (callback) => {
    const query = "DELETE FROM log_aktivitas WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)";
    db.query(query, callback);
};

// Export semua fungsi
module.exports = {
    getAll,
    create,
    deleteOldLogs
};
