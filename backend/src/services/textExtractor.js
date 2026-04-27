const pdfParse = require('pdf-parse/lib/pdf-parse.js');
const Tesseract = require('tesseract.js');

/**
 * Extract plain text from a PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return {
    text: data.text.trim(),
    pageCount: data.numpages,
  };
}

/**
 * Extract text from an image buffer (JPEG / PNG) via Tesseract OCR.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromImage(buffer) {
  const {
    data: { text },
  } = await Tesseract.recognize(buffer, 'eng', {
    logger: () => {}, // suppress progress logs
  });
  return text.trim();
}

/**
 * Dispatch to the appropriate extractor based on MIME type.
 * @param {Buffer} buffer
 * @param {string} mimeType  e.g. "application/pdf", "image/png"
 * @returns {Promise<{ text: string, fileType: string, pageCount?: number }>}
 */
async function extractText(buffer, mimeType) {
  if (mimeType === 'application/pdf') {
    const { text, pageCount } = await extractTextFromPDF(buffer);
    return { text, fileType: 'pdf', pageCount };
  }

  if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
    const text = await extractTextFromImage(buffer);
    return { text, fileType: 'image' };
  }

  if (mimeType === 'text/plain') {
    return { text: buffer.toString('utf8').trim(), fileType: 'text' };
  }

  throw new Error(`Unsupported MIME type for text extraction: ${mimeType}`);
}

module.exports = {
  extractTextFromPDF,
  extractTextFromImage,
  extractText
};
