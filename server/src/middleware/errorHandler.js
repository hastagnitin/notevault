/**
 * Centralized Express error handler.
 * Must be registered AFTER all routes with exactly 4 parameters.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Multer file filter errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
  }

  if (err.type === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(415).json({ error: err.message });
  }

  // Validation errors (express-validator)
  if (err.type === 'VALIDATION_ERROR') {
    return res.status(422).json({ error: 'Validation failed.', details: err.details });
  }

  // Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({ error: err.message || 'Database error.' });
  }

  // Anthropic SDK errors
  if (err.status && err.error) {
    const status = err.status === 429 ? 429 : 502;
    return res
      .status(status)
      .json({ error: status === 429 ? 'AI rate limit reached. Try again shortly.' : 'AI service error.' });
  }

  console.error('[error]', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error.',
  });
}

module.exports = errorHandler;
