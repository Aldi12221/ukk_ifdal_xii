// ===========================================
// FILE: kategori.js (MODEL)
// DESKRIPSI: Semua fungsi untuk mengelola kategori alat
// ===========================================
const db = require('../db/db');

// ===== GET ALL KATEGORI =====
// Mengambil semua kategori
const getAll = (callback) => {
    const query = "SELECT * FROM kategori ORDER BY id DESC";
    db.query(query, callback);
};

// ===== GET KATEGORI BY ID =====
// Mengambil satu kategori berdasarkan ID
const getById = (id, callback) => {
    const query = "SELECT * FROM kategori WHERE id = ?";
    db.query(query, [id], callback);
};

// ===== CREATE KATEGORI =====
// Membuat kategori baru
const create = (data, callback) => {
    const { nama_kategori, deskripsi } = data;

    if (!nama_kategori) {
        return callback(new Error("Nama kategori wajib diisi"));
    }

    const query = "INSERT INTO kategori (nama_kategori, deskripsi) VALUES (?, ?)";
    db.query(query, [nama_kategori, deskripsi || null], callback);
};

// ===== UPDATE KATEGORI =====
// Mengupdate kategori berdasarkan ID
const update = (id, data, callback) => {
    const { nama_kategori, deskripsi } = data;

    const query = "UPDATE kategori SET nama_kategori = ?, deskripsi = ? WHERE id = ?";
    db.query(query, [nama_kategori, deskripsi, id], callback);
};

// ===== DELETE KATEGORI =====
// Menghapus kategori berdasarkan ID
const deleteById = (id, callback) => {
    const query = "DELETE FROM kategori WHERE id = ?";
    db.query(query, [id], callback);
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteById
};
