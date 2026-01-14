const db= require('../db/sqlKonek')
const bcrypt = require('bcryptjs')

const getUser=(callback)=>{
    const q = "SELECT * FROM users"
    db.query (q,callback)
}

const registerUser =(username,email,password,nama_lengkap,alamat,role_id,callback)=>{
    if(username && email && password && role_id && nama_lengkap && alamat){
        const hashedPassword = bcrypt.hashSync(password, 10);
        const q = `INSERT INTO users (username, email, password, nama_lengkap,alamat, role_id) VALUES (?, ?, ?, ?, ?,?)`;
        db.query(q,[username,email,hashedPassword,nama_lengkap,alamat,role_id],callback)
    
    }else{
        console.error("Data tidak lengkap")

    }


}

module.exports={registerUser,getUser}