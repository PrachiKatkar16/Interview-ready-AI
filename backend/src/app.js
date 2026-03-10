const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes')
const interviewRoutes = require('./routes/interview.routes')

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "https://interview-ready-ai-one.vercel.app"
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// app.options('*', cors())

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/interview', interviewRoutes)

module.exports = app
