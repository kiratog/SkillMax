import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

// @desc    Extract plain text from uploaded PDF resume
// @route   POST /api/resume/upload
// @access  Public
export const extractResumeText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are supported' });
    }

    // Parse PDF using PDFParse instance
    const parser = new pdfModule.PDFParse({ data: req.file.buffer });
    await parser.load();
    const pdfData = await parser.getText();

    const cleanText = pdfData && pdfData.text ? pdfData.text.replace(/\r\n/g, '\n').trim() : '';

    if (!cleanText) {
      return res.status(400).json({ message: 'Could not extract text from the PDF file. It might be scanned or empty.' });
    }

    return res.json({
      success: true,
      filename: req.file.originalname,
      pages: pdfData.total || (pdfData.pages ? pdfData.pages.length : 1),
      textLength: cleanText.length,
      extractedText: cleanText,
    });
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    return res.status(500).json({
      message: 'Failed to extract text from PDF',
      error: error.message,
    });
  }
};
