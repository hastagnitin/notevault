/**
 * Search Routes
 * Semantic search using vector embeddings
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { semanticSearch } = require('../services/embeddingService');

const router = express.Router();

/**
 * POST /api/search/semantic
 * Search notes by semantic similarity
 */
router.post(
  '/semantic',
  [
    body('query').isString().trim().notEmpty().withMessage('Query is required'),
    body('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be 1-20')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Validation failed', details: errors.array() });
    }

    try {
      const { query, limit = 5 } = req.body;
      const userId = req.user?.id || 'anonymous'; // Replace with actual auth

      console.log('[Search] Semantic search:', query);
      
      const results = await semanticSearch(query, userId, limit);
      
      res.json({
        success: true,
        query,
        count: results.length,
        results
      });

    } catch (error) {
      console.error('[Search] Error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Search failed',
        message: error.message 
      });
    }
  }
);

module.exports = router;
