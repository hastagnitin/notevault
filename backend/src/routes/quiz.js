const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { generateQuiz, getLastProvider } = require('../utils/aiService');
const supabase = require('../config/supabase');

const router = express.Router();

function parseMCQResponse(raw) {
  const questions = [];
  const blocks = raw.split(/\n(?=(?:Q?\d+[.):]\s))/i).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 6) continue;

    const questionMatch = lines[0].match(/^(?:Q?\d+[.):]\s*)?(.+)$/i);
    const questionText = questionMatch ? questionMatch[1].trim() : lines[0].trim();
    
    const options = [];
    let correct = '';
    let explanation = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const optionMatch = line.match(/^([A-D])[).]\s*(.+)/i);
      if (optionMatch) {
        options.push({ label: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() });
      }
      const answerMatch = line.match(/(?:[✓✔]\s*)?(?:answer|correct)?[:\s]*([A-D])/i);
      if (answerMatch) correct = answerMatch[1].toUpperCase();
    }

    if (questionText && options.length === 4 && correct) {
      questions.push({ 
        question: questionText, 
        options: options.map(opt => opt.text), 
        correctAnswer: correct,
        explanation: explanation || `The correct answer is ${correct}`
      });
    }
  }
  return questions;
}

// POST /api/quiz/generate
router.post('/generate', [
  body('noteId').notEmpty().withMessage('noteId is required.'),
  body('questionCount').optional().isInt({ min: 1, max: 10 }).withMessage('questionCount must be 1-10')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[quiz/generate] Validation failed:', errors.array());
    return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
  }

  try {
    const { noteId, questionCount = 5, difficulty = 'Medium' } = req.body;
    console.log('[quiz/generate] Request received. noteId:', noteId, 'questionCount:', questionCount, 'difficulty:', difficulty);

    const { data: note, error: fetchError } = await supabase.from('notes').select('*').eq('id', noteId).single();
    if (fetchError || !note) {
      console.error('[quiz/generate] Note not found.', fetchError?.message);
      return res.json({ success: false, error: 'Note not found.' });
    }

    const noteContent = note.content?.substring(0, 2500) || 'No content';
    if (noteContent.length < 20) {
      return res.json({ success: false, error: 'Note content too short. Please upload a longer note.' });
    }
    
    const rawResponse = await generateQuiz(noteContent, questionCount, difficulty);
    let questions = parseMCQResponse(rawResponse);

    if (!Array.isArray(questions) || questions.length === 0) {
      const sentences = noteContent.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 3);
      questions = sentences.map((sentence, i) => ({
        question: `What does this note say about "${sentence.trim().split(' ').slice(0, 3).join(' ')}..."?`,
        options: [
          sentence.trim().substring(0, 50),
          'Related information from notes',
          'Additional concept mentioned',
          'None of the above'
        ],
        correctAnswer: 'A',
        explanation: `According to your notes: ${sentence.trim()}`
      }));
    }
    
    if (questions.length === 0) {
      questions = [{
        question: 'Sample question: What is the main topic of your notes?',
        options: ['Main topic', 'Secondary topic', 'Related concept', 'None'],
        correctAnswer: 'A',
        explanation: 'Check your notes for the main topic.'
      }];
    }

    const quizId = uuidv4();
    const quizData = {
      id: quizId,
      note_id: noteId,
      questions,
      generated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase.from('quizzes').insert([{
      id: quizId,
      note_id: noteId,
      questions: questions
    }]);

    if (insertError) {
      console.warn('[quiz/generate] Could not save quiz to DB (ensure table exists):', insertError.message);
    }

    return res.json({ 
      success: true,
      id: quizId,
      noteId, 
      questions,
      generatedAt: quizData.generated_at,
      provider: getLastProvider()
    });
  } catch (err) {
    console.error('[quiz/generate] ROUTE ERROR:', err);
    return res.json({ 
      success: false, 
      message: 'AI temporarily unavailable. Please try again.',
      error: err.message
    });
  }
});

// GET /api/quiz/:quizId
router.get('/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { data: quiz, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
    
    if (error || !quiz) return res.status(404).json({ error: 'Quiz not found.' });
    res.json(quiz);
  } catch (err) {
    console.error('[quiz/get] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/quiz/note/:noteId
router.get('/note/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const { data: quizzes, error } = await supabase.from('quizzes').select('*').eq('note_id', noteId);
    
    if (error) {
      console.warn('[quiz/by-note] Error fetching quizzes:', error.message);
      return res.json({ quizzes: [] });
    }
    
    res.json({ quizzes: quizzes || [] });
  } catch (err) {
    console.error('[quiz/by-note] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
