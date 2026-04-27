const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { generateQuiz, getLastProvider } = require('../utils/aiService');
const store = require('../data/store');

const router = express.Router();
const quizDB = store.quizzes;

router.post(
  '/generate',
  [
    body('noteId').notEmpty().withMessage('noteId is required.'),
    body('questionCount').optional().isInt({ min: 1, max: 10 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ success: false, error: 'Validation failed.' });

    try {
      const { noteId, questionCount = 5 } = req.body;
      const note = store.notes.find(n => n.id === noteId);
      if (!note) return res.json({ success: false, error: 'Note not found.' });

      const rawResponse = await generateQuiz(note.content, questionCount);
      
      let questions = [];
      try {
        // AI is instructed to return straight JSON
        const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        questions = JSON.parse(cleanJson);
      } catch (e) {
        console.error('Failed to parse AI quiz JSON:', e);
        // Fallback: simple question from title
        questions = [{
          question: `What is the primary focus of "${note.title}"?`,
          options: ['Core concepts', 'Methodology', 'Results', 'Historical context'],
          correctAnswer: 'A',
          explanation: 'Check the foundational sections of your note.'
        }];
      }

      const quizId = uuidv4();
      quizDB[quizId] = { id: quizId, noteId, questions, createdAt: new Date().toISOString() };

      res.json({ success: true, id: quizId, questions, provider: getLastProvider() });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  }
);

router.get('/:quizId', (req, res) => {
  const quiz = quizDB[req.params.quizId];
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

module.exports = router;
