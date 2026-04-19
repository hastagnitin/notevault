const express = require('express');
const { body, validationResult } = require('express-validator');
const { explainText, getLastProvider } = require('../utils/aiService');
const store = require('../data/store');

const router = express.Router();
const notesDB = store.notes;

// ─── POST /api/explain ────────────────────────────────────────────────────────
/**
 * Explain a selected passage from a note in simple terms.
 * Body: { noteId, selectedText }
 */
router.post(
  '/',
  [
    body('noteId').notEmpty().withMessage('noteId is required.'),
    body('selectedText')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('selectedText is required.')
      .isLength({ max: 3000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[explain] Validation failed:', errors.array());
      return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
    }

    let note = null;
    try {
      const { noteId, selectedText } = req.body;
      console.log('[explain] Request received. noteId:', noteId, 'selectedText length:', selectedText?.length);
      console.log('[explain] Total notes in DB:', notesDB.length);

      // Find note in memory
      note = notesDB.find(n => n.id === noteId);
      if (!note) {
        console.error('[explain] Note not found. Available IDs:', notesDB.map(n => n.id));
        return res.json({ success: false, error: 'Note not found.' });
      }

      console.log('[explain] Found note:', note.title);
      const noteContent = note.content?.substring(0, 3000) || '';
      
      console.log('[explain] Calling AI to explain text...');
      const explanation = await explainText(selectedText, noteContent);
      console.log('[explain] Explanation generated. Length:', explanation?.length);
      console.log('[explain] AI provider used:', getLastProvider());

      console.log('[explain] Explained text for note:', noteId);
      return res.json({ success: true, explanation, selectedText, provider: getLastProvider() });
    } catch (err) {
      console.error('[explain] ROUTE ERROR:', err);
      // Never return 500, always return success: false with message
      return res.json({ 
        success: false, 
        message: 'AI temporarily unavailable. Please try again.',
        error: err.message
      });
    }
  }
);

module.exports = router;
