'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, RotateCcw, Bot, User, Loader2 } from 'lucide-react';
import api from '../lib/api';

const SUGGESTED_QUESTIONS = [
  "What is our current ESG score?",
  "Which department has the highest carbon emissions?",
  "How many compliance issues are overdue?",
  "Who are our top ESG performers?",
  "Are we on track with our sustainability goals?",
  "What's our policy acknowledgement rate?",
];

export default function EsgAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your EcoSphere ESG Assistant 🌿 I have access to your organization's live ESG data. Ask me anything about carbon emissions, sustainability goals, compliance, or team engagement.",
      id: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = { role: 'user', content: messageText, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/assistant/chat', { message: messageText });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        id: Date.now() + 1
      }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Assistant is unavailable. Please try again.';
      setError(errMsg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errMsg}`,
        id: Date.now() + 1,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = async () => {
    try {
      await api.delete('/assistant/chat/history');
    } catch (_) {}
    setMessages([{
      role: 'assistant',
      content: "Conversation reset. What would you like to know about your ESG performance?",
      id: 'reset-' + Date.now()
    }]);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'
        }`}
        title="ESG Assistant"
      >
        {isOpen
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">ESG Assistant</p>
                <p className="text-green-100 text-xs">Powered by live data</p>
              </div>
            </div>
            <button
              onClick={resetConversation}
              className="text-white/70 hover:text-white transition-colors"
              title="Reset conversation"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium ${
                  msg.role === 'user' ? 'bg-green-500' : 'bg-gray-700'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} />
                    : <Bot size={14} />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-tr-sm'
                    : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-sm'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2">
                  <Loader2 size={16} className="text-gray-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions (show only at start) */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-400 mb-2">Suggested questions</p>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-1 hover:bg-green-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your ESG performance..."
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ minHeight: '38px', maxHeight: '96px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0 mt-0.5"
            >
              <Send size={15} className="text-white disabled:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
