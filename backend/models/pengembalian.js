// ===========================================
// FILE: pengembalian.js (MODEL)
// DESKRIPSI: Semua fungsi untuk mengelola pengembalian
// ===========================================
const db = require('../db/db');

// Konstanta denda per hari (dalam rupiah)
const DENDA_PER_HARI = 5000;

// ===== GET ALL PENGEMBALIAN =====
const getAll = (callback) => {
    const query = `
        SELECT 
            pengembalian.*,
            peminjaman.id_peminjam,
            peminjaman.tanggal_pinjam,
            peminjaman.tanggal_harus_kembali,
            users.nama_lengkap as nama_peminjam,
            alat.nama_alat,
            petugas.nama_lengkap as nama_petugas
        FROM pengembalian
        LEFT JOIN peminjaman ON pengembalian.id_peminjaman = peminjaman.id
        LEFT JOIN users ON peminjaman.id_peminjam = users.id
        LEFT JOIN alat ON peminjaman.id_alat = alat.id
        LEFT JOIN users as petugas ON pengembalian.id_petugas = petugas.id
        ORDER BY pengembalian.id DESC
    `;
    db.query(query, callback);
};

// ===== GET PENGEMBALIAN BY ID =====
const getById = (id, callback) => {
    const query = `
        SELECT 
            pengembalian.*,
            peminjaman.id_peminjam,
            peminjaman.tanggal_pinjam,
            peminjaman.tanggal_harus_kembali,
            users.nama_lengkap as nama_peminjam,
            alat.nama_alat
        FROM pengembalian
        LEFT JOIN peminjaman ON pengembalian.id_peminjaman = peminjaman.id
        LEFT JOIN users ON peminjaman.id_peminjam = users.id
        LEFT JOIN alat ON peminjaman.id_alat = alat.id
        WHERE pengembalian.id = ?
    `;
    db.query(query, [id], callback);
};

// ===== HITUNG DENDA =====
// Fungsi untuk menghitung denda keterlambatan dan kerusakan
const hitungDenda = (tanggalHarusKembali, tanggalKembali, kondisi = 'baik') => {
    const harusKembali = new Date(tanggalHarusKembali);
    const kembali = new Date(tanggalKembali);

    // Hitung selisih hari
    const selisih = Math.floor((kembali - harusKembali) / (1000 * 60 * 60 * 24));

    // Denda keterlambatan
    let dendaTerlambat = 0;
    if (selisih > 0) {
        dendaTerlambat = selisih * DENDA_PER_HARI;
    } else {
        // Jika tidak terlambat
        selisih = 0;
    }

    // Denda kerusakan
    let dendaKerusakan = 0;
    if (kondisi === 'rusak_ringan') {
        dendaKerusakan = 20000; // Contoh denda rusak ringan
    } else if (kondisi === 'rusak_berat') {
        dendaKerusakan = 50000; // Contoh denda rusak berat
    }

    return {
        terlambat_hari: selisih > 0 ? selisih : 0,
        denda: dendaTerlambat + dendaKerusakan,
        rincian: {
            denda_terlambat: dendaTerlambat,
            denda_kerusakan: dendaKerusakan
        }
    };
};

// ===== CREATE PENGEMBALIAN =====
// Membuat record pengembalian
const create = (data, callback) => {
    const { id_peminjaman, id_petugas, kondisi_alat, catatan, tanggal_harus_kembali } = data;

    if (!id_peminjaman) {
        return callback(new Error("ID peminjaman wajib diisi"));
    }

    // Hitung denda berdasarkan tanggal dan kondisi
    const tanggalKembali = new Date();
    const { terlambat_hari, denda } = hitungDenda(tanggal_harus_kembali, tanggalKembali, kondisi_alat);

    const query = `
        INSERT INTO pengembalian (id_peminjaman, id_petugas, kondisi_alat, terlambat_hari, denda, catatan)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [id_peminjaman, id_petugas, kondisi_alat || 'baik', terlambat_hari, denda, catatan], callback);
};

// ===== DELETE PENGEMBALIAN =====
const deleteById = (id, callback) => {
    const query = "DELETE FROM pengembalian WHERE id = ?";
    db.query(query, [id], callback);
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    hitungDenda,
    create,
    deleteById,
    DENDA_PER_HARI
};
