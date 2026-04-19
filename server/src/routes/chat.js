const express = require('express');
const { body, validationResult } = require('express-validator');
const { askQuestion, getLastProvider } = require('../utils/aiService');
const store = require('../data/store');

const router = express.Router();

// Use shared store
const notesDB = store.notes;
const chatDB = store.chats;

// Validation rules (relaxed)
const askValidation = [
  body('noteId').notEmpty().withMessage('noteId is required.'),
  body('question').isString().trim().notEmpty().withMessage('question is required.'),
];

// POST /api/chat/ask
router.post('/ask', askValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[chat/ask] Validation failed:', errors.array());
    return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
  }

  let note = null;
  try {
    const { noteId, question } = req.body;
    console.log('[chat/ask] Request received. noteId:', noteId, 'question:', question);
    console.log('[chat/ask] Total notes in DB:', notesDB.length);

    // 1. Fetch note from in-memory DB
    note = notesDB.find(n => n.id === noteId);
    if (!note) {
      console.error('[chat/ask] Note not found. Available IDs:', notesDB.map(n => n.id));
      return res.json({ success: false, error: 'Note not found.' });
    }

    console.log('[chat/ask] Found note:', note.title, 'Content length:', note.content?.length);
    console.log('[chat/ask] Content preview:', note.content?.substring(0, 300) + '...');

    // 2. Call AI with note content as context
    const noteContent = note.content || '';
    console.log('[chat/ask] Passing content to AI, length:', noteContent.length);
    let answer = await askQuestion(noteContent, question);
    
    // Log which AI provider was used
    console.log('[chat/ask] AI provider used:', getLastProvider());

    // 3. Save chat to in-memory storage
    const newMessages = [
      { role: 'user', content: question, timestamp: new Date().toISOString() },
      { role: 'assistant', content: answer, timestamp: new Date().toISOString() },
    ];

    if (!chatDB[noteId]) {
      chatDB[noteId] = [];
    }
    chatDB[noteId].push(...newMessages);

    console.log('[chat/ask] Answer generated successfully');
    return res.json({ success: true, answer, noteId, question, provider: getLastProvider() });
  } catch (err) {
    console.error('[chat/ask] ROUTE ERROR:', err);
    // Never return 500, always return success: false with message
    return res.json({ 
      success: false, 
      message: 'AI temporarily unavailable. Please try again.',
      error: err.message
    });
  }
});

// GET /api/chat/:noteId/history
router.get('/:noteId/history', async (req, res) => {
  try {
    const { noteId } = req.params;
    const messages = chatDB[noteId] || [];
    res.json({ messages });
  } catch (err) {
    console.error('[chat/history] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
