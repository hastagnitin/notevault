const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { generateQuiz, getLastProvider } = require('../utils/aiService');
const store = require('../data/store');

const router = express.Router();
const notesDB = store.notes;
const quizDB = store.quizzes;

/**
 * Parse MCQ response from Ollama into a structured array
 * Handles both old format (1., 2.) and new format (Q1., Q2.)
 */
function parseMCQResponse(raw) {
  const questions = [];
  
  // Split on question boundaries: "Q1.", "Q2.", "1.", "2." etc.
  const blocks = raw.split(/\n(?=(?:Q?\d+[.):]\s))/i).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 6) continue; // question + 4 options + answer

    // Match question line: "Q1. text", "1. text", or "Question 1: text"
    const questionMatch = lines[0].match(/^(?:Q?\d+[.):]\s*)?(.+)$/i);
    const questionText = questionMatch ? questionMatch[1].trim() : lines[0].trim();
    
    const options = [];
    let correct = '';
    let explanation = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Match option lines like "A) option text" or "A. option text"
      const optionMatch = line.match(/^([A-D])[).]\s*(.+)/i);
      if (optionMatch) {
        options.push({ label: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() });
      }
      
      // Match answer lines: "✓ Correct: A", "Answer: A", "Correct: B", "✓ B"
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

  console.log('[parseMCQResponse] Parsed', questions.length, 'questions');
  return questions;
}

// POST /api/quiz/generate
router.post(
  '/generate',
  [
    body('noteId').notEmpty().withMessage('noteId is required.'),
    body('questionCount').optional().isInt({ min: 1, max: 10 }).withMessage('questionCount must be 1-10')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[quiz/generate] Validation failed:', errors.array());
      return res.json({ success: false, error: 'Validation failed.', details: errors.array() });
    }

    let note = null;
    try {
      const { noteId, questionCount = 5 } = req.body;
      console.log('[quiz/generate] Request received. noteId:', noteId, 'questionCount:', questionCount);
      console.log('[quiz/generate] Total notes in DB:', notesDB.length);

      // Get note content
      note = notesDB.find(n => n.id === noteId);
      if (!note) {
        console.error('[quiz/generate] Note not found. Available IDs:', notesDB.map(n => n.id));
        return res.json({ success: false, error: 'Note not found.' });
      }

      console.log('[quiz/generate] Found note:', note.title, 'Content length:', note.content?.length);

      const noteContent = note.content?.substring(0, 2500) || 'No content';
      
      if (noteContent.length < 20) {
        return res.json({ 
          success: false, 
          error: 'Note content too short. Please upload a longer note.' 
        });
      }
      
      console.log('[quiz/generate] Calling AI to generate', questionCount, 'questions...');
      // Call AI to generate quiz with dynamic count
      const rawResponse = await generateQuiz(noteContent, questionCount);
      console.log('[quiz/generate] AI response received. Length:', rawResponse?.length);
      console.log('[quiz/generate] AI provider used:', getLastProvider());
      
      // Parse the text response from Ollama
      let questions = parseMCQResponse(rawResponse);
      console.log('[quiz/generate] Parsed questions:', questions?.length);

      // Ensure questions is an array
      if (!Array.isArray(questions) || questions.length === 0) {
        console.log('[quiz/generate] No parsed questions, using fallback');
        // Generate fallback questions from sentences
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
      
      // Ensure at least one question
      if (questions.length === 0) {
        questions = [{
          question: 'Sample question: What is the main topic of your notes?',
          options: ['Main topic', 'Secondary topic', 'Related concept', 'None'],
          correctAnswer: 'A',
          explanation: 'Check your notes for the main topic.'
        }];
      }

      // Save quiz to memory
      const quizId = uuidv4();
      const quizData = {
        id: quizId,
        note_id: noteId,
        questions,
        generated_at: new Date().toISOString()
      };
      quizDB[quizId] = quizData;

      console.log('[quiz/generate] Generated quiz:', quizId);
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
      // Never return 500, always return success: false with message
      return res.json({ 
        success: false, 
        message: 'AI temporarily unavailable. Please try again.',
        error: err.message
      });
    }
  }
);

// GET /api/quiz/:quizId
router.get('/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = quizDB[quizId];
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

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

    const quizzes = Object.values(quizDB).filter(q => q.note_id === noteId);
    res.json({ quizzes });
  } catch (err) {
    console.error('[quiz/by-note] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
