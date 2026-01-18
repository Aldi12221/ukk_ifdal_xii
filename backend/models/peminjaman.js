// ===========================================
// FILE: peminjaman.js (MODEL)
// DESKRIPSI: Semua fungsi untuk mengelola peminjaman
// ===========================================
const db = require('../db/db');

// ===== GET ALL PEMINJAMAN =====
// Mengambil semua peminjaman dengan detail peminjam dan alat
const getAll = (callback) => {
    const query = `
        SELECT 
            peminjaman.*,
            users.nama_lengkap as nama_peminjam,
            users.email as email_peminjam,
            alat.nama_alat,
            petugas.nama_lengkap as nama_petugas
        FROM peminjaman
        LEFT JOIN users ON peminjaman.id_peminjam = users.id
        LEFT JOIN alat ON peminjaman.id_alat = alat.id
        LEFT JOIN users as petugas ON peminjaman.id_petugas_approval = petugas.id
        ORDER BY peminjaman.id DESC
    `;
    db.query(query, callback);
};

// ===== GET PEMINJAMAN BY ID =====
const getById = (id, callback) => {
    const query = `
        SELECT 
            peminjaman.*,
            users.nama_lengkap as nama_peminjam,
            users.email as email_peminjam,
            alat.nama_alat,
            petugas.nama_lengkap as nama_petugas
        FROM peminjaman
        LEFT JOIN users ON peminjaman.id_peminjam = users.id
        LEFT JOIN alat ON peminjaman.id_alat = alat.id
        LEFT JOIN users as petugas ON peminjaman.id_petugas_approval = petugas.id
        WHERE peminjaman.id = ?
    `;
    db.query(query, [id], callback);
};

// ===== GET PEMINJAMAN BY USER =====
// Untuk peminjam melihat riwayat peminjamannya sendiri
const getByUser = (userId, callback) => {
    const query = `
        SELECT 
            peminjaman.*,
            alat.nama_alat,
            petugas.nama_lengkap as nama_petugas
        FROM peminjaman
        LEFT JOIN alat ON peminjaman.id_alat = alat.id
        LEFT JOIN users as petugas ON peminjaman.id_petugas_approval = petugas.id
        WHERE peminjaman.id_peminjam = ?
        ORDER BY peminjaman.id DESC
    `;
    db.query(query, [userId], callback);
};

// ===== GET PENDING PEMINJAMAN =====
// Untuk petugas melihat peminjaman yang menunggu approval
const getPending = (callback) => {
    const query = `
        SELECT 
            peminjaman.*,
            users.nama_lengkap as nama_peminjam,
            users.email as email_peminjam,
            alat.nama_alat
        FROM peminjaman
        LEFT JOIN users ON peminjaman.id_peminjam = users.id
        LEFT JOIN alat ON peminjaman.id_alat = alat.id
        WHERE peminjaman.status = 'pending'
        ORDER BY peminjaman.tanggal_pinjam ASC
    `;
    db.query(query, callback);
};

// ===== GET ACTIVE PEMINJAMAN =====
// Mengambil peminjaman yang statusnya 'dipinjam' (belum dikembalikan)
const getActive = (callback) => {
    const query = `
        SELECT 
            peminjaman.*,
            users.nama_lengkap as nama_peminjam,
            users.email as email_peminjam,
            alat.nama_alat
        FROM peminjaman
        LEFT JOIN users ON peminjaman.id_peminjam = users.id
        LEFT JOIN alat ON peminjaman.id_alat = alat.id
        WHERE peminjaman.status = 'dipinjam'
        ORDER BY peminjaman.tanggal_harus_kembali ASC
    `;
    db.query(query, callback);
};

// ===== CREATE PEMINJAMAN =====
// Membuat pengajuan peminjaman baru
const create = (data, callback) => {
    const { id_peminjam, id_alat, jumlah_pinjam, tanggal_harus_kembali, catatan } = data;

    if (!id_peminjam || !id_alat || !tanggal_harus_kembali) {
        return callback(new Error("Data peminjaman tidak lengkap"));
    }

    const query = `
        INSERT INTO peminjaman (id_peminjam, id_alat, jumlah_pinjam, tanggal_harus_kembali, catatan, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    db.query(query, [id_peminjam, id_alat, jumlah_pinjam || 1, tanggal_harus_kembali, catatan], callback);
};

// ===== APPROVE PEMINJAMAN =====
// Menyetujui peminjaman (oleh petugas)
const approve = (id, id_petugas, callback) => {
    const query = `
        UPDATE peminjaman 
        SET status = 'dipinjam', id_petugas_approval = ?, tanggal_approval = NOW()
        WHERE id = ? AND status = 'pending'
    `;
    db.query(query, [id_petugas, id], callback);
};

// ===== REJECT PEMINJAMAN =====
// Menolak peminjaman (oleh petugas)
const reject = (id, id_petugas, catatan, callback) => {
    const query = `
        UPDATE peminjaman 
        SET status = 'ditolak', id_petugas_approval = ?, tanggal_approval = NOW(), catatan = ?
        WHERE id = ? AND status = 'pending'
    `;
    db.query(query, [id_petugas, catatan, id], callback);
};

// ===== UPDATE STATUS =====
// Update status peminjaman
const updateStatus = (id, status, callback) => {
    const query = "UPDATE peminjaman SET status = ? WHERE id = ?";
    db.query(query, [status, id], callback);
};

// ===== DELETE PEMINJAMAN =====
const deleteById = (id, callback) => {
    const query = "DELETE FROM peminjaman WHERE id = ?";
    db.query(query, [id], callback);
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    getByUser,
    getPending,
    getActive,
    create,
    approve,
    reject,
    updateStatus,
    deleteById
};
