const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateKnowledgeGraph, getLastProvider } = require('../utils/aiService');
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
    console.log('[graph/generate] Request received. noteId:', noteId);

    const { data: note, error: fetchError } = await supabase.from('notes').select('*').eq('id', noteId).single();
    if (fetchError || !note) {
      console.error('[graph/generate] Note not found.', fetchError?.message);
      return res.json({ success: false, error: 'Note not found.' });
    }

    const noteContent = note.content || '';
    if (noteContent.length < 10) {
      return res.json({ success: false, error: 'Note content too short to generate graph.' });
    }
    
    // Check if graph already exists (Assuming we create a graph_data table. For now, regenerating each time unless cached)
    // We could add `graphs` table in Supabase just like cheatsheets to speed it up
    const { data: existingGraph } = await supabase
      .from('graphs')
      .select('graph_data')
      .eq('note_id', noteId)
      .single();

    if (existingGraph && existingGraph.graph_data) {
      console.log('[graph/generate] Returning cached graph.');
      return res.json({ 
        success: true, 
        noteId, 
        graph: existingGraph.graph_data, 
        provider: 'Cache (Supabase)' 
      });
    }

    const graphResponse = await generateKnowledgeGraph(noteContent);
    
    // Save to database
    const { error: insertError } = await supabase.from('graphs').insert([{
      note_id: noteId,
      graph_data: graphResponse
    }]);

    if (insertError) {
      console.warn('[graph/generate] Could not save to DB (ensure table exists):', insertError.message);
    }

    return res.json({ success: true, noteId, graph: graphResponse, provider: getLastProvider() });
  } catch (err) {
    console.error('[graph/generate] ROUTE ERROR:', err);
    return res.json({ 
      success: false, 
      message: 'AI temporarily unavailable. Please try again.',
      error: err.message
    });
  }
});

module.exports = router;
