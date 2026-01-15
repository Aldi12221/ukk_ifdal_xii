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
const seletUserById =(id,callback)=>{
    const q = "SELECT * FROM users WHERE id = ?"
    db.query (q,[id],callback)
}
const selectUserByEmail = (email,callback)=>{
    const q =" SELECT * FROM users WHERE email=?";
    db.query(q,[email],callback)
};
const deleteUser =(id,callback)=>{
    const q = "DELETE FROM users WHERE id = ?"
    db.query(q,[id],callback)
}

module.exports={registerUser,getUser,seletUserById,selectUserByEmail,deleteUser}