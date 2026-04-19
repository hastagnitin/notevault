const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const store = require('../data/store');

const router = express.Router();

// Use shared store
const notesDB = store.notes;

// Multer for file upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Helper to extract text from different file types
async function extractText(file) {
  if (!file) return null;
  
  const mimeType = file.mimetype;
  console.log('[extractText] File type:', mimeType, 'Size:', file.buffer.length);
  
  // PDF files
  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(file.buffer);
      console.log('[extractText] PDF extracted, length:', data.text?.length);
      console.log('[extractText] PDF preview:', data.text?.substring(0, 100));
      return validateText(data.text, 'PDF');
    } catch (err) {
      console.error('[extractText] PDF parsing failed:', err.message);
      return null;
    }
  }
  
  // DOCX files - use mammoth for proper extraction
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      console.log('[extractText] DOCX extracted, length:', result.value?.length);
      console.log('[extractText] DOCX preview:', result.value?.substring(0, 100));
      return validateText(result.value, 'DOCX');
    } catch (err) {
      console.error('[extractText] DOCX parsing failed:', err.message);
      return null;
    }
  }
  
  // Text files
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    const text = file.buffer.toString('utf-8');
    return validateText(text, 'TXT');
  }
  
  // Reject other file types
  console.error('[extractText] Unsupported file type:', mimeType);
  return null;
}

// Validate extracted text - reject if it looks like binary
function validateText(text, source) {
  if (!text || text.trim().length === 0) {
    console.error(`[validateText] ${source}: Empty text`);
    return null;
  }
  
  // Check for binary indicators
  const binaryIndicators = ['PK\x03\x04', '[Content_Types].xml', 'word/document.xml', '\x00\x01\x02'];
  for (const indicator of binaryIndicators) {
    if (text.includes(indicator)) {
      console.error(`[validateText] ${source}: Contains binary data (${indicator})`);
      return null;
    }
  }
  
  // Check if mostly readable ASCII
  const readableChars = text.match(/[\x20-\x7E\n\r\t]/g)?.length || 0;
  const ratio = readableChars / text.length;
  if (ratio < 0.8) {
    console.error(`[validateText] ${source}: Too many non-readable chars (ratio: ${ratio})`);
    return null;
  }
  
  console.log(`[validateText] ${source}: Valid text, length: ${text.length}`);
  return text.trim();
}

// POST /api/notes/upload - Handle file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('[notes/upload] Request received. Body:', req.body);
    console.log('[notes/upload] File:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'No file');
    
    const title = req.body.title || req.file?.originalname || 'Untitled';
    
    // Get content from file or body
    let content = req.body.content;
    if (req.file) {
      // Properly extract text based on file type
      content = await extractText(req.file);
    }
    
    if (!content || content.trim().length === 0) {
      console.error('[notes/upload] No content extracted');
      return res.status(400).json({ error: 'Could not extract text from file. Try a text file or PDF.' });
    }
    
    console.log('[notes/upload] Extracted content length:', content.length);
    console.log('[notes/upload] Content preview:', content.substring(0, 200) + '...');

    const note = {
      id: uuidv4(),
      title,
      content,
      fileType: req.file?.mimetype || 'text/plain',
      createdAt: new Date().toISOString()
    };

    notesDB.push(note);
    console.log('[notes/upload] Created note:', note.id, 'Title:', note.title);
    console.log('[notes/upload] Total notes in DB:', notesDB.length);

    res.status(201).json({
      id: note.id,
      title: note.title,
      fileType: note.fileType,
      content: note.content,
      createdAt: note.createdAt
    });
  } catch (err) {
    console.error('[notes/upload] Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// GET /api/notes
router.get('/', async (req, res) => {
  try {
    const notes = notesDB.map(note => ({
      id: note.id,
      title: note.title,
      fileType: note.fileType,
      createdAt: note.createdAt
    }));

    res.json({ notes });
  } catch (err) {
    console.error('[notes/list] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[notes/get] Looking for note ID:', id);
    console.log('[notes/get] Total notes in DB:', notesDB.length);
    
    const note = notesDB.find(n => n.id === id);

    if (!note) {
      console.error('[notes/get] Note not found. Available IDs:', notesDB.map(n => n.id));
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('[notes/get] Found note:', note.title);
    res.json(note);
  } catch (err) {
    console.error('[notes/get] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = notesDB.findIndex(n => n.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    notesDB.splice(index, 1);
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('[notes/delete] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
