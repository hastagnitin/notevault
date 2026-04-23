/**
 * NVIDIA API Service
 * Cloud AI for complex queries and embeddings
 * Optimized for NoteVault AI hybrid system
 */

const axios = require('axios');
const { truncateToTokens } = require('../utils/textChunker');

const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const CHAT_MODEL = 'meta/llama-3.1-8b-instruct';
const EMBEDDING_MODEL = 'nvidia/nv-embed-v1';

/**
 * Check if NVIDIA API is configured and available
 */
function isNvidiaAvailable() {
  return !!NVIDIA_API_KEY;
}

/**
 * Generate chat response using NVIDIA API
 * @param {string} input - User message
 * @param {string} context - Note content as context
 * @returns {Promise<string>} - AI response
 */
async function chat(input, context = '') {
  if (!isNvidiaAvailable()) {
    throw new Error('NVIDIA API not configured');
  }

  try {
    const systemPrompt = context 
      ? `You are Chanakya AI, a helpful study assistant. Use the following notes as context:\n\n${context}\n\nAnswer based on the notes when relevant, but you can also use your general knowledge to provide comprehensive answers.`
      : 'You are Chanakya AI, a helpful study assistant. Answer questions clearly and concisely.';

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input }
    ];

    console.log('[NVIDIA] Sending chat request, context length:', context?.length);
    
    const response = await axios.post(
      `${NVIDIA_API_BASE}/chat/completions`,
      {
        model: CHAT_MODEL,
        messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1024,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    console.log('[NVIDIA] Chat response received, length:', content?.length);
    return content || 'No response from AI';
  } catch (error) {
    console.error('[NVIDIA] Chat error:', error.message);
    throw error;
  }
}

/**
 * Generate embedding vector for text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - 1024-dimension vector
 */
async function generateEmbedding(text) {
  if (!isNvidiaAvailable()) {
    throw new Error('NVIDIA API not configured');
  }

  try {
    // Truncate text to fit model limits
    const truncatedText = text.slice(0, 8000);
    
    console.log('[NVIDIA] Generating embedding, text length:', truncatedText.length);
    
    const response = await axios.post(
      `${NVIDIA_API_BASE}/embeddings`,
      {
        model: EMBEDDING_MODEL,
        input: truncatedText,
        encoding_format: 'float'
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const embedding = response.data.data?.[0]?.embedding;
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response');
    }
    
    console.log('[NVIDIA] Embedding generated, dimensions:', embedding.length);
    return embedding;
  } catch (error) {
    console.error('[NVIDIA] Embedding error:', error.message);
    throw error;
  }
}

/**
 * Summarize text using NVIDIA API
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summary
 */
async function summarize(text) {
  if (!isNvidiaAvailable()) {
    throw new Error('NVIDIA API not configured');
  }

  try {
    const prompt = `Summarize the following text in 2-3 sentences:\n\n${text.slice(0, 4000)}\n\nSummary:`;
    
    const response = await axios.post(
      `${NVIDIA_API_BASE}/chat/completions`,
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 200,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    return response.data.choices?.[0]?.message?.content?.trim() || 'Summary not available';
  } catch (error) {
    console.error('[NVIDIA] Summarize error:', error.message);
    throw error;
  }
}

/**
 * Extract key points from text
 * @param {string} text - Text to analyze
 * @returns {Promise<string[]>} - Array of key points
 */
async function extractKeyPoints(text) {
  if (!isNvidiaAvailable()) {
    throw new Error('NVIDIA API not configured');
  }

  try {
    const prompt = `Extract 3-5 key points from the following text. Return ONLY a JSON array of strings.\n\nText: ${text.slice(0, 4000)}\n\nKey points (JSON array):`;
    
    const response = await axios.post(
      `${NVIDIA_API_BASE}/chat/completions`,
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const content = response.data.choices?.[0]?.message?.content?.trim() || '[]';
    
    // Try to parse JSON response
    try {
      // Extract JSON if wrapped in markdown
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      // Fallback: split by lines
      return content.split('\n').filter(line => line.trim()).slice(0, 5);
    }
  } catch (error) {
    console.error('[NVIDIA] Key points error:', error.message);
    throw error;
  }
}

/**
 * Generate tags for text
 * @param {string} text - Text to analyze
 * @returns {Promise<string[]>} - Array of 3-5 tags
 */
async function generateTags(text) {
  if (!isNvidiaAvailable()) {
    throw new Error('NVIDIA API not configured');
  }

  try {
    const prompt = `Generate 3-5 relevant tags for the following text. Return ONLY a JSON array of lowercase strings.\n\nText: ${text.slice(0, 3000)}\n\nTags (JSON array):`;
    
    const response = await axios.post(
      `${NVIDIA_API_BASE}/chat/completions`,
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 100,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const content = response.data.choices?.[0]?.message?.content?.trim() || '[]';
    
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      // Fallback: extract words
      return ['notes', 'study', 'learning'];
    }
  } catch (error) {
    console.error('[NVIDIA] Tags error:', error.message);
    throw error;
  }
}

/**
 * Generate quiz questions from text
 * @param {string} text - Source text
 * @returns {Promise<Array>} - Array of quiz questions
 */
async function generateQuiz(text) {
  if (!isNvidiaAvailable()) {
    throw new Error('NVIDIA API not configured');
  }

  try {
    const prompt = `Generate 5 multiple choice questions from the following text. Return ONLY a JSON array with this format:
[{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..."}]

Text: ${text.slice(0, 4000)}\n\nQuiz (JSON):`;
    
    const response = await axios.post(
      `${NVIDIA_API_BASE}/chat/completions`,
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices?.[0]?.message?.content?.trim() || '[]';
    
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      // Return empty array if parsing fails
      return [];
    }
  } catch (error) {
    console.error('[NVIDIA] Quiz error:', error.message);
    throw error;
  }
}

/**
 * Generate cheat sheet from text
 * @param {string} text - Source text
 * @returns {Promise<string>} - Formatted cheat sheet
 */
async function generateCheatSheet(text) {
  if (!isNvidiaAvailable()) {
    throw new Error('NVIDIA API not configured');
  }

  try {
    const prompt = `Create a structured cheat sheet from the following text. Use markdown formatting with headings, bullet points, and bold text for key terms.\n\nText: ${text.slice(0, 4000)}\n\nCheat Sheet:`;
    
    const response = await axios.post(
      `${NVIDIA_API_BASE}/chat/completions`,
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.choices?.[0]?.message?.content?.trim() || 'Cheat sheet not available';
  } catch (error) {
    console.error('[NVIDIA] Cheat sheet error:', error.message);
    throw error;
  }
}

module.exports = {
  isNvidiaAvailable,
  chat,
  generateEmbedding,
  summarize,
  extractKeyPoints,
  generateTags,
  generateQuiz,
  generateCheatSheet
};
