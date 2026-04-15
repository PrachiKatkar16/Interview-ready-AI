const pdfParse=require('pdf-parse')
const {generateInterviewReport,generateResumePdf,callAI}=require('../services/ai.service')
const interviewReportModel=require('../models/interviewReport.model')
const { Document, Packer, Paragraph, TextRun } = require("docx")


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
// START INTERVIEW
async function startInterview(req,res) {
  try {
    const { jd, resume, self } = req.body

    const prompt = `
You are a professional interviewer.

Candidate Details:
- Job Description: ${jd}
- Resume: ${resume}
- Self Description: ${self}

Start the interview.
Ask the first question (simple intro or resume-based).
Keep it natural.
`

    const question = await callAI(prompt)

if (!question) {
  return res.status(500).json({
    error: "AI did not return question"
  })
}

res.json({ question })

  } catch (err) {
    console.error(err)
    res.status(500).json({ 
      error: err.message,
      stack: err.stack 
    })
  }
}

//  NEXT QUESTION (CORE LOGIC)
async function nextQuestion(req, res) {
  try {
    const { conversation } = req.body

    if (!conversation || conversation.length === 0) {
      return res.status(400).json({
        error: "Conversation is empty"
      })
    }

    // LIMIT QUESTIONS (example: 10)
    const questionCount = conversation.filter(c => c.role === "ai").length

    if (questionCount >= 10) {
      return res.json({
        completed: true,
        message: "Interview completed"
      })
    }

    // existing logic
    const formattedConversation = conversation
      .map(c => `${c.role}: ${c.message}`)
      .join("\n")

    const prompt = `
You are a professional interviewer.

Conversation so far:
${formattedConversation}

Rules:
- Ask next relevant question
- Do NOT repeat
- Keep it short
`

    const question = await callAI(prompt)

    res.json({ question })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to generate next question" })
  }
}


// END INTERVIEW (REPORT)
async function endInterview(req, res) {
  try {
    const { conversation } = req.body

    if (!conversation || conversation.length <= 1) {
      return res.status(400).json({
        error: "Interview not completed. No sufficient data."
      })
    }

    const formattedConversation = conversation
      .map(c => `${c.role}: ${c.message}`)
      .join("\n")

    const prompt = `
You are a strict interview evaluator.

Interview conversation:
${formattedConversation}

IMPORTANT RULES:
- If candidate has given very few answers → say interview incomplete
- If answers are weak → give honest negative feedback
- DO NOT give fake positive feedback
- Base evaluation ONLY on actual answers

Generate:
1. Strengths (only if real)
2. Weaknesses (mandatory)
3. Suggestions (actionable)
4. Score out of 10 (be strict)

If interview is incomplete, clearly say:
"Interview was not properly attempted"
`

    const report = await callAI(prompt)

    return res.status(200).json({
      report: report,
      success: true
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to generate report" })
  }
}

async function downloadInterviewReport(req, res) {
  try {
    const { report } = req.body

    if (!report) {
      return res.status(400).json({
        error: "Report text is required"
      })
    }

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Interview Report",
                  bold: true,
                  size: 32,
                }),
              ],
            }),

            new Paragraph(" "),
            new Paragraph(report),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=Interview_Report.docx",
    })

    return res.send(buffer)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to generate report download" })
  }
}


module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getInterviewReportsController,
    generateResumePdfController,
    startInterview,
    nextQuestion,
    endInterview,
    downloadInterviewReport
}