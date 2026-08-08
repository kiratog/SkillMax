import express from 'express';
import multer from 'multer';
import { extractResumeText } from '../controllers/resumeController.js';

const router = express.Router();

// Memory storage for PDF upload processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max limit
});

router.post('/upload', upload.single('resume'), extractResumeText);

export default router;
