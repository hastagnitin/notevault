/**
 * NoteVault API Client
 * ---------------------
 * Central module for calling the NoteVault Express backend from the React app.
 * Import individual functions in your components as needed.
 *
 * Usage:
 *   import { uploadNote, askChat, generateQuiz } from '../api/noteVaultApi';
 */

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get stored Firebase ID token (set this after Firebase Auth sign-in). */
function getToken() {
  return localStorage.getItem('nv_id_token') ?? '';
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

/**
 * Upload a file and extract its text.
 * @param {File}   file
 * @param {string} [title]
 */
export async function uploadNote(file, title = '') {
  const form = new FormData();
  form.append('file', file);
  if (title) form.append('title', title);

  return request('/notes/upload', { method: 'POST', body: form });
}

/**
 * Fetch all notes for a user.
 * @param {string} userId
 */
export async function fetchNotes(userId) {
  return request(`/notes/${userId}`);
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Ask a question about a specific note.
 * @param {string} noteId
 * @param {string} question
 */
export async function askChat(noteId, question) {
  return request('/chat/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, question }),
  });
}

/**
 * Load previous Q&A history for a note.
 * @param {string} noteId
 */
export async function fetchChatHistory(noteId) {
  return request(`/chat/${noteId}/history`);
}

// ─── Explain ─────────────────────────────────────────────────────────────────

/**
 * Explain a selected passage from a note.
 * @param {string} noteId
 * @param {string} selectedText
 */
export async function explainText(noteId, selectedText) {
  return request('/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, selectedText }),
  });
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

/**
 * Generate a MCQ quiz from a note.
 * @param {string} noteId
 * @param {number} [questionCount=5] - Number of questions (1-10)
 */
export async function generateQuiz(noteId, questionCount = 5) {
  return request('/quiz/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, questionCount }),
  });
}

/**
 * Fetch a previously generated quiz by ID.
 * @param {string} quizId
 */
export async function fetchQuiz(quizId) {
  return request(`/quiz/${quizId}`);
}

// ─── Cheat Sheet ─────────────────────────────────────────────────────────────

/**
 * Generate a structured cheat sheet from a note.
 * @param {string} noteId
 */
export async function generateCheatsheet(noteId) {
  return request('/cheatsheet/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId }),
  });
}

// ─── Study Room ───────────────────────────────────────────────────────────────

/**
 * Create a new collaborative study room.
 * @param {string}   noteId
 * @param {string[]} [participants]
 */
export async function createStudyRoom(noteId, participants = []) {
  return request('/studyroom/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, participants }),
  });
}

/**
 * Send a message to a study room (AI responds if it's a question).
 * @param {string} roomId
 * @param {string} message
 */
export async function sendRoomMessage(roomId, message) {
  return request(`/studyroom/${roomId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

/**
 * Fetch a study room's details and messages.
 * @param {string} roomId
 */
export async function fetchStudyRoom(roomId) {
  return request(`/studyroom/${roomId}`);
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload image with OCR text extraction.
 * @param {File} file - Image file
 * @param {string} [title] - Optional title
 */
export async function uploadImage(file, title = '') {
  const form = new FormData();
  form.append('image', file);
  if (title) form.append('title', title);

  return request('/upload/image', { method: 'POST', body: form });
}

/**
 * Upload PDF with text extraction.
 * @param {File} file - PDF file
 * @param {string} [title] - Optional title
 */
export async function uploadPDF(file, title = '') {
  const form = new FormData();
  form.append('pdf', file);
  if (title) form.append('title', title);

  return request('/upload/pdf', { method: 'POST', body: form });
}

/**
 * Upload camera capture with OCR.
 * @param {string} imageBase64 - Base64 image data
 * @param {string} [title] - Optional title
 */
export async function uploadCameraCapture(imageBase64, title = '') {
  return request('/upload/camera', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64, title }),
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Perform semantic search on notes.
 * @param {string} query - Search query
 * @param {number} [limit] - Max results (default 5)
 */
export async function semanticSearch(query, limit = 5) {
  return request('/search/semantic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit }),
  });
}
