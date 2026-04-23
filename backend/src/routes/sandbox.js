const express = require('express');
const { body, validationResult } = require('express-validator');
const { fixCodeSnippet } = require('../utils/aiService');

const router = express.Router();

// POST /api/sandbox/fix
router.post('/fix', [
  body('code').notEmpty(),
  body('error').notEmpty(),
  body('language').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { code, error, language = 'javascript' } = req.body;
    const result = await fixCodeSnippet(code, error, language);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[sandbox/fix] Error:', err);
    res.status(500).json({ success: false, error: 'AI failed to fix the code.' });
  }
});

module.exports = router;
