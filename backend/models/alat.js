// ===========================================
// FILE: alat.js (MODEL)
// DESKRIPSI: Semua fungsi untuk mengelola data alat
// ===========================================
const db = require('../db/db');

// ===== GET ALL ALAT =====
// Mengambil semua alat dengan nama kategorinya
const getAll = (callback) => {
    const query = `
        SELECT 
            alat.*,
            kategori.nama_kategori
        FROM alat
        LEFT JOIN kategori ON alat.kategori_id = kategori.id
        ORDER BY alat.id DESC
    `;
    db.query(query, callback);
};

// ===== GET ALAT BY ID =====
// Mengambil satu alat berdasarkan ID
const getById = (id, callback) => {
    const query = `
        SELECT 
            alat.*,
            kategori.nama_kategori
        FROM alat
        LEFT JOIN kategori ON alat.kategori_id = kategori.id
        WHERE alat.id = ?
    `;
    db.query(query, [id], callback);
};

// ===== GET ALAT TERSEDIA =====
// Mengambil alat yang masih tersedia untuk dipinjam
const getAvailable = (callback) => {
    const query = `
        SELECT 
            alat.*,
            kategori.nama_kategori
        FROM alat
        LEFT JOIN kategori ON alat.kategori_id = kategori.id
        WHERE alat.jumlah_tersedia > 0 AND alat.kondisi = 'baik'
        ORDER BY alat.nama_alat ASC
    `;
    db.query(query, callback);
};

// ===== CREATE ALAT =====
// Membuat alat baru
const create = (data, callback) => {
    const { nama_alat, deskripsi, gambar, jumlah, kategori_id, kondisi } = data;

    if (!nama_alat || !jumlah) {
        return callback(new Error("Nama alat dan jumlah wajib diisi"));
    }

    const query = `
        INSERT INTO alat (nama_alat, deskripsi, gambar, jumlah, jumlah_tersedia, kategori_id, kondisi)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    // jumlah_tersedia awalnya sama dengan jumlah
    db.query(query, [nama_alat, deskripsi, gambar || null, jumlah, jumlah, kategori_id, kondisi || 'baik'], callback);
};

// ===== UPDATE ALAT =====
// Mengupdate alat berdasarkan ID
const update = (id, data, callback) => {
    const { nama_alat, deskripsi, gambar, jumlah, jumlah_tersedia, kategori_id, kondisi } = data;

    // Jika ada gambar baru, update gambar juga
    const query = gambar
        ? `UPDATE alat SET nama_alat = ?, deskripsi = ?, gambar = ?, jumlah = ?, jumlah_tersedia = ?, kategori_id = ?, kondisi = ? WHERE id = ?`
        : `UPDATE alat SET nama_alat = ?, deskripsi = ?, jumlah = ?, jumlah_tersedia = ?, kategori_id = ?, kondisi = ? WHERE id = ?`;

    const params = gambar
        ? [nama_alat, deskripsi, gambar, jumlah, jumlah_tersedia, kategori_id, kondisi, id]
        : [nama_alat, deskripsi, jumlah, jumlah_tersedia, kategori_id, kondisi, id];

    db.query(query, params, callback);
};

// ===== DELETE ALAT =====
// Menghapus alat berdasarkan ID
const deleteById = (id, callback) => {
    const query = "DELETE FROM alat WHERE id = ?";
    db.query(query, [id], callback);
};

// ===== UPDATE JUMLAH TERSEDIA =====
// Mengurangi/menambah jumlah tersedia saat peminjaman/pengembalian
const updateJumlahTersedia = (id, jumlah, operation, callback) => {
    // operation: 'kurang' untuk peminjaman, 'tambah' untuk pengembalian
    let query;
    if (operation === 'kurang') {
        query = "UPDATE alat SET jumlah_tersedia = jumlah_tersedia - ? WHERE id = ? AND jumlah_tersedia >= ?";
        db.query(query, [jumlah, id, jumlah], callback);
    } else {
        query = "UPDATE alat SET jumlah_tersedia = jumlah_tersedia + ? WHERE id = ?";
        db.query(query, [jumlah, id], callback);
    }
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    getAvailable,
    create,
    update,
    deleteById,
    updateJumlahTersedia
};
