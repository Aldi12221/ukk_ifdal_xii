import mysql from 'mysql2'
const koneksi = mysql.createConnection({
    host:'Localhost',
    user:'root',
    password:'',
    database:'ukk_ifdal'
})
const createUserTable =(koneksi)=>{
    const q=`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
        role VARCHAR(50) NOT NULL DEFAULT 'peminjam')`
        koneksi.query(q,(err)=>{
            if(err) throw err;
            console.log('Tabel users berhasil dibuat atau sudah ada');

            
        })

}
const createAlatTable =(koneksi)=>{
    const q=`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
        role VARCHAR(50) NOT NULL DEFAULT 'peminjam')`
        koneksi.query(q,(err)=>{
            if(err) throw err;
            console.log('Tabel alat berhasil dibuat atau sudah ada');

            
        })

}
const createPeminjamanTable =(koneksi)=>{
    const q=`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
        role VARCHAR(50) NOT NULL DEFAULT 'peminjam')`
        koneksi.query(q,(err)=>{
            if(err) throw err;
            console.log('Tabel peminjaman berhasil dibuat atau sudah ada');

            
        })

}
const createPengembalianTable =(koneksi)=>{
    const q=`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
        role VARCHAR(50) NOT NULL DEFAULT 'peminjam')`
        koneksi.query(q,(err)=>{
            if(err) throw err;
            console.log('Tabel Pengembalian berhasil dibuat atau sudah ada');

            
        })

}
const createKategoriTable =(koneksi)=>{
    const q=`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
        role VARCHAR(50) NOT NULL DEFAULT 'peminjam')`
        koneksi.query(q,(err)=>{
            if(err) throw err;
            console.log('Tabel Kategori berhasil dibuat atau sudah ada');

            
        })

}

const migration =()=>{
    konekMysql.connect((err)=>{
        if(err){
            console.error(" error ketika konek ke database",err.stack);
            return;
        }
        console.log("berhasil konek mysql");
        konekMysql.query(
            "CREATE DATABASE IF NOT EXISTS ukk_ifdal",
            (err,result)=>{
                if(err){
                    console.error(" error membuat database",err.stack);
            return;
                }
                console.log("database berhasil di buat atau sudah ada");

                const koneksi=require("../models/db")
                createUserTable(koneksi);
                createAlatTable(koneksi);
                createPeminjamanTable(koneksi);
                createPengembalianTable(koneksi);
                createKategoriTable(koneksi);

                konekMysql.end();
            }
        );
    });
};

module.exports = migration