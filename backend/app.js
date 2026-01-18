// ===========================================
// FILE: app.js
// DESKRIPSI: File utama aplikasi backend
// ===========================================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import database
const db = require("./db/db");

// Import routes
const routes = require("./routes/routes");

// Buat aplikasi Express
const app = express();

// Ambil PORT dari .env atau gunakan 3000
const PORT = process.env.PORT || 3000;

// ===========================================
// MIDDLEWARE
// ===========================================

// CORS - Izinkan frontend mengakses API
// Ini penting supaya React bisa memanggil API
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // URL frontend Vite (bisa di port berbeda)
    credentials: true
}));

// Body Parser - Untuk membaca JSON dari request body
app.use(bodyParser.json());

// Untuk membaca form data
app.use(bodyParser.urlencoded({ extended: true }));

// Static files - Untuk akses gambar yang diupload
// Gambar bisa diakses via: http://localhost:3000/uploads/namafile.jpg
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ===========================================
// ROUTES
// ===========================================

// Semua API ada di prefix /api
// Contoh: GET http://localhost:3000/api/users
app.use("/api", routes);

// Route untuk test apakah server jalan
app.get("/", (req, res) => {
    res.json({
        message: "Selamat datang di API Peminjaman Alat",
        version: "1.0.0",
        endpoints: {
            users: "/api/users",
            kategori: "/api/kategori",
            alat: "/api/alat",
            peminjaman: "/api/peminjaman",
            pengembalian: "/api/pengembalian"
        }
    });
});

// ===========================================
// JALANKAN SERVER
// ===========================================

// Inisialisasi database dulu, baru jalankan server
db.initDatabase();

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`========================================\n`);
});
