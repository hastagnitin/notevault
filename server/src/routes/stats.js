const express = require('express');
const store = require('../data/store');
const router = express.Router();

router.get('/user/stats', (req, res) => {
  const totalNotes = store.notes.length;
  // Sum sessions or use placeholders for now
  const totalStudyHours = store.sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60 || 48.5; 
  const filesSynced = store.notes.filter(n => n.fileType !== 'text/plain').length;
  
  // Calculate avg quiz score
  const quizScores = Object.values(store.quizzes).map(q => q.score).filter(s => s !== undefined);
  const avgQuizScore = quizScores.length ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 82;

  res.json({
    totalNotes,
    totalStudyHours: parseFloat(totalStudyHours.toFixed(1)),
    filesSynced,
    avgQuizScore: Math.round(avgQuizScore),
    streak: 12
  });
});

router.get('/notes/recent', (req, res) => {
  const recent = store.notes
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  res.json({ recent });
});

router.get('/study/progress', (req, res) => {
  // Returns mockup calendar data for now
  const today = new Date();
  const progress = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    progress.push({ date: d.toISOString().split('T')[0], count: Math.floor(Math.random() * 5) });
  }
  res.json({ progress });
});

module.exports = router;
