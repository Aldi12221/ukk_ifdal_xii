// ===========================================
// FILE: user.js (MODEL)
// DESKRIPSI: Semua fungsi untuk mengelola data user
// ===========================================
const db = require('../db/db');
const bcrypt = require('bcryptjs');

// ===== GET ALL USERS =====
// Mengambil semua data user beserta nama role-nya
const getAll = (callback) => {
    const query = `
        SELECT 
            users.id,
            users.username,
            users.email,
            users.nama_lengkap,
            users.alamat,
            users.role_id,
            roles.role as nama_role,
            users.created_at
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        ORDER BY users.id DESC
    `;
    db.query(query, callback);
};

// ===== GET USER BY ID =====
// Mengambil satu user berdasarkan ID
const getById = (id, callback) => {
    const query = `
        SELECT 
            users.*,
            roles.role as nama_role
        FROM users
        LEFT JOIN roles ON users.role_id = roles.id
        WHERE users.id = ?
    `;
    db.query(query, [id], callback);
};

// ===== GET USER BY EMAIL =====
// Digunakan untuk login - mencari user berdasarkan email
const getByEmail = (email, callback) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], callback);
};

// ===== CREATE USER / REGISTER =====
// Membuat user baru dengan password yang di-hash
const create = (data, callback) => {
    // Cek apakah semua data lengkap
    const { username, email, password, nama_lengkap, alamat, role_id } = data;

    if (!username || !email || !password) {
        return callback(new Error("Username, email, dan password wajib diisi"));
    }

    // Hash password supaya aman
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `
        INSERT INTO users (username, email, password, nama_lengkap, alamat, role_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [username, email, hashedPassword, nama_lengkap, alamat, role_id || 3], callback);
};

// ===== UPDATE USER =====
// Mengupdate data user berdasarkan ID
const update = (id, data, callback) => {
    const { username, email, password, nama_lengkap, alamat, role_id } = data;

    // Jika password diisi, hash password baru
    // Jika tidak diisi, jangan update password
    if (password && password.length > 0) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const query = `
            UPDATE users 
            SET username = ?, email = ?, password = ?, nama_lengkap = ?, alamat = ?, role_id = ?
            WHERE id = ?
        `;
        db.query(query, [username, email, hashedPassword, nama_lengkap, alamat, role_id, id], callback);
    } else {
        // Update tanpa password
        const query = `
            UPDATE users 
            SET username = ?, email = ?, nama_lengkap = ?, alamat = ?, role_id = ?
            WHERE id = ?
        `;
        db.query(query, [username, email, nama_lengkap, alamat, role_id, id], callback);
    }
};

// ===== DELETE USER =====
// Menghapus user berdasarkan ID
const deleteById = (id, callback) => {
    const query = "DELETE FROM users WHERE id = ?";
    db.query(query, [id], callback);
};

// ===== VERIFY PASSWORD =====
// Membandingkan password dengan hash di database
const verifyPassword = (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
};

// Export semua fungsi
module.exports = {
    getAll,
    getById,
    getByEmail,
    create,
    update,
    deleteById,
    verifyPassword
};