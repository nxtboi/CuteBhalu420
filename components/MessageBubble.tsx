import React, { useState, useEffect } from 'react';
import { ChatMessage, Role, LanguageCode } from '../types';
import { UserIcon, RobotIcon, SpeakerIcon, StopCircleIcon } from './icons/Icons';

interface MessageBubbleProps {
  message: ChatMessage;
  language: LanguageCode;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, language }) => {
  const isUser = message.role === Role.User;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
        }
    };
  }, [isSpeaking]);

  const handleSpeak = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    
    const latinCount = (message.text.match(/[a-zA-Z]/g) || []).length;
    const isEnglishLikely = latinCount > message.text.length / 2;

    const langMap: Record<string, string> = {
        en: 'en-IN', 
        hi: 'hi-IN', 
        pa: 'pa-IN', 
        bn: 'bn-IN', 
        mr: 'mr-IN', 
        gu: 'gu-IN', 
        te: 'te-IN', 
        kn: 'kn-IN',
        rwr: 'hi-IN', 
        bgc: 'hi-IN', 
        bho: 'hi-IN' 
    };

    utterance.lang = isEnglishLikely ? 'en-IN' : (langMap[language] || 'en-IN');
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  const renderTextWithFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\n)/g).filter(part => part);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-200 text-sm rounded px-1 font-mono">{part.slice(1, -1)}</code>;
      }
      if (part === '\n') {
        return <br key={index} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm">
          <RobotIcon className="w-5 h-5" />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[85%] md:max-w-lg">
          <div
            className={`rounded-xl p-3 shadow-md ${
              isUser
                ? 'bg-green-700 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}
          >
            {message.image && (
              <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-h-64 w-full object-cover" />
            )}
            <div className="prose prose-sm text-inherit whitespace-pre-wrap break-words">{renderTextWithFormatting(message.text)}</div>
          </div>
          {!isUser && (
             <button 
                onClick={handleSpeak}
                className="self-start text-gray-500 hover:text-green-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
             >
                 {isSpeaking ? <StopCircleIcon className="w-5 h-5 text-red-500" /> : <SpeakerIcon className="w-5 h-5" />}
             </button>
          )}
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0 mt-1 shadow-sm">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;