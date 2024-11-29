import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { getChatCompletion } from '../services/anthropic';
import { cn } from '../lib/utils';

interface FloatingChatProps {
  onStrategyCreate: (strategy: Strategy) => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({ onStrategyCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{ content: string; role: 'user' | 'assistant' }>>([
    { 
      role: 'assistant',
      content: "Hi! I'm your trading strategy assistant. I can help you create and customize trading strategies for backtesting. Would you like to create a moving average crossover or a price breakout strategy?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsMinimized(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChatCompletion([...messages, userMessage]);
      
      const strategyMatch = response.match(/```javascript\n([\s\S]*?)```/);
      if (strategyMatch) {
        const strategyCode = strategyMatch[1];
        const strategy = {
          name: 'Custom Strategy',
          description: 'Custom strategy created via chat',
          logic: strategyCode,
          parameters: {}
        };
        onStrategyCreate(strategy);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      ref={chatRef}
      style={{ zIndex: 9999 }}
      className={cn(
        "fixed right-6 bg-dark-200 rounded-lg shadow-xl transition-all duration-200 ease-in-out border-2 border-dark-400",
        isMinimized
          ? "bottom-6 w-72 h-14"
          : "bottom-6 w-96 h-[600px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-dark-400">
        <h3 className="font-semibold text-gray-200">Strategy Assistant</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-gray-200"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-8rem)]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    message.role === 'user'
                      ? "bg-blue-600 text-white"
                      : "bg-dark-300 text-gray-200"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-dark-400 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                className="flex-1 bg-dark-300 border-dark-400 text-gray-200 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isLoading ? "Thinking..." : "Type your message..."}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isLoading
                    ? "bg-dark-400 text-gray-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};