const express = require('express');
const { body, param, validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const authenticate = require('../middleware/authenticate');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callClaude } = require('../config/claude');

const router = express.Router();

/**
 * Heuristic: treat a message as a question if it ends with "?" or
 * starts with a question word.
 */
function isQuestion(text) {
  const trimmed = text.trim();
  if (trimmed.endsWith('?')) return true;
  return /^(what|who|how|why|when|where|which|can|could|does|do|is|are|explain)/i.test(trimmed);
}

// POST /api/studyroom/create
router.post(
  '/create',
  authenticate,
  [
    body('noteId').isUUID().withMessage('noteId must be a valid UUID.'),
    body('roomName').isString().trim().notEmpty().withMessage('roomName is required.'),
    body('participants')
      .optional()
      .isArray()
      .withMessage('participants must be an array of user IDs.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed.', details: errors.array() });
    }

    try {
      const { noteId, roomName, participants = [] } = req.body;
      const userId = req.user.id;

      // Verify note existence and ownership
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('id')
        .eq('id', noteId)
        .eq('user_id', userId)
        .single();

      if (noteError || !note) {
        return res.status(404).json({ error: 'Note not found or access denied.' });
      }

      // Ensure creator is in participants
      const allParticipants = Array.from(new Set([userId, ...participants]));

      const { data: roomData, error: roomError } = await supabase
        .from('study_rooms')
        .insert({
          note_id: noteId,
          room_name: roomName,
          participants: allParticipants,
          messages: []
        })
        .select()
        .single();

      if (roomError) {
        return res.status(500).json({ error: 'Failed to create study room', details: roomError.message });
      }

      res.status(201).json({ 
        id: roomData.id,
        noteId, 
        roomName: roomData.room_name,
        participants: allParticipants 
      });
    } catch (err) {
      console.error('[studyroom/create] Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/studyroom/:roomId/message
router.post(
  '/:roomId/message',
  authenticate,
  aiRateLimiter,
  [
    param('roomId').isUUID().withMessage('roomId must be a valid UUID.'),
    body('message').isString().trim().notEmpty().withMessage('message is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed.', details: errors.array() });
    }

    try {
      const { roomId } = req.params;
      const { message } = req.body;
      const userId = req.user.id;

      // Fetch room
      const { data: room, error: roomError } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !room) {
        return res.status(404).json({ error: 'Study room not found.' });
      }

      // Verify participant
      if (!room.participants.includes(userId)) {
        return res.status(403).json({ error: 'You are not a participant in this study room.' });
      }

      const timestamp = new Date().toISOString();
      const userMsg = { userId, message, isAI: false, timestamp };
      let aiMsg = null;

      // If the message looks like a question, invoke Claude
      if (isQuestion(message)) {
        const { data: note } = await supabase
          .from('notes')
          .select('content')
          .eq('id', room.note_id)
          .single();

        const noteContent = note?.content || '';

        const systemPrompt = 'You are a collaborative study room AI assistant. Answer questions using ONLY the provided note content. Keep answers concise and educational.';

        const answer = await callClaude(
          systemPrompt,
          `Note content:\n"""\n${noteContent}\n"""\n\nQuestion from study room: ${message}`
        );

        aiMsg = { userId: 'ai', message: answer, isAI: true, timestamp: new Date().toISOString() };
      }

      // Append message(s) to the room
      const newMessages = aiMsg ? [userMsg, aiMsg] : [userMsg];
      const updatedMessages = [...(room.messages || []), ...newMessages];

      await supabase
        .from('study_rooms')
        .update({ messages: updatedMessages })
        .eq('id', roomId);

      res.json({
        roomId,
        userMessage: userMsg,
        aiResponse: aiMsg ? aiMsg.message : null,
      });
    } catch (err) {
      console.error('[studyroom/message] Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /api/studyroom/:roomId
router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('study_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Study room not found.' });
    }

    // Verify participant
    if (!data.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(data);
  } catch (err) {
    console.error('[studyroom/get] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/studyroom/user/:userId
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Users can only see their own study rooms
    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data, error } = await supabase
      .from('study_rooms')
      .select('*')
      .contains('participants', [userId])
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch study rooms', details: error.message });
    }

    res.json({ studyRooms: data || [] });
  } catch (err) {
    console.error('[studyroom/user] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
