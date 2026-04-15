const express=require('express')
const authMiddleware=require('../middlewares/auth.middleware')
const interviewController=require('../controllers/interview.controller')
const upload=require('../middlewares/file.middleware')

const interviewRouter=express.Router()

interviewRouter.post("/",authMiddleware.authUser,upload.upload.single('resume'),interviewController.generateInterviewReportController)
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.getInterviewReportByIdController)
interviewRouter.get('/',authMiddleware.authUser,interviewController.getInterviewReportsController)
interviewRouter.post('/resume/pdf/:interviewReportId',authMiddleware.authUser,interviewController.generateResumePdfController)
interviewRouter.post('/start-interview',interviewController.startInterview)
interviewRouter.post('/next-question',interviewController.nextQuestion)
interviewRouter.post('/end-interview',interviewController.endInterview)
interviewRouter.post('/download-report',interviewController.downloadInterviewReport)

module.exports=interviewRouter