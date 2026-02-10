import React, { useEffect, useRef } from 'react';
import { ChatMessage, LanguageCode } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  language: LanguageCode;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, language }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} language={language} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <span className="text-gray-500 text-sm">AI is thinking</span>
                  <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
              </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatWindow;