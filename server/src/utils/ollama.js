/**
 * Ollama AI Service - Optimized for NoteVault
 * Uses Gemma 2B locally with streaming support
 * Optimized for 6GB RAM systems
 */

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';
const MAX_TOKENS = 1024; // Limit for faster responses
const TIMEOUT_MS = 30000; // 30 second timeout

/**
 * Call Ollama API with prompt and options
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Additional options
 * @param {number} options.maxTokens - Max tokens to generate
 * @param {boolean} options.stream - Whether to stream response
 * @returns {Promise<string>} - The generated response
 */
async function callOllama(prompt, options = {}) {
  const { maxTokens = MAX_TOKENS, stream = false } = options;
  
  try {
    console.log('[Ollama] Sending prompt, length:', prompt.length);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: stream,
        options: {
          num_predict: maxTokens,
          temperature: 0.7,
          top_p: 0.9,
          stop: ['<|endoftext|>', '<|user|>', '<|assistant|>']
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Ollama] Response received, length:', data.response?.length);
    return data.response;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[Ollama] Error: Request timeout (>30s)');
      return '[Error: AI response took too long. Try a shorter query or check Ollama.]';  
    }
    console.error('[Ollama] Error:', err.message);
    return null;
  }
}

/**
 * Check if Ollama is available
 * @returns {Promise<boolean>}
 */
async function isOllamaAvailable() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      timeout: 2000
    });
    return response.ok;
  } catch {
    return false;
  }
}

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
    return 'Error: No note content available to answer the question.';
  }
  
  // Limit content for performance (first 2000 chars is usually enough)
  const safeContent = noteContent.slice(0, 2000);
  
  const prompt = `You are Chanakya AI, a helpful study assistant. Your role is to help students understand their notes.

INSTRUCTIONS:
- Answer based ONLY on the provided notes
- Keep responses clear, concise, and easy to understand
- Use bullet points for multiple facts
- If the answer isn't in the notes, say so honestly
- Be encouraging and supportive

STUDENT NOTES:
${safeContent}

STUDENT QUESTION:
${question}

Provide a clear, helpful answer in 2-4 sentences maximum. Be direct and friendly.`;

  const response = await callOllama(prompt, { maxTokens: 256 });
  
  if (!response) {
    return `[Ollama not responding] Please ensure Ollama is running with: ollama run gemma:2b`;
  }
  
  return response.trim();
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
    return 'Error: No note content available to generate quiz.';
  }
  
  // Limit question count for performance
  const count = Math.min(Math.max(questionCount, 1), 10);
  const safeContent = noteContent.slice(0, 2500);
  
  const prompt = `You are an expert educator creating a multiple-choice quiz for students.

TASK: Create EXACTLY ${count} multiple choice questions based on the notes below.

STRICT FORMAT (follow exactly):
Q1. [Question text]?
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
✓ Correct: [A/B/C/D]

Q2. [Next question]...
(continue same format)

RULES:
- Each question MUST test understanding, not just memorization
- All 4 options must be plausible but only ONE correct
- Cover different parts of the notes
- Make questions clear and unambiguous
- Always include the ✓ Correct line

STUDENT NOTES:
${safeContent}

Generate ${count} high-quality questions now:`;

  const response = await callOllama(prompt, { maxTokens: 512 });
  
  if (!response) {
    return `[Error] Could not generate quiz. Please ensure Ollama is running: ollama run gemma:2b`;
  }
  
  // Clean up the response
  return response.trim();
}

/**
 * Generate cheat sheet from note content - One page revision guide
 * @param {string} noteContent - The content to summarize
 * @returns {Promise<string>} - The formatted cheat sheet
 */
async function generateCheatsheet(noteContent) {
  console.log('[generateCheatsheet] Note Length:', noteContent?.length);
  
  if (!noteContent || noteContent.length < 10) {
    return 'Error: No note content available to generate cheat sheet.';
  }
  
  // Limit content for quick processing
  const safeContent = noteContent.slice(0, 2500);
  
  const prompt = `You are creating a ONE-PAGE cheat sheet for quick revision before an exam.

TASK: Summarize the key information into a concise, scannable format.

STRICT FORMAT:
# [Topic Name]

## 🔑 Key Concepts
• Concept 1: Brief definition
• Concept 2: Brief definition
• Concept 3: Brief definition

## 📋 Important Facts
• Fact 1
• Fact 2
• Fact 3

## 💡 Quick Tips
• Tip 1
• Tip 2

RULES:
- Use ONLY bullet points (•)
- Keep each point under 10 words
- Maximum 3 sections
- Focus on what matters for exams
- NO long paragraphs
- NO copying full sentences
- Make it scannable in 30 seconds

STUDENT NOTES:
${safeContent}

Create a concise ONE-PAGE cheat sheet now:`;

  const response = await callOllama(prompt, { maxTokens: 384 });
  
  if (!response) {
    return `[Error] Could not generate cheat sheet. Please ensure Ollama is running: ollama run gemma:2b`;
  }
  
  return response.trim();
}

/**
 * Explain selected text in simple terms
 * @param {string} selectedText - The text to explain
 * @param {string} noteContent - Context from the note
 * @returns {Promise<string>} - The explanation
 */
async function explainText(selectedText, noteContent = '') {
  const prompt = `You are Chanakya AI, a patient study assistant. Explain the following text in simple, easy-to-understand language.

TEXT TO EXPLAIN:
"${selectedText}"

${noteContent ? `CONTEXT FROM NOTES:\n${noteContent.slice(0, 800)}` : ''}

INSTRUCTIONS:
- Explain as if teaching a beginner
- Use simple analogies if helpful
- Break down complex ideas
- Keep it under 3 sentences
- Be encouraging

Provide a clear, simple explanation:`;

  const response = await callOllama(prompt, { maxTokens: 192 });
  
  if (!response) {
    return `[Error] Could not generate explanation. Please ensure Ollama is running: ollama run gemma:2b`;
  }
  
  return response.trim();
}

module.exports = {
  callOllama,
  isOllamaAvailable,
  askQuestion,
  generateQuiz,
  generateCheatsheet,
  explainText
};
