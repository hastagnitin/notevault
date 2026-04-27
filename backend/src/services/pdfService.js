/**
 * PDF Service
 * Extracts text from PDF files
 */

const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Extract text from PDF file
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} - {text, pages, info}
 */
async function extractTextFromPDF(pdfPath) {
  console.log('[PDF] Starting extraction from:', pdfPath);
  
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);

    console.log('[PDF] Extraction complete:', {
      pages: data.numpages,
      textLength: data.text.length
    });

    return {
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('[PDF] Error:', error.message);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

/**
 * Extract text from PDF buffer
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<Object>} - {text, pages, info}
 */
async function extractTextFromBuffer(pdfBuffer) {
  console.log('[PDF] Extracting from buffer, size:', pdfBuffer.length);
  
  try {
    const data = await pdfParse(pdfBuffer);

    return {
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('[PDF] Buffer extraction error:', error.message);
    throw new Error('Failed to parse PDF buffer: ' + error.message);
  }
}

module.exports = {
  extractTextFromPDF,
  extractTextFromBuffer
};
