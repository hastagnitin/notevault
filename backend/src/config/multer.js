const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'text/plain']);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.txt']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    const err = new Error(
      `Unsupported file type "${file.mimetype}". Only PDF, JPG, PNG, and TXT files are accepted.`
    );
    err.type = 'UNSUPPORTED_FILE_TYPE';
    return cb(err, false);
  }
  cb(null, true);
}

/**
 * Multer instance using in-memory storage.
 * Files are kept as Buffer (req.file.buffer) so we can pipe them
 * directly to Supabase Storage without touching the disk.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Build a deterministic Supabase Storage object path.
 * Format: notes-files/<userId>/<uuid><ext>
 */
function buildStoragePath(userId, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return `${userId}/${uuidv4()}${ext}`;
}

module.exports = {
  upload,
  buildStoragePath,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE
};
