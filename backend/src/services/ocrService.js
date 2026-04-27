/**
 * OCR Service
 * Extracts text from images using Tesseract.js
 * Optimized for accuracy and performance
 */

const Tesseract = require('tesseract.js');
const { preprocessForOCR } = require('../utils/imageCompressor');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;

/**
 * Extract text from image file
 * @param {string} imagePath - Path to image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(imagePath) {
  console.log('[OCR] Starting text extraction from:', imagePath);
  
  try {
    // Preprocess image for better OCR
    const tempPath = path.join(os.tmpdir(), `ocr-${Date.now()}.jpg`);
    await preprocessForOCR(imagePath, tempPath);
    
    console.log('[OCR] Image preprocessed, running Tesseract...');
    
    // Run OCR
    const result = await Tesseract.recognize(
      tempPath,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`[OCR] Progress: ${Math.floor(m.progress * 100)}%`);
          }
        }
      }
    );

    // Cleanup temp file
    try {
      await fs.unlink(tempPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    const text = cleanExtractedText(result.data.text);
    console.log('[OCR] Extraction complete, text length:', text.length);
    
    return text;
  } catch (error) {
    console.error('[OCR] Error:', error.message);
    return ''; // Return empty string on failure
  }
}

/**
 * Clean extracted text
 * @param {string} text - Raw OCR text
 * @returns {string} - Cleaned text
 */
function cleanExtractedText(text) {
  return text
    .replace(/\r\n/g, '\n')          // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')       // Remove excessive newlines
    .replace(/\s{2,}/g, ' ')          // Remove excessive spaces
    .replace(/[^\x20-\x7E\n]/g, '')   // Remove non-printable chars
    .trim();
}

/**
 * Extract text from buffer (for camera captures)
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromBuffer(imageBuffer) {
  console.log('[OCR] Extracting from buffer, size:', imageBuffer.length);
  
  try {
    // Save buffer to temp file
    const tempPath = path.join(os.tmpdir(), `ocr-buffer-${Date.now()}.jpg`);
    await fs.writeFile(tempPath, imageBuffer);
    
    // Extract text
    const text = await extractTextFromImage(tempPath);
    
    // Cleanup
    try {
      await fs.unlink(tempPath);
    } catch (e) {
      // Ignore
    }
    
    return text;
  } catch (error) {
    console.error('[OCR] Buffer extraction error:', error.message);
    return '';
  }
}

module.exports = {
  extractTextFromImage,
  extractTextFromBuffer,
  cleanExtractedText
};
