# Alan Watts AI Chatbot Architecture

## Overview
Build a RAG-powered chatbot that responds in Alan Watts' philosophical style using Cloudflare's AI infrastructure.

## Architecture Components

### 1. Data Ingestion Pipeline

#### Content Sources
- **Books**: Scrape/download from archive.org and other open sources
- **Transcripts**: KQED episodes, Essential Lectures 
- **Audio**: The Works series (would need transcription)
- **Secondary sources**: Essays, articles, interviews

#### Tools for Data Collection
```bash
# Web scraping
pip install beautifulsoup4 scrapy playwright

# PDF extraction
pip install pypdf2 pdfplumber

# Audio transcription (if needed)
pip install openai-whisper
```

### 2. RAG Pipeline Setup

#### Vector Database Options on Cloudflare
- **Cloudflare Vectorize** (native solution)
- **Cloudflare D1** + pgvector extension
- **External**: Pinecone/Weaviate via API

#### Embedding & Chunking Strategy
```javascript
// Example Worker for processing
export default {
  async fetch(request, env) {
    // Chunk documents into ~500 token segments
    // Generate embeddings using Cloudflare AI
    const embeddings = await env.AI.run(
      '@cf/baai/bge-base-en-v1.5',
      { text: chunkText }
    );
    
    // Store in Vectorize
    await env.VECTORIZE.insert([{
      id: chunkId,
      values: embeddings.data[0],
      metadata: { source, title, page }
    }]);
  }
}
```

### 3. Cloudflare AI Integration

#### Worker + AI Gateway Setup
```javascript
// /functions/api/chat.js
export async function onRequest(context) {
  const { request, env } = context;
  const { query } = await request.json();
  
  // 1. Generate query embedding
  const queryEmbedding = await env.AI.run(
    '@cf/baai/bge-base-en-v1.5',
    { text: query }
  );
  
  // 2. Vector search for relevant chunks
  const results = await env.VECTORIZE.query(
    queryEmbedding.data[0],
    { topK: 5 }
  );
  
  // 3. Build context from retrieved documents
  const context = results.matches
    .map(m => m.metadata.text)
    .join('\n\n');
  
  // 4. Generate response via AI Gateway
  const response = await fetch('https://gateway.ai.cloudflare.com/v1/YOUR_GATEWAY/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CF_AI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: '@cf/meta/llama-3-8b-instruct', // or other open models
      messages: [
        {
          role: 'system',
          content: `You are Alan Watts, the British-American philosopher known for interpreting Eastern philosophy for Western audiences. Respond in his characteristic style: warm, witty, profound yet accessible, often using analogies from nature and everyday life. Draw from this context: ${context}`
        },
        {
          role: 'user',
          content: query
        }
      ]
    })
  });
  
  return response;
}
```

### 4. Data Processing Pipeline

#### Step 1: Scraper Script
```python
# scrape_watts_content.py
import requests
from bs4 import BeautifulSoup
import json

# Example: Scraping archive.org
def scrape_archive_org():
    books = []
    # Archive.org API
    search_url = "https://archive.org/advancedsearch.php"
    params = {
        'q': 'creator:"Alan Watts" AND mediatype:texts',
        'output': 'json',
        'rows': 100
    }
    
    response = requests.get(search_url, params=params)
    data = response.json()
    
    for doc in data['response']['docs']:
        # Download and process each text
        identifier = doc['identifier']
        text_url = f"https://archive.org/stream/{identifier}/{identifier}_djvu.txt"
        text = requests.get(text_url).text
        
        books.append({
            'title': doc.get('title'),
            'text': text,
            'source': f"https://archive.org/details/{identifier}"
        })
    
    return books
```

#### Step 2: Chunking & Embedding
```python
# process_for_rag.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tiktoken

def chunk_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    chunks = []
    for doc in documents:
        doc_chunks = text_splitter.split_text(doc['text'])
        for i, chunk in enumerate(doc_chunks):
            chunks.append({
                'id': f"{doc['title']}_{i}",
                'text': chunk,
                'metadata': {
                    'source': doc['source'],
                    'title': doc['title'],
                    'chunk_index': i
                }
            })
    
    return chunks
```

### 5. Frontend Integration

```jsx
// Add to your React app
import { useState } from 'react';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input })
    });
    
    const data = await response.json();
    setMessages([...messages, 
      { role: 'user', content: input },
      { role: 'assistant', content: data.response }
    ]);
    setInput('');
  };
  
  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            {m.content}
          </div>
        ))}
      </div>
      <input 
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && sendMessage()}
      />
    </div>
  );
}
```

## Implementation Steps

1. **Set up Cloudflare Vectorize**
   ```bash
   npx wrangler vectorize create alan-watts-index \
     --dimensions=768 \
     --metric=cosine
   ```

2. **Create D1 Database for metadata**
   ```bash
   npx wrangler d1 create alan-watts-db
   ```

3. **Deploy ingestion Worker**
   ```bash
   npx wrangler deploy ingestion-worker
   ```

4. **Configure AI Gateway**
   - Go to Cloudflare Dashboard > AI > AI Gateway
   - Create new gateway
   - Get API endpoint and tokens

5. **Update wrangler.toml**
   ```toml
   name = "alan-watts-ai"
   compatibility_date = "2024-01-01"
   
   [[vectorize]]
   binding = "VECTORIZE"
   index_name = "alan-watts-index"
   
   [[d1_databases]]
   binding = "DB"
   database_name = "alan-watts-db"
   database_id = "your-db-id"
   
   [ai]
   binding = "AI"
   ```

## Available Open Source Models on Cloudflare

- **Text Generation**: Llama 3, Mistral, Phi-2
- **Embeddings**: BGE, GTE, E5
- **Speech-to-Text**: Whisper (for audio processing)

## Cost Considerations

- **Vectorize**: Free tier includes 100k vectors
- **AI Gateway**: Pay per request after free tier
- **Workers**: 100k requests/day free
- **D1**: 5GB storage free

## Security & Best Practices

1. Rate limit API endpoints
2. Cache frequent queries
3. Implement user authentication if needed
4. Monitor usage via AI Gateway analytics
5. Regular vector index optimization

## Next Steps

1. Start with scraping a few books for testing
2. Set up basic RAG pipeline with Vectorize
3. Test chatbot responses for accuracy
4. Fine-tune prompts to match Watts' style
5. Add audio transcription for complete coverage