import { getInterviewReportById,getInterviewReports,generateInterviewReport} from "../services/interview.api";
import { useContext } from "react";
import { InterviewContext } from "../interview.context";

export const useInterview=()=>{
    const context=useContext(InterviewContext)

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading,setLoading,report,setReport,reports,setReports}=context

    const generateReport=async({jobDescription,selfDescription,resumeFile})=>{
        setLoading(true)
        let response=null
        try {
            response=await generateInterviewReport({jobDescription,selfDescription,resumeFile})
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }
        return response.interviewReport
    }
    const getReportById=async(interviewId)=>{
        setLoading(true)
        let response=null
        try {
            response=await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally{
            setLoading(false)
        }
        return response.interviewReport
    }
    const getReports=async()=>{
        setLoading(true)
        let response=null
        try {
            response=await getInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }
        return response.interviewReports
    }
    return {loading,report,reports,generateReport,getReportById,getReports}
}