// ===========================================
// FILE: db.js
// DESKRIPSI: Koneksi ke database MySQL
// ===========================================
const mysql = require("mysql2");

// Membuat koneksi pool ke database
// Pool lebih baik daripada single connection karena bisa handle banyak request
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ukk_ifdal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Fungsi untuk inisialisasi database dan tabel
const initDatabase = () => {
    // Buat koneksi sementara untuk membuat database
    const tempConnection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    tempConnection.connect((err) => {
        if (err) {
            console.error("Gagal konek ke MySQL:", err.message);
            return;
        }
        console.log("1. Berhasil konek ke MySQL");

        // Buat database jika belum ada
        tempConnection.query("CREATE DATABASE IF NOT EXISTS ukk_ifdal", (err) => {
            if (err) {
                console.error("Gagal membuat database:", err.message);
                return;
            }
            console.log("2. Database ukk_ifdal siap");

            // Gunakan database
            tempConnection.query("USE ukk_ifdal", (err) => {
                if (err) throw err;

                // Buat semua tabel yang dibutuhkan
                createAllTables(tempConnection);
            });
        });
    });
};

// Fungsi untuk membuat semua tabel
const createAllTables = (connection) => {

    // ===== TABEL 1: ROLES =====
    // Menyimpan daftar role: Admin, Petugas, Peminjam
    const createRoles = `
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role VARCHAR(50) NOT NULL UNIQUE
        )
    `;

    // ===== TABEL 2: USERS =====
    // Menyimpan data semua pengguna
    const createUsers = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            nama_lengkap VARCHAR(255),
            alamat VARCHAR(255),
            role_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
        )
    `;

    // ===== TABEL 3: KATEGORI =====
    // Menyimpan kategori alat (contoh: Elektronik, Olahraga, dll)
    const createKategori = `
        CREATE TABLE IF NOT EXISTS kategori (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_kategori VARCHAR(255) NOT NULL,
            deskripsi TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // ===== TABEL 4: ALAT =====
    // Menyimpan data alat yang bisa dipinjam
    const createAlat = `
        CREATE TABLE IF NOT EXISTS alat (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_alat VARCHAR(255) NOT NULL,
            deskripsi TEXT,
            gambar VARCHAR(255) DEFAULT NULL,
            jumlah INT NOT NULL DEFAULT 0,
            jumlah_tersedia INT NOT NULL DEFAULT 0,
            kategori_id INT,
            kondisi ENUM('baik', 'rusak_ringan', 'rusak_berat') DEFAULT 'baik',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
        )
    `;

    // ===== TABEL 5: PEMINJAMAN =====
    // Menyimpan data peminjaman alat
    const createPeminjaman = `
        CREATE TABLE IF NOT EXISTS peminjaman (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_peminjam INT NOT NULL,
            id_alat INT NOT NULL,
            jumlah_pinjam INT NOT NULL DEFAULT 1,
            tanggal_pinjam DATETIME DEFAULT CURRENT_TIMESTAMP,
            tanggal_harus_kembali DATETIME NOT NULL,
            status ENUM('pending', 'disetujui', 'ditolak', 'dipinjam', 'menunggu_pengembalian', 'dikembalikan') DEFAULT 'pending',
            id_petugas_approval INT,
            tanggal_approval DATETIME,
            catatan TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_peminjam) REFERENCES users(id),
            FOREIGN KEY (id_alat) REFERENCES alat(id),
            FOREIGN KEY (id_petugas_approval) REFERENCES users(id)
        )
    `;

    // ===== TABEL 6: PENGEMBALIAN =====
    // Menyimpan data pengembalian alat
    const createPengembalian = `
        CREATE TABLE IF NOT EXISTS pengembalian (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_peminjaman INT NOT NULL UNIQUE,
            id_petugas INT,
            tanggal_kembali DATETIME DEFAULT CURRENT_TIMESTAMP,
            kondisi_alat ENUM('baik', 'rusak_ringan', 'rusak_berat') DEFAULT 'baik',
            terlambat_hari INT DEFAULT 0,
            denda DECIMAL(10, 2) DEFAULT 0,
            catatan TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_peminjaman) REFERENCES peminjaman(id),
            FOREIGN KEY (id_petugas) REFERENCES users(id)
        )
    `;

    // ===== TABEL 7: LOG AKTIVITAS =====
    // Menyimpan log semua aktivitas di sistem
    const createLogAktivitas = `
        CREATE TABLE IF NOT EXISTS log_aktivitas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_user INT,
            aksi VARCHAR(255) NOT NULL,
            tabel_terkait VARCHAR(100),
            id_data INT,
            keterangan TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE SET NULL
        )
    `;

    // Jalankan semua query pembuatan tabel
    connection.query(createRoles, (err) => {
        if (err) console.error("Error create roles:", err.message);
        else console.log("   - Tabel roles OK");

        connection.query(createUsers, (err) => {
            if (err) console.error("Error create users:", err.message);
            else console.log("   - Tabel users OK");

            connection.query(createKategori, (err) => {
                if (err) console.error("Error create kategori:", err.message);
                else console.log("   - Tabel kategori OK");

                connection.query(createAlat, (err) => {
                    if (err) console.error("Error create alat:", err.message);
                    else console.log("   - Tabel alat OK");

                    connection.query(createPeminjaman, (err) => {
                        if (err) console.error("Error create peminjaman:", err.message);
                        else console.log("   - Tabel peminjaman OK");

                        connection.query(createPengembalian, (err) => {
                            if (err) console.error("Error create pengembalian:", err.message);
                            else console.log("   - Tabel pengembalian OK");

                            connection.query(createLogAktivitas, (err) => {
                                if (err) console.error("Error create log_aktivitas:", err.message);
                                else console.log("   - Tabel log_aktivitas OK");

                                // Insert data default roles jika belum ada
                                insertDefaultRoles(connection);
                            });
                        });
                    });
                });
            });
        });
    });
};

// Fungsi untuk insert roles default
const insertDefaultRoles = (connection) => {
    const checkRoles = "SELECT COUNT(*) as count FROM roles";
    connection.query(checkRoles, (err, results) => {
        if (err) {
            console.error("Error check roles:", err.message);
            return;
        }

        // Jika belum ada roles, insert default
        if (results[0].count === 0) {
            const insertRoles = `
                INSERT INTO roles (id, role) VALUES 
                (1, 'admin'),
                (2, 'petugas'),
                (3, 'peminjam')
            `;
            connection.query(insertRoles, (err) => {
                if (err) console.error("Error insert roles:", err.message);
                else console.log("3. Default roles berhasil ditambahkan");

                connection.end(); // Tutup koneksi sementara
            });
        } else {
            console.log("3. Roles sudah ada");
            connection.end();
        }
    });
};

// Export pool untuk digunakan di model lain
// dan fungsi init untuk setup database
module.exports = pool;
module.exports.initDatabase = initDatabase;