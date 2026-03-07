require('dotenv').config()
const app=require('./src/app')
const connectDB=require('./src/config/db')
// const {resume,selfDescription,jobDescription}=require('./src/services/temp')
// const generateInterviewReport=require('./src/services/ai.service')
const generateInterviewReport=require('./src/services/ai.service')

connectDB()

generateInterviewReport()


app.listen(3000,()=>{
    console.log("Server started on port 3000")
})