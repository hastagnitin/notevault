/**
 * Auth middleware - disabled for MVP
 * Firebase Auth handled in frontend
 */
async function authenticate(req, res, next) {
  // Pass through - no auth required for MVP
  req.user = { id: 'guest', email: 'guest@notevault.com' };
  next();
}

module.exports = authenticate;
