
import React, { useState } from 'react';
import { Send, Bot, MessageCircle } from 'lucide-react';

const AIAssistant = () => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="my-6 mx-2 lg:mx-0 lg:my-8">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-xl">
        <div className="bg-white rounded-2xl p-6">
          {/* Assistant Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">SplitEase Assistant</h3>
              <p className="text-sm text-gray-500">AI-powered expense helper</p>
            </div>
          </div>
          
          {/* Welcome Message Bubble */}
          <div className="relative mb-6">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    Hi! I'm your SplitEase Assistant. Ask me anything about your expenses, settlements, or groups.
                  </p>
                </div>
              </div>
            </div>
            {/* Speech bubble tail */}
            <div className="absolute left-8 -bottom-2 w-4 h-4 bg-gradient-to-r from-gray-50 to-blue-50 transform rotate-45 border-r border-b border-gray-100"></div>
          </div>
          
          {/* Input Section */}
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your expenses..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;