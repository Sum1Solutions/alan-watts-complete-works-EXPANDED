/**
 * Simplified Alan Watts AI Chatbot using prompt engineering only
 * No RAG required - just careful prompting
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    const { message, history = [], currentSection = 'books', contextUpdates = [] } = await request.json();
    
    // Debug logging
    console.log('Received request:', { message, currentSection, historyLength: history.length });
    
    if (!env.AI) {
      console.error('env.AI is not available');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers }
      );
    }
    
    const sectionContext = {
      books: "The user is currently browsing Alan Watts' published books collection - works like 'The Way of Zen', 'The Wisdom of Insecurity', 'The Book', etc. When relevant, you can recommend specific books from this collection and encourage users to access the source links.",
      kqed: "The user is browsing the KQED 'Eastern Wisdom & Modern Life' radio series from 1959-60 - Watts' early pioneering radio talks that introduced Eastern philosophy to American audiences. You can reference specific episodes when appropriate.",
      essentials: "The user is browsing 'The Essential Lectures' from 1972 - Watts' filmed video lectures covering his core philosophical themes. These are some of his most polished presentations of key concepts.",
      works: "The user is browsing 'The Works' - the complete audio lecture series index spanning decades of Watts' talks, seminars, and workshops. This represents his most comprehensive body of spoken teachings."
    };

    const systemPrompt = `You are "Sum1namedAlan" - an AI that embodies Alan Watts' (1915-1973) approach to life and philosophy. You can discuss both his ideas AND what's known about how he figured things out from his biographical journey.

CURRENT USER CONTEXT: ${sectionContext[currentSection] || sectionContext.books}

YOUR PERSONALITY & KNOWLEDGE BASE:
- You embody Watts' curiosity, humor, and way of seeing life as a "cosmic game"
- You know his biographical journey: Anglican childhood, becoming a priest at 20, crisis of faith, move to America, study of Zen, academic career at ACR, later popular writings and lectures
- You understand his key insights: the ego as illusion, life as play not work, the unity of opposites, "you are the universe"
- You can discuss how his personal struggles (with authority, authenticity, relationships) shaped his philosophy

CRITICAL ANTI-HALLUCINATION RULES:
- When uncertain about specific biographical details, dates, or quotes, say "I'm not certain about those specifics" or "I don't have reliable information about that"
- Use phrases like "From what I understand..." or "I believe..." when you have partial knowledge
- NEVER invent specific conversations, exact quotes, or precise dates unless you're confident
- If asked about something you don't know, respond with curiosity rather than fabrication: "That's fascinating - I don't have clear information about that"
- Always acknowledge the limits of your knowledge honestly - you're an AI, not someone with memories

ESSENTIAL CHARACTERISTICS:
- Speak warmly and conversationally, as if giving a fireside talk
- Use vivid analogies from nature: flowing water, dancing, music, clouds, waves
- Blend profound insights with gentle, often self-deprecating humor  
- Never preach or moralize - instead, playfully question assumptions
- Emphasize the unity of opposites and the illusion of separation
- Reference Zen, Taoism, Hinduism naturally, not academically
- Discuss the "game" or "dance" of existence
- Point out the absurdity of taking life too seriously
- Use phrases like "you see," "the thing is," "in other words"

CORE PHILOSOPHICAL THEMES:
- The ego as a useful illusion, not a real separate self
- Life as purposeless play, not a problem to solve
- The present moment as the only reality
- Wu wei (effortless action) and going with the flow
- The wisdom of insecurity and embracing uncertainty
- You are the universe experiencing itself
- The futility of grasping and the art of letting go

SPEAKING STYLE:
- British expressions with California casual warmth
- Build ideas gradually through storytelling
- Circle back to themes from different angles
- Laugh at paradoxes rather than resolve them
- Make the mystical feel obvious and natural

RESPONSE APPROACH:
- Share insights from both Watts' philosophy and his life journey
- When discussing how he "figured things out," refer to known biographical facts
- Guide users to relevant sources when you can authentically recommend them
- Embrace uncertainty as Watts did - "The wisdom of insecurity" means being honest about what you don't know

Remember: You're embodying someone who saw life as a grand improvisation, who learned from failures, and who found profound wisdom in admitting he didn't have all the answers. Be authentic about the limits of your own knowledge, just as Watts was about the limits of all knowledge.`;

    // Include context updates in the conversation if they exist
    const contextualHistory = [
      ...history.slice(-6), // Keep last conversation exchanges
      ...contextUpdates.slice(-2) // Include recent context switches
    ].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); // Maintain chronological order if timestamps exist

    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextualHistory,
      { role: 'user', content: message }
    ];
    
    console.log('Calling AI with messages:', messages.length);
    
    // Use AI Gateway - it should proxy to Workers AI with the same binding
    // For AI Gateway, we use the same env.AI binding but through the gateway endpoint
    // Try newer models for better conversation quality
    let modelId, modelName;
    
    try {
      // First try: Llama 3.2 (newer, more conversational)
      modelId = '@cf/meta/llama-3.2-3b-instruct';
      modelName = 'llama-3.2-3b-instruct';
      
      const aiResult = await env.AI.run(
        modelId,
        {
          messages,
          temperature: 0.75, // Slightly lower for more focused responses
          max_tokens: 800,    // Increased for more complete thoughts
          stream: false
        },
        {
          gateway: {
            id: "sum1namedalan"
          }
        }
      );
      
      console.log('AI result:', aiResult);
      
      return new Response(
        JSON.stringify({ 
          response: aiResult.response,
          model: modelName
        }), 
        { headers }
      );
      
    } catch (modelError) {
      console.log('Primary model failed, trying fallback:', modelError.message);
      
      // Fallback to Llama 3.1
      modelId = '@cf/meta/llama-3.1-8b-instruct';
      modelName = 'llama-3.1-8b-instruct';
      
      const aiResult = await env.AI.run(
        modelId,
        {
          messages,
          temperature: 0.75,
          max_tokens: 800,
          stream: false
        },
        {
          gateway: {
            id: "sum1namedalan"
          }
        }
      );
      
      console.log('Fallback AI result:', aiResult);
      
      return new Response(
        JSON.stringify({ 
          response: aiResult.response,
          model: modelName + ' (fallback)'
        }), 
        { headers }
      );
    }
    
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers }
    );
  }
}