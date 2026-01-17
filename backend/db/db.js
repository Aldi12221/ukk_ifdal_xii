const mysql= require ("mysql2")
const koneksi = mysql.createConnection({
    host:'Localhost',
    user:'root',
    password:'',
    
})

const db = () => {
    koneksi.connect((err) => {
        if (err) {
            console.error("Gagal konek ke MySQL:", err.stack);
            return;
        }
        console.log("1. Berhasil konek ke MySQL");

      
        koneksi.query("CREATE DATABASE IF NOT EXISTS ukk_ifdal", (err) => {
            if (err) {
                console.error("Gagal membuat database:", err.message);
                return;
            }
            
            

           
            koneksi.query("USE ukk_ifdal", (err) => {
                if (err) throw err;
                
                createRolesTable(koneksi);
                createUserTable(koneksi);
                createKategoriTable(koneksi);
                createAlatTable(koneksi);
                createPeminjamanTable(koneksi);
                createPengembalianTable(koneksi);
            });
        });
    });
};




const createRolesTable = (koneksi) => {
    const q = `CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(50) NOT NULL UNIQUE)`;
    koneksi.query(q, (err) => {
        if (err) throw err;
        console.log('Tabel roles berhasil dibuat');
    });
};

const createUserTable = (koneksi) => {
    
    const q = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL ,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nama_lengkap VARCHAR(255),
        alamat VARCHAR(255),
        role_id INT,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL)`;
    koneksi.query(q, (err) => {
        if (err) throw err;
        console.log('Tabel users berhasil dibuat');
    });
};

const createKategoriTable = (koneksi) => {
    
    const q = `CREATE TABLE IF NOT EXISTS kategori (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_kategori VARCHAR(255) NOT NULL)`;
    koneksi.query(q, (err) => {
        if (err) throw err;
        console.log('Tabel kategori berhasil dibuat');
    });
};

const createAlatTable = (koneksi) => {
    const q = `CREATE TABLE IF NOT EXISTS alat (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_alat VARCHAR(255) NOT NULL,
        jumlah INT NOT NULL,
        kategori_id INT,
        status ENUM('tersedia', 'dipinjam', 'perbaikan') DEFAULT 'tersedia',
        FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL)`;
    koneksi.query(q, (err) => {
        if (err) throw err;
        console.log('Tabel alat berhasil dibuat');
    });
};

const createPeminjamanTable = (koneksi) => {
    const q = `CREATE TABLE IF NOT EXISTS peminjaman (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_peminjam INT,
        id_petugas INT,
        id_alat INT,
        tanggal_pinjam DATETIME DEFAULT CURRENT_TIMESTAMP,
        tanggal_kembali_seharusnya DATETIME NOT NULL,
        status_approval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        FOREIGN KEY (id_peminjam) REFERENCES users(id),
        FOREIGN KEY (id_petugas) REFERENCES users(id),
        FOREIGN KEY (id_alat) REFERENCES alat(id))`;
    koneksi.query(q, (err) => {
        if (err) throw err;
        console.log('Tabel peminjaman berhasil dibuat');
    });
};

const createPengembalianTable = (koneksi) => {
    const q = `CREATE TABLE IF NOT EXISTS pengembalian (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_peminjaman INT UNIQUE,
        id_petugas INT,
        tanggal_kembali TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        denda DECIMAL(10, 2) DEFAULT 0, 
        FOREIGN KEY (id_peminjaman) REFERENCES peminjaman(id),
        FOREIGN KEY (id_petugas) REFERENCES users(id))`;
    koneksi.query(q, (err) => {
        if (err) throw err;
        console.log('Tabel pengembalian berhasil dibuat');
    });
};


module.exports = db