const express=require('express')
const authController=require('../controllers/auth.controller')
const authMiddleware=require('../middlewares/auth.middleware')

const router=express.Router()

router.post('/register',authController.registerUser)
router.post('/login',authController.loginUser)
router.get('/logout',authController.logoutUser)

router.get('/get-me',authMiddleware.authUser,authController.getMeController)


module.exports=router;