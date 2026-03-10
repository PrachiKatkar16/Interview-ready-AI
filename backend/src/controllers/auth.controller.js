const mongoose=require('mongoose')
const userModel=require('../models/user.model')
const blacklistTokenModel=require('../models/blacklist.model')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')


async function registerUser(req,res){
    const {username,email,password}=req.body
    if(!username || !email || !password){
        return res.status(400).json({
            message:"All fields are required"
        })
    }
    const isAlreadyExist=await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })
    if(isAlreadyExist){
        return res.status(409).json({
            message:"User already exist"
        })
    }
    const hashedPassword=await bcrypt.hash(password,10)
    const user=await userModel.create({
        username,
        email,
        password:hashedPassword
    })

    const token=jwt.sign({
        userId:user._id,
        username:user.username
    },process.env.JWT_SECRET_KEY)

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None"
    })
    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })

}
async function loginUser(req,res){
    const {email,password}=req.body
    if(!email || !password){
        return res.status(400).json({
            message:"All fields are required"
        })
    }
    const user=await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }
    const token=jwt.sign({
        id:user._id,
        username:user.username
    },process.env.JWT_SECRET_KEY)

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None"
})
    res.status(200).json({
        message:"User logged in sucessfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

async function logoutUser(req,res){
    const token=req.cookies.token
    if(token){
        await blacklistTokenModel.create({token})
    }
    res.clearCookie("token")
    res.status(200).json({
        message:"User logged out successfully"
    })
}

async function getMeController(req,res){
    const user=await userModel.findById(req.user.id)
    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}
module.exports={
    registerUser,
    loginUser,
    logoutUser,
    getMeController

}
