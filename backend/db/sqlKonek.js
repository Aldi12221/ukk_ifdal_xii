const mysql = require("mysql2");
const koneksi = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"ukk_ifdal"
})
koneksi.connect((err)=>{
    if (err){
        console.error("error konek ke database",err.stack)
        return
    }
    console.log("berhasil konek ke database");
})
module.exports = koneksi