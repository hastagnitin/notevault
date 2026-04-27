const { rateLimit } = require('express-rate-limit');

/**
 * Stricter rate limiter applied to all AI-powered endpoints.
 * Prevents accidental / malicious abuse of the Anthropic API quota.
 */
const aiRateLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 min
  max: Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests. Please wait a moment and try again.',
  },
  keyGenerator: (req) => req.user?.uid || req.ip, // per-user if authenticated
});

module.exports = aiRateLimiter;
