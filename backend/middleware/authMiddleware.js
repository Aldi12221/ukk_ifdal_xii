// ===========================================
// FILE: authMiddleware.js
// DESKRIPSI: Middleware untuk autentikasi dan otorisasi
// ===========================================
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ===== VERIFY TOKEN =====
// Mengecek apakah user sudah login (punya token valid)
const verifyToken = (req, res, next) => {
    // Ambil token dari header Authorization
    // Format: "Bearer <token>"
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Token tidak ditemukan. Silakan login dulu."
        });
    }

    // Pisahkan "Bearer" dan token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Format token tidak valid."
        });
    }

    // Verifikasi token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Token tidak valid atau sudah kadaluarsa."
            });
        }

        // Simpan data user dari token ke request
        // Sehingga bisa diakses di controller
        req.userId = decoded.id;
        req.userRole = decoded.role_id;

        next(); // Lanjut ke middleware/controller berikutnya
    });
};

// ===== IS ADMIN =====
// Mengecek apakah user adalah Admin (role_id = 1)
const isAdmin = (req, res, next) => {
    if (req.userRole !== 1) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak. Hanya Admin yang bisa mengakses."
        });
    }
    next();
};

// ===== IS PETUGAS =====
// Mengecek apakah user adalah Petugas (role_id = 2)
const isPetugas = (req, res, next) => {
    if (req.userRole !== 2) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak. Hanya Petugas yang bisa mengakses."
        });
    }
    next();
};

// ===== IS PEMINJAM =====
// Mengecek apakah user adalah Peminjam (role_id = 3)
const isPeminjam = (req, res, next) => {
    if (req.userRole !== 3) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak. Hanya Peminjam yang bisa mengakses."
        });
    }
    next();
};

// ===== IS ADMIN OR PETUGAS =====
// Mengecek apakah user adalah Admin atau Petugas
const isAdminOrPetugas = (req, res, next) => {
    if (req.userRole !== 1 && req.userRole !== 2) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak. Hanya Admin atau Petugas yang bisa mengakses."
        });
    }
    next();
};

// Export semua middleware
module.exports = {
    verifyToken,
    isAdmin,
    isPetugas,
    isPeminjam,
    isAdminOrPetugas
};
