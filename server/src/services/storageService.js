import { storage } from '../config/firebase.js';

/**
 * Upload a file buffer to Firebase Cloud Storage.
 *
 * @param {Buffer} buffer       - File contents
 * @param {string} storagePath  - Destination path inside the bucket
 * @param {string} mimeType     - MIME type for Content-Type header
 * @returns {Promise<string>}   - Public download URL
 */
export async function uploadToStorage(buffer, storagePath, mimeType) {
  const file = storage.file(storagePath);

  await file.save(buffer, {
    metadata: { contentType: mimeType },
    resumable: false,
  });

  // Make the file publicly readable and return the URL.
  await file.makePublic();

  const [metadata] = await file.getMetadata();
  return metadata.mediaLink;
}

/**
 * Delete a file from Firebase Cloud Storage (e.g. on note deletion).
 *
 * @param {string} storagePath
 */
export async function deleteFromStorage(storagePath) {
  const file = storage.file(storagePath);
  const [exists] = await file.exists();
  if (exists) await file.delete();
}
