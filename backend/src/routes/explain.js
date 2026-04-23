const express = require('express');
const { body, validationResult } = require('express-validator');
const { explainText, getLastProvider } = require('../utils/aiService');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/', [
  body('noteId').notEmpty().withMessage('noteId is required.'),
  body('selectedText').isString().trim().notEmpty().withMessage('selectedText is required.').isLength({ max: 3000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[explain] Validation failed:', errors.array());
    return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
  }

  try {
    const { noteId, selectedText } = req.body;
    console.log('[explain] Request received. noteId:', noteId, 'selectedText length:', selectedText?.length);

    const { data: note, error: fetchError } = await supabase.from('notes').select('*').eq('id', noteId).single();
    if (fetchError || !note) {
      console.error('[explain] Note not found.', fetchError?.message);
      return res.json({ success: false, error: 'Note not found.' });
    }

    const noteContent = note.content?.substring(0, 3000) || '';
    
    // Check cache
    const { data: existingExplanation } = await supabase
      .from('explanations')
      .select('explanation_content')
      .eq('note_id', noteId)
      .eq('highlighted_text', selectedText)
      .single();

    if (existingExplanation && existingExplanation.explanation_content) {
      console.log('[explain] Returning cached explanation.');
      return res.json({ 
        success: true, 
        explanation: existingExplanation.explanation_content, 
        selectedText, 
        provider: 'Cache (Supabase)' 
      });
    }

    const explanation = await explainText(selectedText, noteContent);
    
    // Save to cache
    const { error: insertError } = await supabase.from('explanations').upsert([{
      note_id: noteId,
      highlighted_text: selectedText,
      explanation_content: explanation
    }]);

    if (insertError) {
      console.warn('[explain] Could not save to DB:', insertError.message);
    }
    
    return res.json({ success: true, explanation, selectedText, provider: getLastProvider() });
  } catch (err) {
    console.error('[explain] ROUTE ERROR:', err);
    return res.json({ 
      success: false, 
      message: 'AI temporarily unavailable. Please try again.',
      error: err.message
    });
  }
});

module.exports = router;
