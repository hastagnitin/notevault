/**
 * AI Router Service
 * Intelligently routes AI requests between Local (Ollama) and Cloud (NVIDIA)
 * Optimized for 6GB RAM systems
 */

const { callOllama } = require('./ollamaService');
const { chat: nvidiaChat, isNvidiaAvailable } = require('./nvidiaService');

// Complex keywords that indicate API routing
const COMPLEX_KEYWORDS = [
  'analyze', 'compare', 'contrast', 'explain in detail',
  'summarize', 'generate quiz', 'create quiz', 'comprehensive',
  'deep dive', 'elaborate', 'in-depth', 'detailed analysis',
  'relationship between', 'implications of', 'evaluate'
];

/**
 * Analyze input complexity to determine routing
 * @param {string} input - User input
 * @param {string} context - Context length
 * @returns {Object} - {complexity: 'low'|'medium'|'high', reason: string}
 */
function analyzeComplexity(input, context = '') {
  const inputWordCount = input.split(/\s+/).length;
  const contextWordCount = context.split(/\s+/).length;
  const inputLower = input.toLowerCase();
  
  // Check for complex keywords
  const hasComplexKeywords = COMPLEX_KEYWORDS.some(keyword => 
    inputLower.includes(keyword.toLowerCase())
  );
  
  // Check word counts
  const isLongInput = inputWordCount > 100;
  const hasContext = contextWordCount > 200;
  
  console.log('[AI Router] Analysis:', {
    inputWords: inputWordCount,
    contextWords: contextWordCount,
    complexKeywords: hasComplexKeywords,
    longInput: isLongInput,
    hasContext: hasContext
  });

  // Route to API if any complex condition met
  if (hasComplexKeywords) {
    return { complexity: 'high', reason: 'Complex keywords detected' };
  }
  
  if (isLongInput && hasContext) {
    return { complexity: 'high', reason: 'Long input with context' };
  }
  
  if (contextWordCount > 500) {
    return { complexity: 'medium', reason: 'Large context' };
  }
  
  return { complexity: 'low', reason: 'Simple query' };
}

/**
 * Route chat request to appropriate AI
 * @param {string} mode - 'local', 'api', or 'auto'
 * @param {string} input - User message
 * @param {string} context - Note content as context
 * @returns {Promise<{response: string, mode: string}>}
 */
async function routeChat(mode, input, context = '') {
  console.log('[AI Router] Routing chat, mode:', mode);
  
  try {
    // If mode is explicit, use it
    if (mode === 'local') {
      console.log('[AI Router] Using Local AI (Ollama)');
      const response = await callOllama(input, context);
      return { response, mode: 'local' };
    }
    
    if (mode === 'api') {
      if (!isNvidiaAvailable()) {
        console.log('[AI Router] API not available, falling back to Local');
        const response = await callOllama(input, context);
        return { response, mode: 'local (fallback)' };
      }
      console.log('[AI Router] Using Cloud AI (NVIDIA)');
      const response = await nvidiaChat(input, context);
      return { response, mode: 'api' };
    }
    
    // Auto mode: intelligently route
    const { complexity, reason } = analyzeComplexity(input, context);
    console.log('[AI Router] Auto analysis:', { complexity, reason });
    
    if (complexity === 'high' && isNvidiaAvailable()) {
      console.log('[AI Router] Routing to Cloud AI (complex)');
      try {
        const response = await nvidiaChat(input, context);
        return { response, mode: 'api' };
      } catch (error) {
        console.log('[AI Router] API failed, falling back to Local:', error.message);
        const response = await callOllama(input, context);
        return { response, mode: 'local (fallback)' };
      }
    }
    
    // Use local AI for simple queries
    console.log('[AI Router] Routing to Local AI (simple)');
    const response = await callOllama(input, context);
    return { response, mode: 'local' };
    
  } catch (error) {
    console.error('[AI Router] Routing error:', error.message);
    
    // Final fallback: try local AI
    try {
      const response = await callOllama(input, context);
      return { response, mode: 'local (error fallback)' };
    } catch (fallbackError) {
      return { 
        response: 'Sorry, both AI services are currently unavailable. Please try again later.',
        mode: 'unavailable'
      };
    }
  }
}

/**
 * Check which AI modes are available
 * @returns {Object} - Availability status
 */
function checkAvailability() {
  return {
    local: true, // Ollama is assumed available
    api: isNvidiaAvailable(),
    auto: true
  };
}

module.exports = {
  routeChat,
  analyzeComplexity,
  checkAvailability
};
