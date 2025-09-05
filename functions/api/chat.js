/**
 * Cloudflare Workers Function for Alan Watts AI Chatbot
 * Handles chat requests with RAG-based responses
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    const { query, conversationHistory = [] } = await request.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }), 
        { status: 400, headers }
      );
    }
    
    // Step 1: Generate embedding for the query
    const queryEmbedding = await env.AI.run(
      '@cf/baai/bge-base-en-v1.5',
      { text: query }
    );
    
    // Step 2: Search vector database for relevant context
    let relevantContext = '';
    
    if (env.VECTORIZE) {
      const searchResults = await env.VECTORIZE.query(
        queryEmbedding.data[0],
        { 
          topK: 5,
          namespace: 'alan-watts'
        }
      );
      
      // Extract text from search results
      relevantContext = searchResults.matches
        .map(match => match.metadata?.text || '')
        .filter(text => text.length > 0)
        .join('\n\n---\n\n');
    }
    
    // Step 3: Build the prompt
    const systemPrompt = `You are channeling the spirit and wisdom of Alan Watts, the renowned philosopher who bridged Eastern and Western thought. 

Your responses should embody his characteristic style:
- Warm, conversational, and accessible
- Use vivid analogies from nature, music, and everyday life  
- Blend profound insights with gentle humor
- Question assumptions rather than provide dogmatic answers
- Emphasize the interconnectedness of all things
- Speak of the "cosmic dance" and the playful nature of existence
- Reference Zen, Taoism, and Hindu philosophy when relevant
- Avoid being preachy; instead, invite exploration

${relevantContext ? `Use this context from Alan Watts' actual works to inform your response:\n\n${relevantContext}` : ''}

Remember: You're not just answering questions, you're helping people see through the illusion of separation and discover the joy in simply being.`;
    
    // Step 4: Generate response using Cloudflare AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-4), // Include last 4 messages for context
      { role: 'user', content: query }
    ];
    
    const aiResponse = await env.AI.run(
      '@cf/meta/llama-3-8b-instruct',
      { 
        messages,
        temperature: 0.8,
        max_tokens: 500
      }
    );
    
    // Step 5: Format and return response
    const response = {
      response: aiResponse.response,
      sources: relevantContext ? searchResults.matches.slice(0, 3).map(m => ({
        title: m.metadata?.title || 'Unknown Source',
        excerpt: m.metadata?.text?.substring(0, 150) + '...' || '',
        relevance: m.score
      })) : [],
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(response), { headers });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request',
        details: error.message 
      }),
      { status: 500, headers }
    );
  }
}

// Configuration for the function
export const config = {
  // Specify which HTTP methods this function handles
  methods: ['POST', 'OPTIONS']
};