import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'ok',
    message: 'SkillMax API Backend operational',
    database: dbStatus,
  });
});

// Start Server immediately
app.listen(PORT, () => {
  console.log(`🚀 SkillMax Backend Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB asynchronously with 5s timeout
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillmax';
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ MongoDB connected successfully to database');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB Connection Notice:', err.message);
    console.warn('💡 Ensure MongoDB daemon is running locally (mongodb://localhost:27017) or update MONGO_URI in .env');
  });
