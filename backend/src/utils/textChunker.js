/**
 * Text Chunker Utility
 * Splits text into manageable chunks for processing
 * Optimized for 6GB RAM systems
 */

/**
 * Split text into sentences
 * @param {string} text - Text to split
 * @returns {string[]} - Array of sentences
 */
function splitIntoSentences(text) {
  // Simple sentence splitting on punctuation followed by space or end
  return text
    .replace(/([.!?])\s+/g, "$1\n")
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Chunk text into segments of max word count
 * @param {string} text - Text to chunk
 * @param {number} maxWords - Max words per chunk (default 250)
 * @returns {string[]} - Array of text chunks
 */
function chunkText(text, maxWords = 250) {
  if (!text || text.length === 0) {
    return [];
  }

  const sentences = splitIntoSentences(text);
  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).length;

    // If adding this sentence would exceed limit, save current chunk
    if (currentWordCount + wordCount > maxWords && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
      currentWordCount = 0;
    }

    currentChunk.push(sentence);
    currentWordCount += wordCount;
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

/**
 * Get first N chunks of text (for limited context windows)
 * @param {string} text - Full text
 * @param {number} chunkCount - Number of chunks to return (default 2)
 * @param {number} maxWordsPerChunk - Max words per chunk (default 250)
 * @returns {string} - Combined text from first N chunks
 */
function getFirstChunks(text, chunkCount = 2, maxWordsPerChunk = 250) {
  const chunks = chunkText(text, maxWordsPerChunk);
  return chunks.slice(0, chunkCount).join('\n\n');
}

/**
 * Estimate token count (rough approximation)
 * @param {string} text - Text to estimate
 * @returns {number} - Estimated token count
 */
function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters or 0.75 words
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token limit
 * @param {string} text - Text to truncate
 * @param {number} maxTokens - Max tokens allowed (default 1500)
 * @returns {string} - Truncated text
 */
function truncateToTokens(text, maxTokens = 1500) {
  const estimatedTokens = estimateTokens(text);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }

  // Rough calculation: maxTokens * 4 chars per token
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + '...';
}

module.exports = {
  chunkText,
  getFirstChunks,
  splitIntoSentences,
  estimateTokens,
  truncateToTokens
};
