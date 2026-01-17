const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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
const getUserById =(req,res)=>{
    const{id}=req.params
    User.seletUserById(id,(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }else{
            return res.status(200).json(results)
        }

    })
   

}
const deleteUser =(req,res)=>{
    const {id}=req.params
    User.deleteUser(id,(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }else{
            return res.status(200).json({message:"user deleted successfully",results})
        }

    })
}
const login =(req,res)=>{
    const {email,password}= req.body  
    User.selectUserByEmail(email,(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }if(results.length===0){
            return res.status(404).json({message:"user not found"})
        }
        const user= results[0]
        const passwordMatch = bcrypt.compareSync(password,user.password)
        if(!passwordMatch){
            return res.status(401).json({message:"invalid password"})
        }

        const token = jwt.sign({ id: user.id},"ayoosekolah",{
            expiresIn: 86400,

        });
        const dataUser={
            username: user.username,
            email: user.email,
            role_id: user.role_id
        }

        res.status(200).json({auth: true,dataUser,token});
    })  
}
const updateUser =(req,res)=>{
    const {id}= req.params
   
    const {username,email,password,nama_lengkap,alamat,role_id}= req.body
    User.updateUser(id,username,email,password,nama_lengkap,alamat,role_id,(err,results)=>{
        if(err){
            return res.status(500).json({error:err.message})
        }
        if(results.affectedRows===0){
            return res.status(404).json({message:"user not found"})
        }
        else{
            return res.status(200).json({message:"user updated successfully",results})
        }})

}
module.exports={registerUser,getUser,getUserById,login,deleteUser,updateUser}