import React, { useState, useRef, useEffect } from 'react';

export default function ChatBot({ currentTab = 'books', isEmbedded = false }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Sum1namedAlan. I embody [Alan Watts'](https://en.wikipedia.org/wiki/Alan_Watts) (1915-1973) approach to understanding life - his curiosity about how Eastern wisdom could illuminate Western living, his journey from Anglican priest to Zen interpreter, his struggles with authenticity and his insights about the \"cosmic game\" we're all playing.\n\nI can share what's known about how he figured things out, discuss his philosophy, and guide you through his works. When I'm not certain about something, I'll be honest about that rather than guess.\n\nDid you come here through a search, add to an initial response, or did you find me from one of those fascinating inspirational sites that have melodies that seem to be trying to articulate a feeling, perhaps? Anyway, welcome!\n\n\"We are the universe experiencing itself subjectively\" - what would you like to explore about Alan's journey or ideas?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastKnownTab, setLastKnownTab] = useState(currentTab);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMessageContent = (content) => {
    // Simple markdown-like link parsing for [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      
      // Add link
      parts.push(
        <a 
          key={match.index}
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#667eea',
            textDecoration: 'underline',
            fontWeight: 500
          }}
        >
          {match[1]}
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }
    
    // Split by newlines and add line breaks
    const result = [];
    parts.forEach((part, index) => {
      if (typeof part === 'string') {
        const lines = part.split('\n');
        lines.forEach((line, lineIndex) => {
          if (lineIndex > 0) result.push(<br key={`br-${index}-${lineIndex}`} />);
          if (line) result.push(line);
        });
      } else {
        result.push(part);
      }
    });
    
    return result.length ? result : content;
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send lightweight context update when tab changes
  useEffect(() => {
    if (currentTab !== lastKnownTab) {
      // Only send update if there are previous messages (user has interacted)
      if (messages.length > 1) {
        const tabNames = {
          books: 'Books',
          kqed: 'KQED Series',
          essentials: 'Essential Lectures',
          works: 'The Works'
        };
        
        const contextMessage = {
          role: 'system',
          content: `[User switched to viewing ${tabNames[currentTab]} section]`,
          isContextUpdate: true
        };
        
        setMessages(prev => [...prev, contextMessage]);
      }
      setLastKnownTab(currentTab);
    }
  }, [currentTab, lastKnownTab, messages.length]);
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      // Filter out context updates from history but include them in the recent context
      const recentMessages = messages.slice(-8); // Get more messages to account for context updates
      const conversationHistory = recentMessages.filter(msg => !msg.isContextUpdate);
      const contextUpdates = recentMessages.filter(msg => msg.isContextUpdate);

      const response = await fetch('/api/watts-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory.slice(-6), // Send recent conversation
          currentSection: currentTab,
          contextUpdates: contextUpdates // Include recent context switches
        })
      });
      
      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }]);
      } else {
        throw new Error('No response received');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Ah, it seems we've hit a bit of a snag in the cosmic machinery! Perhaps try again in a moment. After all, even the universe needs to catch its breath sometimes." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Always show the chat now - no floating button mode
  
  const containerStyle = {
    width: '100%',
    height: isEmbedded ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? '500px' : '100vh') : '650px',
    maxHeight: isEmbedded ? 'calc(100vh - 40px)' : '650px',
    borderRadius: '16px',
    // Enhanced shadow for overlapping effect
    boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    border: '2px solid rgba(102, 126, 234, 0.2)',
    position: 'relative',
    zIndex: 15,
    // Subtle backdrop blur effect
    backdropFilter: 'blur(10px)',
    // Enhanced gradient border background
    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3)) border-box'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: isEmbedded ? '14px 14px 0 0' : '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px' }}>Sum1namedAlan</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Embodying Watts' approach to living</div>
        </div>
        {/* Chat always visible - no close button needed */}
      </div>
      
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg, i) => {
          // Don't render context update messages
          if (msg.isContextUpdate) return null;
          
          return (
          <div 
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#f3f4f6',
              color: msg.role === 'user' ? 'white' : '#1f2937',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {renderMessageContent(msg.content)}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
              marginTop: '4px',
              paddingX: '4px'
            }}>
              {msg.role === 'user' ? 'You' : 'Sum1namedAlan'}
            </div>
          </div>
          );
        })}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#6b7280',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <div>Sum1namedAlan is contemplating...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '12px'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about Alan's journey, philosophy, how he figured things out..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = '#667eea'}
          onBlur={e => e.target.style.borderColor = '#d1d5db'}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 20px',
            background: isLoading || !input.trim() 
              ? '#e5e7eb'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: isLoading || !input.trim() ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: isLoading || !input.trim() ? 'default' : 'pointer',
            fontSize: '14px',
            transition: 'opacity 0.2s'
          }}
        >
          Send
        </button>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}