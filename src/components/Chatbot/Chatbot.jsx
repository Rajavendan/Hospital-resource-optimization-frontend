import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import ChatbotLogic from './ChatbotLogic';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm Kiwi 🥝, your hospital assistant. How can I help you today?", isBot: true, options: ['Book Appointment', 'Where is Billing?', 'Hospital Map', 'Emergency'] }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Core Logic Instance
    const botLogic = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initialize Logic Class
        botLogic.current = new ChatbotLogic((newState) => {
            // Optional: If logic needs to force update UI state directly
        });
    }, []);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // 1. Add User Message
        const userMsg = { id: Date.now(), text, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // 2. Process via Logic
        try {
            // Simulate network delay for natural feel
            await new Promise(r => setTimeout(r, 600));

            let response = await botLogic.current.processInput(text, user);

            // 3. Add Bot Message
            const botMsg = {
                id: Date.now() + 1,
                text: response.text,
                isBot: true,
                options: response.options,
                link: response.link,
                linkText: response.linkText,
                action: response.action,
                actionText: response.actionText,
                isUrgent: response.isUrgent
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the server.",
                isBot: true
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleOptionClick = (option) => {
        if (option === 'View Appointments') {
            navigate('/my-appointments');
            setIsOpen(false);
        } else {
            handleSendMessage(option);
        }
    };

    const handleActionClick = (action) => {
        if (action === 'call_ambulance') {
            window.location.href = 'tel:108';
        }
    };

    // Only show for patients
    if (!user || user.role?.toUpperCase() !== 'PATIENT') return null;

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-container">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <div className="bot-avatar">🥝</div>
                            <div>
                                <h3 className="font-semibold text-white">Kiwi</h3>
                                <div className="flex items-center text-xs text-slate-400">
                                    Online <div className="bot-status-dot"></div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'}`}>
                                <div className={`message-bubble ${msg.isBot ? 'message-bot' : 'message-user'} ${msg.isUrgent ? 'message-urgent' : ''}`}>
                                    {msg.text}

                                    {/* Link Rendering */}
                                    {msg.link && (
                                        <div className="mt-2">
                                            <a
                                                href={msg.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="chat-link"
                                            >
                                                {msg.linkText || 'Open Link'}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                            </a>
                                        </div>
                                    )}

                                    {/* Action Rendering */}
                                    {msg.action && (
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleActionClick(msg.action)}
                                                className="chat-action-btn"
                                            >
                                                {msg.actionText || 'Take Action'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {msg.options && (
                                    <div className="options-container">
                                        {msg.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(opt)}
                                                className="option-chip"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-bubble message-bot typing-dots">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input-area">
                        <form
                            className="input-wrapper"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage(inputText);
                            }}
                        >
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder="Type your message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button type="submit" className="send-btn" disabled={!inputText.trim()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
