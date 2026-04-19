const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateCheatsheet, getLastProvider } = require('../utils/aiService');
const store = require('../data/store');

const router = express.Router();
const notesDB = store.notes;

// ─── POST /api/cheatsheet/generate ───────────────────────────────────────────
/**
 * Generate a structured one-page cheat sheet from a note's content.
 * Body: { noteId }
 */
router.post(
  '/generate',
  [body('noteId').notEmpty().withMessage('noteId is required.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[cheatsheet/generate] Validation failed:', errors.array());
      return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
    }

    let note = null;
    try {
      const { noteId } = req.body;
      console.log('[cheatsheet/generate] Request received. noteId:', noteId);
      console.log('[cheatsheet/generate] Total notes in DB:', notesDB.length);

      // Get note content
      note = notesDB.find(n => n.id === noteId);
      if (!note) {
        console.error('[cheatsheet/generate] Note not found. Available IDs:', notesDB.map(n => n.id));
        return res.json({ success: false, error: 'Note not found.' });
      }

      console.log('[cheatsheet/generate] Found note:', note.title, 'Content length:', note.content?.length);
      console.log('[cheatsheet/generate] Content preview:', note.content?.substring(0, 300) + '...');

      const noteContent = note.content || '';
      
      if (noteContent.length < 10) {
        return res.json({ 
          success: false, 
          error: 'Note content too short. Please upload a note with more content.' 
        });
      }
      
      console.log('[cheatsheet/generate] Passing content to AI, length:', noteContent.length);
      
      console.log('[cheatsheet/generate] Calling AI to generate cheatsheet...');
      // Call AI to generate cheatsheet
      const cheatsheet = await generateCheatsheet(noteContent);
      console.log('[cheatsheet/generate] Cheatsheet generated. Length:', cheatsheet?.length);
      console.log('[cheatsheet/generate] AI provider used:', getLastProvider());

      console.log('[cheatsheet/generate] Cheatsheet generated successfully for note:', noteId);
      return res.json({ success: true, noteId, cheatsheet, provider: getLastProvider() });
    } catch (err) {
      console.error('[cheatsheet/generate] ROUTE ERROR:', err);
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
