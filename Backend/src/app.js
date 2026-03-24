const express = require('express');
const authRouter = require('./routes/auth.route.js');
const interviewRouter = require('./routes/interview.routes.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db.js');

const app = express();

// ✅ Allow both local dev and deployed frontend
const allowedOrigins = [
  'https://ai-interview-app-frontend.vercel.app',
  process.env.FRONTEND_URL, // set this in Vercel env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Connect DB before any route runs (works in serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
