import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatLog: React.FC = () => {
  const [message, setMessage] = useState('');

  // Mock chat messages for demonstration
  const messages = [
    { id: 1, sender: 'user', content: 'Can you summarize the key points?' },
    { id: 2, sender: 'ai', content: 'Based on the document, the main points are...' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-100'
                    : 'bg-purple-500/20 border border-purple-500/30 text-purple-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700/50 backdrop-blur-sm">
        <div className="flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about the document..."
            className="flex-1 bg-gray-800/30 border border-gray-700/50 rounded-xl px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatLog;