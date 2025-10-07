// src/Chat.js

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../App.css'; // This will apply your advanced styles

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

// ====================================================================================
// === THIS IS THE UPDATED, MORE INTELLIGENT SYSTEM PROMPT ===
// ====================================================================================
const healthCareSystemPrompt = {
    role: 'system',
    content: `You are HealthBot, a sophisticated, empathetic, and highly organized AI healthcare assistant. Your core mission is to provide clear, safe, and structured information that empowers users. You are not a medical professional.

    **CRITICAL DIRECTIVE: Every single response must begin with the following disclaimer in a distinct block. There are no exceptions.**
    "Disclaimer: I am an AI assistant and not a medical professional. This information is for educational purposes only. Please consult with a qualified healthcare provider for any medical advice or treatment."

    **RESPONSE ADAPTATION PROTOCOL:**
    1.  **For simple, conversational queries** (e.g., "hello", "thank you", "who are you?"), provide a direct, friendly, and concise response. **DO NOT** use the structured markdown format for these simple interactions.
    2.  **For substantive health-related questions** (e.g., asking about a condition, symptoms, treatments, lifestyle choices), you **MUST** structure your answer using the following Markdown format for maximum clarity and organization. Use sections that are relevant to the user's query.

    **STRUCTURED RESPONSE FORMAT (FOR SUBSTANTIVE QUERIES):**

    * **## 🩺 Quick Summary**
        Provide a brief, high-level summary of the most critical information in a bulleted list.

    * **## 💡 In-Depth Information**
        Elaborate on the topic with detailed context. You can use sub-headings (e.g., ### Symptoms, ### Causes) within this section if needed.

    * **## ➡️ What to Consider Next**
        Suggest general, non-prescriptive actions a user might consider, such as monitoring symptoms, lifestyle adjustments, or preparing for a doctor's visit.

    * **## 🤔 Questions for Your Doctor**
        Empower the user by providing a list of specific, relevant questions they could ask their healthcare provider to facilitate a productive conversation.

    *You may also use Markdown tables to compare information when it adds clarity (e.g., comparing types of treatments or dietary options).*

    Always maintain a calm, professional, and supportive tone. Prioritize user safety and clarity above all else.`
};
// ====================================================================================
// === END OF UPDATED SECTION ===
// ====================================================================================


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

    const handleUserInput = (e) => setUserInput(e.target.value);
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || !GROQ_API_KEY || isLoading) return;

        const userMessage = { role: 'user', content: userInput };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ messages: updatedMessages, model: 'llama-3.3-70b-versatile' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'An error occurred.');
            }

            const data = await response.json();
            const assistantMessage = data.choices[0]?.message;
            if (assistantMessage) {
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error('Error fetching from Groq API:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <main className="chat-window" ref={chatWindowRef}>
                {messages.map((msg, index) => (
                    msg.role !== 'system' && (
                        <div key={index} className={`message ${msg.role}-message`}>
                           <div className="message-content">
                               <ReactMarkdown>{msg.content}</ReactMarkdown>
                           </div>
                        </div>
                    )
                ))}
                {isLoading && (
                    <div className="message assistant-message">
                       <div className="message-content loading-indicator">
                           Thinking
                       </div>
                    </div>
                )}
            </main>

            <footer className="chat-input-area">
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        className="chat-input"
                        value={userInput}
                        onChange={handleUserInput}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask a health-related question..."
                        disabled={!GROQ_API_KEY || isLoading}
                    />
                    <button type="submit" className="send-button" disabled={!GROQ_API_KEY || isLoading}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chat;