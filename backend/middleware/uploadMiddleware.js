// ===========================================
// FILE: uploadMiddleware.js
// DESKRIPSI: Middleware untuk upload file gambar
// ===========================================
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    // Tentukan folder tujuan upload
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    // Tentukan nama file
    // Format: timestamp-namaasli.ext
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Filter file - hanya izinkan gambar
const fileFilter = (req, file, cb) => {
    // Daftar tipe file yang diizinkan
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diizinkan (jpeg, jpg, png, gif, webp)'), false);
    }
};

// Buat instance multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Maksimal 5MB
    }
});

module.exports = upload;
