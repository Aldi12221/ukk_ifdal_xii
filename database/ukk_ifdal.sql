-- ===========================================
-- FILE: ukk_ifdal.sql
-- DESKRIPSI: Database lengkap untuk Aplikasi Peminjaman Alat
-- UKK Rekayasa Perangkat Lunak 2025/2026
-- ===========================================

-- Buat database
CREATE DATABASE IF NOT EXISTS ukk_ifdal;
USE ukk_ifdal;

-- ===========================================
-- TABEL 1: ROLES
-- Menyimpan daftar role pengguna
-- ===========================================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles
INSERT INTO roles (id, role) VALUES 
(1, 'admin'),
(2, 'petugas'),
(3, 'peminjam')
ON DUPLICATE KEY UPDATE role = role;

-- ===========================================
-- TABEL 2: USERS
-- Menyimpan data semua pengguna
-- ===========================================
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
);

-- ===========================================
-- TABEL 3: KATEGORI
-- Menyimpan kategori alat
-- ===========================================
CREATE TABLE IF NOT EXISTS kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- TABEL 4: ALAT
-- Menyimpan data alat yang bisa dipinjam
-- ===========================================
CREATE TABLE IF NOT EXISTS alat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_alat VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    jumlah INT NOT NULL DEFAULT 0,
    jumlah_tersedia INT NOT NULL DEFAULT 0,
    kategori_id INT,
    kondisi ENUM('baik', 'rusak_ringan', 'rusak_berat') DEFAULT 'baik',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
);

-- ===========================================
-- TABEL 5: PEMINJAMAN
-- Menyimpan data peminjaman alat
-- ===========================================
CREATE TABLE IF NOT EXISTS peminjaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_peminjam INT NOT NULL,
    id_alat INT NOT NULL,
    jumlah_pinjam INT NOT NULL DEFAULT 1,
    tanggal_pinjam DATETIME DEFAULT CURRENT_TIMESTAMP,
    tanggal_harus_kembali DATETIME NOT NULL,
    status ENUM('pending', 'disetujui', 'ditolak', 'dipinjam', 'dikembalikan') DEFAULT 'pending',
    id_petugas_approval INT,
    tanggal_approval DATETIME,
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_peminjam) REFERENCES users(id),
    FOREIGN KEY (id_alat) REFERENCES alat(id),
    FOREIGN KEY (id_petugas_approval) REFERENCES users(id)
);

-- ===========================================
-- TABEL 6: PENGEMBALIAN
-- Menyimpan data pengembalian alat
-- ===========================================
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
);

-- ===========================================
-- TABEL 7: LOG AKTIVITAS
-- Menyimpan log semua aktivitas di sistem
-- ===========================================
CREATE TABLE IF NOT EXISTS log_aktivitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    aksi VARCHAR(255) NOT NULL,
    tabel_terkait VARCHAR(100),
    id_data INT,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE SET NULL
);

-- ===========================================
-- STORED PROCEDURES
-- ===========================================

-- Procedure untuk membuat peminjaman baru
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_create_peminjaman(
    IN p_id_peminjam INT,
    IN p_id_alat INT,
    IN p_jumlah INT,
    IN p_tanggal_kembali DATETIME,
    IN p_catatan TEXT
)
BEGIN
    DECLARE v_tersedia INT;
    
    -- Cek ketersediaan
    SELECT jumlah_tersedia INTO v_tersedia FROM alat WHERE id = p_id_alat;
    
    IF v_tersedia >= p_jumlah THEN
        INSERT INTO peminjaman (id_peminjam, id_alat, jumlah_pinjam, tanggal_harus_kembali, catatan)
        VALUES (p_id_peminjam, p_id_alat, p_jumlah, p_tanggal_kembali, p_catatan);
        SELECT 'SUCCESS' as status, LAST_INSERT_ID() as id;
    ELSE
        SELECT 'ERROR' as status, 'Stok tidak mencukupi' as message;
    END IF;
END //
DELIMITER ;

-- Procedure untuk proses pengembalian
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_proses_pengembalian(
    IN p_id_peminjaman INT,
    IN p_id_petugas INT,
    IN p_kondisi VARCHAR(20),
    IN p_catatan TEXT
)
BEGIN
    DECLARE v_id_alat INT;
    DECLARE v_jumlah INT;
    DECLARE v_tgl_kembali DATETIME;
    DECLARE v_terlambat INT;
    DECLARE v_denda DECIMAL(10,2);
    
    START TRANSACTION;
    
    -- Ambil data peminjaman
    SELECT id_alat, jumlah_pinjam, tanggal_harus_kembali 
    INTO v_id_alat, v_jumlah, v_tgl_kembali 
    FROM peminjaman WHERE id = p_id_peminjaman;
    
    -- Hitung keterlambatan
    SET v_terlambat = GREATEST(0, DATEDIFF(NOW(), v_tgl_kembali));
    SET v_denda = v_terlambat * 5000;
    
    -- Insert pengembalian
    INSERT INTO pengembalian (id_peminjaman, id_petugas, kondisi_alat, terlambat_hari, denda, catatan)
    VALUES (p_id_peminjaman, p_id_petugas, p_kondisi, v_terlambat, v_denda, p_catatan);
    
    -- Update status peminjaman
    UPDATE peminjaman SET status = 'dikembalikan' WHERE id = p_id_peminjaman;
    
    -- Kembalikan stok alat
    UPDATE alat SET jumlah_tersedia = jumlah_tersedia + v_jumlah WHERE id = v_id_alat;
    
    COMMIT;
    
    SELECT 'SUCCESS' as status, v_terlambat as terlambat_hari, v_denda as denda;
END //
DELIMITER ;

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function untuk menghitung denda
DELIMITER //
CREATE FUNCTION IF NOT EXISTS fn_hitung_denda(p_tanggal_harus_kembali DATETIME)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_terlambat INT;
    DECLARE v_denda DECIMAL(10,2);
    
    SET v_terlambat = GREATEST(0, DATEDIFF(NOW(), p_tanggal_harus_kembali));
    SET v_denda = v_terlambat * 5000;
    
    RETURN v_denda;
END //
DELIMITER ;

-- Function untuk cek ketersediaan alat
DELIMITER //
CREATE FUNCTION IF NOT EXISTS fn_cek_ketersediaan(p_id_alat INT, p_jumlah INT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_tersedia INT;
    
    SELECT jumlah_tersedia INTO v_tersedia FROM alat WHERE id = p_id_alat;
    
    RETURN v_tersedia >= p_jumlah;
END //
DELIMITER ;

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Trigger untuk log saat user baru dibuat
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_user_created
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO log_aktivitas (id_user, aksi, tabel_terkait, id_data, keterangan)
    VALUES (NEW.id, 'REGISTER', 'users', NEW.id, CONCAT('User baru: ', NEW.email));
END //
DELIMITER ;

-- Trigger untuk log saat peminjaman dibuat
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_peminjaman_created
AFTER INSERT ON peminjaman
FOR EACH ROW
BEGIN
    INSERT INTO log_aktivitas (id_user, aksi, tabel_terkait, id_data, keterangan)
    VALUES (NEW.id_peminjam, 'CREATE', 'peminjaman', NEW.id, 'Pengajuan peminjaman baru');
END //
DELIMITER ;

-- Trigger untuk update stok saat peminjaman diapprove
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_peminjaman_approved
AFTER UPDATE ON peminjaman
FOR EACH ROW
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'dipinjam' THEN
        UPDATE alat SET jumlah_tersedia = jumlah_tersedia - NEW.jumlah_pinjam 
        WHERE id = NEW.id_alat;
        
        INSERT INTO log_aktivitas (id_user, aksi, tabel_terkait, id_data, keterangan)
        VALUES (NEW.id_petugas_approval, 'APPROVE', 'peminjaman', NEW.id, 'Peminjaman disetujui');
    END IF;
END //
DELIMITER ;

-- ===========================================
-- SAMPLE DATA
-- ===========================================

-- Sample Admin User (password: admin123)
INSERT INTO users (username, email, password, nama_lengkap, alamat, role_id) VALUES
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'Alamat Admin', 1)
ON DUPLICATE KEY UPDATE username = username;

-- Sample Petugas User (password: petugas123)
INSERT INTO users (username, email, password, nama_lengkap, alamat, role_id) VALUES
('petugas', 'petugas@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Petugas Satu', 'Alamat Petugas', 2)
ON DUPLICATE KEY UPDATE username = username;

-- Sample Peminjam User (password: peminjam123)
INSERT INTO users (username, email, password, nama_lengkap, alamat, role_id) VALUES
('peminjam', 'peminjam@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Peminjam Satu', 'Alamat Peminjam', 3)
ON DUPLICATE KEY UPDATE username = username;

-- Sample Kategori
INSERT INTO kategori (nama_kategori, deskripsi) VALUES
('Elektronik', 'Peralatan elektronik seperti laptop, proyektor, dll'),
('Olahraga', 'Peralatan olahraga seperti bola, raket, dll'),
('Laboratorium', 'Peralatan laboratorium untuk praktikum'),
('Multimedia', 'Peralatan multimedia seperti kamera, mic, dll')
ON DUPLICATE KEY UPDATE nama_kategori = nama_kategori;

-- Sample Alat
INSERT INTO alat (nama_alat, deskripsi, jumlah, jumlah_tersedia, kategori_id, kondisi) VALUES
('Laptop Lenovo', 'Laptop untuk presentasi', 5, 5, 1, 'baik'),
('Proyektor Epson', 'Proyektor HD untuk kelas', 3, 3, 1, 'baik'),
('Bola Basket', 'Bola basket ukuran standar', 10, 10, 2, 'baik'),
('Raket Badminton', 'Raket badminton Yonex', 8, 8, 2, 'baik'),
('Mikroskop', 'Mikroskop untuk praktikum biologi', 6, 6, 3, 'baik'),
('Kamera DSLR Canon', 'Kamera untuk dokumentasi', 2, 2, 4, 'baik'),
('Tripod', 'Tripod untuk kamera', 4, 4, 4, 'baik')
ON DUPLICATE KEY UPDATE nama_alat = nama_alat;

-- ===========================================
-- COMMIT
-- ===========================================
COMMIT;

-- Pesan selesai
SELECT 'Database ukk_ifdal berhasil dibuat!' as message;
