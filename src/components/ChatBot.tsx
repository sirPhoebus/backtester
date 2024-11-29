import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatBotProps {
  onStrategyCreate: (strategy: Strategy) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onStrategyCreate }) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! I'll help you create a trading strategy. Let's start with a simple strategy. Would you like to create a moving average crossover or a price breakout strategy?", isUser: false }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isUser: true }]);
    
    // Simple bot logic - this could be expanded significantly
    const response = processUserInput(input.toLowerCase());
    setMessages(prev => [...prev, { text: response.message, isUser: false }]);

    if (response.strategy) {
      onStrategyCreate(response.strategy);
    }

    setInput('');
  };

  const processUserInput = (text: string): { message: string; strategy?: Strategy } => {
    if (text.includes('moving average')) {
      return {
        message: "I've created a simple moving average crossover strategy for you.",
        strategy: {
          name: 'Moving Average Crossover',
          description: 'Buy when fast MA crosses above slow MA, sell when it crosses below',
          logic: `
            const fastMA = calculateMA(prices, 10);
            const slowMA = calculateMA(prices, 20);
            return fastMA > slowMA;
          `,
          parameters: {
            fastPeriod: 10,
            slowPeriod: 20
          }
        }
      };
    }
    
    if (text.includes('breakout')) {
      return {
        message: "I've created a price breakout strategy for you.",
        strategy: {
          name: 'Price Breakout',
          description: 'Buy when price breaks above recent high, sell when it breaks below recent low',
          logic: `
            const high = Math.max(...prices.slice(-20));
            return price > high;
          `,
          parameters: {
            lookbackPeriod: 20
          }
        }
      };
    }

    return {
      message: "I didn't quite understand that. Would you like to create a moving average crossover or a price breakout strategy?"
    };
  };

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-lg shadow-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};