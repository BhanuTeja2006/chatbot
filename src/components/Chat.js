// src/Chat.js
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../App.css';

const healthCareSystemPrompt = {
  role: 'system',
  content: `You are HealthBot, a sophisticated... (same as before)`
};

const Chat = () => {
  const initialUserMessage = {
    role: 'assistant',
    content: 'Hello! I am HealthBot, an advanced AI healthcare assistant. How can I help you today?'
  };

  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([healthCareSystemPrompt, initialUserMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: 'user', content: userInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message;
      if (assistantMessage) {
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error calling /api/chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <main className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, i) =>
          msg.role !== 'system' && (
            <div key={i} className={`message ${msg.role}-message`}>
              <div className="message-content">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          )
        )}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content loading-indicator">Thinking...</div>
          </div>
        )}
      </main>

      <footer className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a health-related question..."
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={isLoading}>
            Send
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
