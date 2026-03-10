const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const interviewRoutes = require('./routes/interview.routes');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://interview-ready-ai-one.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same‑origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      // Reflect the request origin in the response header
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Handle preflight requests (optional, the above already does it)
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

module.exports = app;