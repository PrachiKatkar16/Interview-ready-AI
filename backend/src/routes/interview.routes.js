const express=require('express')
const authMiddleware=require('../middlewares/auth.middleware')
const interviewController=require('../controllers/interview.controller')
const upload=require('../middlewares/file.middleware')

const interviewRouter=express.Router()

interviewRouter.post("/",authMiddleware.authUser,upload.upload.single('resume'),interviewController.generateInterviewReportController)
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.getInterviewReportByIdController)
interviewRouter.get('/',authMiddleware.authUser,interviewController.getInterviewReportsController)

module.exports=interviewRouter