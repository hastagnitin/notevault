/**
 * Ollama Service (for services folder)
 * Wraps the utils/ollama.js for AI Router integration
 */

const { askQuestion, generateQuiz, generateCheatsheet, explainText } = require('../utils/ollama');

/**
 * Call Ollama with input and context
 * @param {string} input - User input
 * @param {string} context - Note content
 * @returns {Promise<string>} - AI response
 */
async function callOllama(input, context = '') {
  try {
    return await askQuestion(context, input);
  } catch (error) {
    console.error('[Ollama Service] Error:', error.message);
    throw error;
  }
}

module.exports = {
  callOllama
};
