let anthropic = null;

if (process.env.ANTHROPIC_API_KEY) {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.3;

/**
 * Thin wrapper around the Anthropic messages API.
 * Falls back to mock response if no API key.
 */
async function callClaude(systemPrompt, userMessage, opts = {}) {
  if (!anthropic) {
    // Mock response for MVP without API key
    return "[AI Response - Add ANTHROPIC_API_KEY to .env for real AI]";
  }
  
  const { maxTokens = DEFAULT_MAX_TOKENS, temperature = DEFAULT_TEMPERATURE } = opts;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  return response.content[0]?.text ?? '';
}

module.exports = {
  anthropic,
  callClaude,
  CLAUDE_MODEL,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE
};
