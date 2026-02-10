import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, MicIcon, StopCircleIcon } from './icons/Icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { LanguageCode } from '../types';
import translations from '../services/translations';

interface InputBarProps {
  onSendMessage: (text: string, imageBase64: string | null) => void;
  isLoading: boolean;
  language: LanguageCode;
}

const getVoiceRecognitionLang = (lang: LanguageCode): string => {
    const langMap: Record<LanguageCode, string> = {
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
        bho: 'hi-IN', 
    };
    return langMap[lang] || 'en-IN';
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, language }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, transcript, startListening, stopListening, browserSupportsSpeechRecognition } = useVoiceRecognition({ 
    lang: getVoiceRecognitionLang(language)
  });
  const t = (translations.inputBar as any)[language];
  
  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    if ((text.trim() || image) && !isLoading) {
      onSendMessage(text, image);
      setText('');
      setImage(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto space-y-3">
        {image && (
          <div className="relative w-24 h-24 group">
            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-300 shadow-sm" />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
            >
              &times;
            </button>
          </div>
        )}
        
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-lg p-2 focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-green-700 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Attach file"
            title="Upload Image"
          >
            <PaperclipIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? t.listening : t.typing}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-2 text-gray-800 placeholder-gray-400 min-h-[40px] max-h-[120px]"
            rows={1}
          />
          
           {browserSupportsSpeechRecognition && (
            <button 
                onClick={toggleListening} 
                className={`p-2 rounded-full transition-all duration-200 ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-green-700 hover:bg-gray-100'}`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
                title="Voice Input"
            >
              {isListening ? <StopCircleIcon className="w-6 h-6" /> : <MicIcon className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={isLoading || (!text.trim() && !image)}
            className={`p-2 rounded-full shadow-sm transition-all duration-200 flex items-center justify-center ${
                isLoading || (!text.trim() && !image) 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:scale-95'
            }`}
            aria-label="Send message"
            title="Send"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;