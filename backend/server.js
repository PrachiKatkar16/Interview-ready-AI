require('dotenv').config()
const app=require('./src/app')
const connectDB=require('./src/config/db')
const invokeGeminiAi=require('./src/services/ai.service').invokeGeminiAi

connectDB()

invokeGeminiAi()

app.listen(3000,()=>{
    console.log("Server started on port 3000")
})