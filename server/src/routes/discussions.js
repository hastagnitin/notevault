const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../data/store');
const { askQuestion } = require('../utils/aiService');

const router = express.Router();

router.get('/active', (req, res) => {
  if (store.discussions.length === 0) {
    store.discussions.push(
      { id: '1', title: 'Midterm Prep', members: 4, lastMessage: 'Anyone ready for history?', unread: 2, messages: [] },
      { id: '2', title: 'Physics Study', members: 3, lastMessage: 'Check the new notes.', unread: 0, messages: [] }
    );
  }
  res.json({ discussions: store.discussions });
});

router.post('/create', (req, res) => {
  const { title, noteId } = req.body;
  const newDiscussion = {
    id: uuidv4(),
    title: title || 'New Node',
    noteId,
    members: 1,
    lastMessage: 'Protocol Initialized.',
    unread: 0,
    messages: [{ id: uuidv4(), sender: 'System', text: 'Study Node Established.', timestamp: new Date().toISOString() }]
  };
  store.discussions.unshift(newDiscussion);
  res.json(newDiscussion);
});

router.post('/:id/message', async (req, res) => {
  const { id } = req.params;
  const { text, sender } = req.body;
  const disc = store.discussions.find(d => d.id === id);
  if (!disc) return res.status(404).json({ error: 'Node not found' });

  const msg = { id: uuidv4(), sender: sender || 'User', text, timestamp: new Date().toISOString() };
  disc.messages.push(msg);
  disc.lastMessage = text;

  // AI Participation (Chanakya)
  if (text.includes('?') || text.toLowerCase().includes('chanakya')) {
    const note = store.notes.find(n => n.id === disc.noteId);
    const aiResponse = await askQuestion(note?.content || 'No context', text);
    const aiMsg = { id: uuidv4(), sender: 'Chanakya AI', text: aiResponse, timestamp: new Date().toISOString() };
    disc.messages.push(aiMsg);
  }

  res.json({ messages: disc.messages });
});

router.get('/:id', (req, res) => {
  const disc = store.discussions.find(d => d.id === req.params.id);
  if (!disc) return res.status(404).json({ error: 'Node not found' });
  res.json(disc);
});

module.exports = router;
