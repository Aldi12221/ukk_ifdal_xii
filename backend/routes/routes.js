// ===========================================
// FILE: routes.js
// DESKRIPSI: Semua route API aplikasi
// ===========================================
const express = require('express');
const router = express.Router();

// Import Controllers
const userController = require('../controllers/userController');
const kategoriController = require('../controllers/kategoriController');
const alatController = require('../controllers/alatController');
const peminjamanController = require('../controllers/peminjamanController');
const pengembalianController = require('../controllers/pengembalianController');
const logAktivitasController = require('../controllers/logAktivitasController');

// Import Middleware
const { verifyToken, isAdmin, isAdminOrPetugas } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ===========================================
// ROUTES TANPA AUTH (PUBLIC)
// ===========================================

// Login - Semua orang bisa akses
router.post('/login', userController.login);

// Register - Untuk daftar sebagai peminjam
router.post('/register', userController.register);

// ===========================================
// ROUTES DENGAN AUTH (PERLU LOGIN)
// ===========================================

// ----- USER ROUTES -----
// Get profile sendiri
router.get('/profile', verifyToken, userController.getProfile);

// CRUD User (Admin only)
router.get('/users', verifyToken, isAdmin, userController.getAll);
router.get('/users/:id', verifyToken, isAdmin, userController.getById);
router.put('/users/:id', verifyToken, isAdmin, userController.update);
router.delete('/users/:id', verifyToken, isAdmin, userController.deleteUser);

// ----- KATEGORI ROUTES -----
// Semua user yang login bisa lihat kategori
router.get('/kategori', verifyToken, kategoriController.getAll);
router.get('/kategori/:id', verifyToken, kategoriController.getById);

// CRUD Kategori (Admin only)
router.post('/kategori', verifyToken, isAdmin, kategoriController.create);
router.put('/kategori/:id', verifyToken, isAdmin, kategoriController.update);
router.delete('/kategori/:id', verifyToken, isAdmin, kategoriController.deleteKategori);

// ----- ALAT ROUTES -----
// List alat tersedia (untuk peminjam)
router.get('/alat/tersedia', verifyToken, alatController.getAvailable);

// Semua user yang login bisa lihat alat
router.get('/alat', verifyToken, alatController.getAll);
router.get('/alat/:id', verifyToken, alatController.getById);

// CRUD Alat (Admin only) - dengan upload gambar
router.post('/alat', verifyToken, isAdmin, upload.single('gambar'), alatController.create);
router.put('/alat/:id', verifyToken, isAdmin, upload.single('gambar'), alatController.update);
router.delete('/alat/:id', verifyToken, isAdmin, alatController.deleteAlat);

// ----- PEMINJAMAN ROUTES -----
// Peminjam melihat peminjamannya sendiri
router.get('/peminjaman/my', verifyToken, peminjamanController.getMyPeminjaman);

// Petugas melihat peminjaman pending
router.get('/peminjaman/pending', verifyToken, isAdminOrPetugas, peminjamanController.getPending);

// Lihat peminjaman aktif (yang sedang dipinjam)
router.get('/peminjaman/active', verifyToken, isAdminOrPetugas, peminjamanController.getActive);

// Lihat pengajuan pengembalian (dari peminjam)
router.get('/peminjaman/return-requests', verifyToken, isAdminOrPetugas, peminjamanController.getReturnRequests);

// Semua peminjaman (Admin & Petugas - untuk laporan)
router.get('/peminjaman', verifyToken, isAdminOrPetugas, peminjamanController.getAll);
router.get('/peminjaman/:id', verifyToken, peminjamanController.getById);

// Ajukan peminjaman (semua user yang login)
router.post('/peminjaman', verifyToken, peminjamanController.create);

// Approve/Reject (Petugas/Admin)
router.put('/peminjaman/:id/approve', verifyToken, isAdminOrPetugas, peminjamanController.approve);
router.put('/peminjaman/:id/reject', verifyToken, isAdminOrPetugas, peminjamanController.reject);

// Delete peminjaman (Admin only)
router.delete('/peminjaman/:id', verifyToken, isAdmin, peminjamanController.deletePeminjaman);

// Ajukan pengembalian (Peminjam)
router.put('/peminjaman/:id/return', verifyToken, peminjamanController.requestReturn);

// ----- PENGEMBALIAN ROUTES -----
// Lihat semua pengembalian (Admin & Petugas - untuk laporan)
router.get('/pengembalian', verifyToken, isAdminOrPetugas, pengembalianController.getAll);
router.get('/pengembalian/:id', verifyToken, pengembalianController.getById);

// Proses pengembalian (Petugas/Admin)
router.post('/pengembalian', verifyToken, isAdminOrPetugas, pengembalianController.create);

// Delete pengembalian (Admin only)
router.delete('/pengembalian/:id', verifyToken, isAdmin, pengembalianController.deletePengembalian);

// ----- LOG AKTIVITAS ROUTES -----
// Hanya Admin yang bisa lihat log
router.get('/log-aktivitas', verifyToken, isAdmin, logAktivitasController.getAll);

// Export router
module.exports = router;