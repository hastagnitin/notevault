/**
 * Central AI Service - GEMINI (Primary), NVIDIA (Secondary), Ollama (Fallback)
 * All AI calls go through generateAIResponse()
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma2:2b';
const TIMEOUT_MS = 60000;

let lastProvider = 'none';

function getLastProvider() {
  return lastProvider;
}

// ─── Gemini Implementation ──────────────────────────────────────────────────
async function callGemini(prompt, maxTokens = 1024) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── NVIDIA Implementation ──────────────────────────────────────────────────
async function callNvidia(prompt, maxTokens = 800) {
  if (!NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY not configured');

  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) throw new Error(`NVIDIA HTTP ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

// ─── CENTRAL AI FUNCTION ─────────────────────────────────────────────────────
async function generateAIResponse(prompt, options = {}) {
  const { maxTokens = 1024 } = options;

  // 1. GEMINI
  try {
    const result = await callGemini(prompt, maxTokens);
    lastProvider = 'gemini';
    return result;
  } catch (err) {
    console.warn(`[AI] GEMINI failed: ${err.message}`);
  }

  // 2. NVIDIA
  try {
    const result = await callNvidia(prompt, maxTokens);
    lastProvider = 'nvidia';
    return result;
  } catch (err) {
    console.warn(`[AI] NVIDIA failed: ${err.message}`);
  }

  return 'AI services are currently congested. Chanakya is meditating on your request.';
}

// ─── FEATURE FUNCTIONS ───────────────────────────────────────────────────────

async function askQuestion(noteContent, question) {
  const prompt = `You are Chanakya AI, a wise and strategic study assistant.
  Context Artifact:
  ${noteContent.slice(0, 4000)}
  
  Observation: ${question}
  
  Wisdom: Provide a clear, structured, and insightful response based ONLY on the artifact above.`;
  return await generateAIResponse(prompt);
}

async function generateQuiz(noteContent, count = 5) {
  const prompt = `Generate a high-rigor MCQ quiz with ${count} questions.
  Material:
  ${noteContent.slice(0, 5000)}
  
  Protocol:
  Output ONLY a JSON array:
  [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "...", "explanation": "..."}]`;
  return await generateAIResponse(prompt);
}

async function generateCheatsheet(noteContent) {
  const prompt = `Construct a Master Cheat Sheet from this knowledge node.
  
  Source:
  ${noteContent.slice(0, 5000)}
  
  Structure:
  ## CORE ARCHITECTURE (Key Points)
  ## FOUNDATIONAL MANIFOLDS (Important Concepts)
  ## HISTORICAL/CONSTITUENT DATA (Dates/Names)
  ## NEURAL SHORTCUTS (Memory Tips)
  ## EXECUTIVE SUMMARY (2-3 sentences)`;
  return await generateAIResponse(prompt);
}

async function explainText(selectedText, noteContent = '') {
  const prompt = `Deconstruct and explain this fragment for a scholar.
  
  Fragment: "${selectedText}"
  Context: ${noteContent.slice(0, 1000)}
  
  Simplify the complexity while preserving the essence.`;
  return await generateAIResponse(prompt);
}

module.exports = {
  generateAIResponse,
  askQuestion,
  generateQuiz,
  generateCheatsheet,
  explainText,
  getLastProvider
};
