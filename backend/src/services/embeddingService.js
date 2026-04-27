/**
 * Embedding Service
 * Manages vector embeddings for semantic search
 * Uses Supabase pgvector for storage
 */

const supabaseModule = require('../config/supabase');
const supabase = supabaseModule?.supabase || supabaseModule;
const { generateEmbedding: generateNvidiaEmbedding } = require('./nvidiaService');

const MATCH_THRESHOLD = 0.7;
const MATCH_COUNT = 5;

/**
 * Generate and store embedding for a note
 * @param {string} noteId - Note UUID
 * @param {string} content - Note content
 * @returns {Promise<boolean>} - Success status
 */
async function generateAndStoreEmbedding(noteId, content) {
  console.log('[Embedding] Generating embedding for note:', noteId);
  
  if (!supabase) {
    console.log('[Embedding] Supabase not configured, skipping embedding storage');
    return false;
  }
  
  try {
    // Truncate content for embedding
    const truncatedContent = content.slice(0, 8000);
    
    // Generate embedding using NVIDIA
    const embedding = await generateNvidiaEmbedding(truncatedContent);
    
    // Store in Supabase
    const { error } = await supabase
      .from('notes')
      .update({ embedding })
      .eq('id', noteId);

    if (error) {
      throw error;
    }

    console.log('[Embedding] Stored successfully for note:', noteId);
    return true;
  } catch (error) {
    console.error('[Embedding] Error:', error.message);
    return false;
  }
}

/**
 * Perform semantic search
 * @param {string} query - Search query
 * @param {string} userId - User ID for filtering
 * @param {number} limit - Max results (default 5)
 * @returns {Promise<Array>} - Similar notes
 */
async function semanticSearch(query, userId, limit = MATCH_COUNT) {
  console.log('[Embedding] Semantic search:', query);
  
  if (!supabase) {
    console.log('[Embedding] Supabase not configured, semantic search unavailable');
    return [];
  }
  
  try {
    // Generate embedding for query
    const queryEmbedding = await generateNvidiaEmbedding(query);
    
    // Call Supabase RPC for similarity search
    const { data, error } = await supabase.rpc('match_notes', {
      query_embedding: queryEmbedding,
      match_threshold: MATCH_THRESHOLD,
      match_count: limit,
      filter_user_id: userId
    });

    if (error) {
      throw error;
    }

    console.log('[Embedding] Found', data?.length || 0, 'matches');
    return data || [];
  } catch (error) {
    console.error('[Embedding] Search error:', error.message);
    return [];
  }
}

/**
 * Find similar notes
 * @param {string} noteId - Reference note ID
 * @param {string} userId - User ID
 * @param {number} limit - Max results
 * @returns {Promise<Array>} - Similar notes
 */
async function findSimilarNotes(noteId, userId, limit = 3) {
  if (!supabase) {
    return [];
  }
  
  try {
    // Get the reference note's embedding
    const { data: note, error } = await supabase
      .from('notes')
      .select('embedding')
      .eq('id', noteId)
      .single();

    if (error || !note?.embedding) {
      return [];
    }

    // Find similar notes (excluding the reference note)
    const { data, error: searchError } = await supabase.rpc('match_notes', {
      query_embedding: note.embedding,
      match_threshold: MATCH_THRESHOLD,
      match_count: limit + 1, // +1 to account for potential self-match
      filter_user_id: userId
    });

    if (searchError) {
      throw searchError;
    }

    // Filter out the reference note
    return (data || []).filter(n => n.id !== noteId).slice(0, limit);
  } catch (error) {
    console.error('[Embedding] Similar notes error:', error.message);
    return [];
  }
}

module.exports = {
  generateAndStoreEmbedding,
  semanticSearch,
  findSimilarNotes,
  MATCH_THRESHOLD,
  MATCH_COUNT
};
