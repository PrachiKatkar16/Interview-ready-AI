const jwt=require('jsonwebtoken')
const tokenBlacklistModel=require('../models/blacklist.model')

async function authUser(req,res,next){
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({
            message:"token not provided"
        })
    }
    const isTokenBlacklisted=await tokenBlacklistModel.findOne({token}) 
    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"token is invalid"
        })
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user=decoded
        next()
        
    } catch (error) {
        return res.status(401).json({
            message:"Invalid token",
        })
    }
}
module.exports={authUser}