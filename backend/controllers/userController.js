const User = require('../models/user');


const getUser =  (req,res)=>{
    User.getUser((err,results)=>{
        if(err)
        {
            return res.status(500).json({error:err.message})
        }
        if (results.length===0){
            return res.status(404).json({message:"user kosong"})
        }
        res.status(200).json(results)
    })
}
const registerUser =(req,res)=>{
    const {username,email, password,nama_lengkap,alamat, role_id} = req.body;
    User.registerUser(username,email,password,nama_lengkap,alamat,role_id,(err,results)=>{
        if(err)
        {
            return res.status(500).json({error:err.message})
        }
        if (results.length===0){
            return res.status(404).json({message:"user kosong"})
        }
        res.status(200).json(results)
    })


}

module.exports={registerUser,getUser}