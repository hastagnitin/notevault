const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateCheatsheet, getLastProvider } = require('../utils/aiService');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/generate', [
  body('noteId').notEmpty().withMessage('noteId is required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
  }

  try {
    const { noteId } = req.body;
    console.log('[cheatsheet/generate] Request received. noteId:', noteId);

    const { data: note, error: fetchError } = await supabase.from('notes').select('*').eq('id', noteId).single();
    if (fetchError || !note) {
      console.error('[cheatsheet/generate] Note not found.', fetchError?.message);
      return res.json({ success: false, error: 'Note not found.' });
    }

    const noteContent = note.content || '';
    if (noteContent.length < 10) {
      return res.json({ success: false, error: 'Note content too short. Please upload a note with more content.' });
    }
    
    // Check if cheatsheet already exists for this note
    const { data: existingCheatsheet } = await supabase
      .from('cheatsheets')
      .select('content')
      .eq('note_id', noteId)
      .single();

    if (existingCheatsheet && existingCheatsheet.content) {
      console.log('[cheatsheet/generate] Returning cached cheatsheet.');
      return res.json({ 
        success: true, 
        noteId, 
        cheatsheet: existingCheatsheet.content, 
        provider: 'Cache (Supabase)' 
      });
    }

    const cheatsheet = await generateCheatsheet(noteContent);
    
    // Save to database
    const { error: insertError } = await supabase.from('cheatsheets').insert([{
      note_id: noteId,
      content: cheatsheet
    }]);

    if (insertError) {
      console.warn('[cheatsheet/generate] Could not save to DB (ensure table exists):', insertError.message);
    }

    return res.json({ success: true, noteId, cheatsheet, provider: getLastProvider() });
  } catch (err) {
    console.error('[cheatsheet/generate] ROUTE ERROR:', err);
    return res.json({ 
      success: false, 
      message: 'AI temporarily unavailable. Please try again.',
      error: err.message
    });
  }
});

module.exports = router;
