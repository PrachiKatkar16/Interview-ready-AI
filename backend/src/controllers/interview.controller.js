const pdfParse=require('pdf-parse')
const {generateInterviewReport,generateResumePdf}=require('../services/ai.service')
const interviewReportModel=require('../models/interviewReport.model')


async function generateInterviewReportController(req, res) {
    // const resumeFile = req.file;
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
    const { selfDescription, jobDescription } = req.body;

    const interviewReportByAi=await generateInterviewReport({
        resume:resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport= await interviewReportModel.create({
        user:req.user._id,
        resume:resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(201).json({
        message:"Interview report generated successfully",
        interviewReport
    })
}

async function getInterviewReportByIdController(req,res){
    const {interviewId}=req.params
    console.log(interviewId)
    const interviewReport=await interviewReportModel.findOne({
        _id:interviewId,
        user:req.user._id
    })
    console.log(interviewReport)
    if(!interviewReport){
        return res.status(404).json({
            message:"Interview report not found"
        })
    }
    res.status(200).json({
        message:"Interview report fetched sucessfully",
        interviewReport
    })
}

async function getInterviewReportsController(req,res){
    const interviewReports=await interviewReportModel.find({user:req.user._id}).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    if(!interviewReports){
        return res.status(404).json({
            message:"Interview report not found"
        })
    }

    res.status(200).json({
        message:"Interview reports fetched sucessfully",
        interviewReports
    })
    

}
async function generateResumePdfController(req, res) {
  try {

    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found."
      })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription
    })

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
      "Content-Length": pdfBuffer.length
    })

    return res.send(pdfBuffer)

  } catch (error) {

    console.error("Resume PDF generation error:", error)

    return res.status(500).json({
      message: "Failed to generate resume PDF"
    })

  }
}


module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getInterviewReportsController,
    generateResumePdfController
}