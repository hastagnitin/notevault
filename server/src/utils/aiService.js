/**
 * Central AI Service - NVIDIA PRIMARY, Ollama FALLBACK
 * All AI calls go through generateAIResponse()
 * Never returns null - always returns a string
 */

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'google/gemma-2b';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';
const TIMEOUT_MS = 60000; // 60 second timeout for slower systems

// Track which provider was last used (for logging)
let lastProvider = 'none';

/**
 * Get the name of the last AI provider used
 */
function getLastProvider() {
  return lastProvider;
}

/**
 * Call NVIDIA API (PRIMARY)
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Max tokens to generate
 * @returns {Promise<string>} - The generated response
 */
async function callNvidia(prompt, maxTokens = 800) {
  if (!NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY not configured');
  }

  console.log('[NVIDIA] Sending prompt, length:', prompt.length);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: maxTokens
    }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`NVIDIA HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const output = data.choices?.[0]?.message?.content;

  if (!output || output.trim().length === 0) {
    throw new Error('Empty NVIDIA response');
  }

  console.log('[NVIDIA] Response received, length:', output.length);
  return output.trim();
}

/**
 * Call Ollama API (FALLBACK)
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Max tokens to generate
 * @returns {Promise<string>} - The generated response
 */
async function callOllama(prompt, maxTokens = 800) {
  console.log('[Ollama] Sending prompt, length:', prompt.length);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: maxTokens,
        temperature: 0.7,
        top_p: 0.9
      }
    }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Ollama HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data?.response || data.response.trim().length === 0) {
    throw new Error('Empty Ollama response');
  }

  console.log('[Ollama] Response received, length:', data.response.length);
  return data.response.trim();
}

/**
 * CENTRAL AI FUNCTION - NVIDIA PRIMARY, OLLAMA FALLBACK
 * All routes MUST use this function. Never call AI directly.
 * 
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Additional options
 * @param {number} options.maxTokens - Max tokens (default: 800)
 * @returns {Promise<string>} - Always returns a string (never null)
 */
async function generateAIResponse(prompt, options = {}) {
  const { maxTokens = 800 } = options;

  // ── PRIMARY: NVIDIA API ──
  try {
    const result = await callNvidia(prompt, maxTokens);
    lastProvider = 'nvidia';
    console.log('[AI] ✅ Using NVIDIA API');
    return result;
  } catch (err) {
    console.warn(`[AI] ⚠️ NVIDIA failed: ${err.message}`);
    console.log('[AI] 🔄 Fallback → Ollama triggered');
  }

  // ── FALLBACK: OLLAMA ──
  try {
    const result = await callOllama(prompt, maxTokens);
    lastProvider = 'ollama';
    console.log('[AI] ✅ Using Ollama (fallback)');
    return result;
  } catch (fallbackErr) {
    console.error(`[AI] ❌ Both AI systems failed: ${fallbackErr.message}`);
    lastProvider = 'none';
  }

  // ── LAST RESORT: Friendly message ──
  return 'AI is temporarily unavailable. Please try again later.';
}

// ────────────────────────────────────────────────────────────────────────────────
// FEATURE FUNCTIONS - Build prompts and call generateAIResponse()
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Answer question based on note content
 * @param {string} noteContent - The content of the note
 * @param {string} question - The user's question
 * @returns {Promise<string>} - The AI answer
 */
async function askQuestion(noteContent, question) {
  console.log('[askQuestion] Question:', question);
  console.log('[askQuestion] Note Length:', noteContent?.length);

  if (!noteContent || noteContent.length < 10) {
    return 'No note content available to answer the question. Please upload a note first.';
  }

  const safeContent = noteContent.slice(0, 3000);

  const prompt = `You are Chanakya AI, a smart study assistant.

Answer ONLY using the notes below.
If exact answer is not found, infer from context.

Notes:
${safeContent}

Question:
${question}

Answer in simple Hinglish.`;

  return await generateAIResponse(prompt, { maxTokens: 256 });
}

/**
 * Generate quiz from note content
 * @param {string} noteContent - The content to generate quiz from
 * @param {number} questionCount - Number of questions (default: 5, max: 10)
 * @returns {Promise<string>} - Quiz text
 */
async function generateQuiz(noteContent, questionCount = 5) {
  console.log('[generateQuiz] Note Length:', noteContent?.length, 'Questions:', questionCount);

  if (!noteContent || noteContent.length < 10) {
    return 'No note content available to generate quiz. Please upload a note first.';
  }

  const count = Math.min(Math.max(questionCount, 1), 10);
  const safeContent = noteContent.slice(0, 3000);

  const prompt = `Generate ${count} MCQs from the notes.
Each question must include:
- Question
- 4 options (A, B, C, D)
- Correct answer

Format:
Q1. Question text?
A) Option 1
B) Option 2
C) Option 3
D) Option 4
Correct: A

Notes:
${safeContent}

Generate ${count} MCQs now:`;

  return await generateAIResponse(prompt, { maxTokens: 1024 });
}

/**
 * Generate cheat sheet from note content
 * @param {string} noteContent - The content to summarize
 * @returns {Promise<string>} - The formatted cheat sheet
 */
async function generateCheatsheet(noteContent) {
  console.log('[generateCheatsheet] Note Length:', noteContent?.length);

  if (!noteContent || noteContent.length < 10) {
    return 'No note content available to generate cheat sheet. Please upload a note first.';
  }

  const safeContent = noteContent.slice(0, 3000);

  const prompt = `Create a structured cheat sheet.

Rules:
- Do NOT copy text
- Summarize content
- Use headings: Key Points, Concepts, Summary
- Use bullet points

Notes:
${safeContent}

Create the cheat sheet now:`;

  return await generateAIResponse(prompt, { maxTokens: 512 });
}

/**
 * Explain selected text in simple terms
 * @param {string} selectedText - The text to explain
 * @param {string} noteContent - Context from the note
 * @returns {Promise<string>} - The explanation
 */
async function explainText(selectedText, noteContent = '') {
  if (!selectedText || selectedText.trim().length === 0) {
    return 'No text selected to explain.';
  }

  const safeContent = noteContent ? noteContent.slice(0, 3000) : '';

  const prompt = `You are Chanakya AI, a patient study assistant.

Explain this text in simple language:

"${selectedText}"

${safeContent ? `Context from notes:\n${safeContent}` : ''}

Explain like you're teaching a student in 2-3 sentences:`;

  return await generateAIResponse(prompt, { maxTokens: 256 });
}

/**
 * Check if NVIDIA API is configured
 * @returns {boolean}
 */
function isNvidiaConfigured() {
  return !!NVIDIA_API_KEY && NVIDIA_API_KEY.length > 10;
}

/**
 * Check if Ollama is available
 * @returns {Promise<boolean>}
 */
async function isOllamaAvailable() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

module.exports = {
  generateAIResponse,
  askQuestion,
  generateQuiz,
  generateCheatsheet,
  explainText,
  getLastProvider,
  isNvidiaConfigured,
  isOllamaAvailable
};
