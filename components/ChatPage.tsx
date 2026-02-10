

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, Role, LanguageCode, User, ChatSession } from '../types';
import { generateChatTitle, generateResponseStream } from '../services/geminiService';
import * as chatHistoryService from '../services/chatHistoryService';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';
import translations from '../services/translations';
import { languages } from '../services/translations';

interface ChatPageProps {
    user: User;
    language: LanguageCode;
    activeChatId: string | null;
}

const ChatPage: React.FC<ChatPageProps> = ({ user, language, activeChatId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const t = (translations.chatPage as any)[language];

  // Effect to load a chat session or start a new one
  useEffect(() => {
    const loadSession = async () => {
        setIsLoading(true);
        try {
            if (activeChatId) {
                const history = await chatHistoryService.getChatHistory(user.username);
                const session = history.find(s => s.id === activeChatId);
                if (session) {
                    setCurrentSession(session);
                    setMessages(session.messages);
                } else {
                    // This case might happen if the ID is stale
                    console.warn(`Session with ID ${activeChatId} not found.`);
                    setMessages([{ id: Date.now(), role: Role.AI, text: t.initialMessage }]);
                    setCurrentSession(null);
                }
            } else {
                setMessages([{ id: Date.now(), role: Role.AI, text: t.initialMessage }]);
                setCurrentSession(null);
            }
        } catch (e: any) {
            setError(e.message || "Failed to load chat session.");
        } finally {
            setIsLoading(false);
        }
    };
    loadSession();
  }, [activeChatId, user.username, t.initialMessage]);
  

  const handleSendMessage = useCallback(async (text: string, imageBase64: string | null) => {
    if ((!text.trim() && !imageBase64) || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: Role.User,
      text: text,
      image: imageBase64,
    };
    
    // Optimistic update of the UI
    const aiMessagePlaceholder: ChatMessage = {
      id: Date.now() + 1,
      role: Role.AI,
      text: '',
    };
    const newMessages = [...messages, userMessage, aiMessagePlaceholder];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    let fullResponseText = '';
    
    try {
        const onChunk = (chunk: string) => {
            fullResponseText += chunk;
            setMessages(prevMessages => {
                const updatedMessages = [...prevMessages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.role === Role.AI) {
                    lastMessage.text = fullResponseText;
                }
                return updatedMessages;
            });
        };
        
        const systemInstruction = `You are Krishi Mitra AI, a friendly and expert farming assistant for Indian farmers. Your primary goal is to provide accurate, helpful, and easy-to-understand advice on all aspects of agriculture, including crops, soil, pests, weather, and government schemes.

If a user asks a question that is clearly NOT related to farming, agriculture, plants, livestock, or rural life (e.g., asking about celebrities, politics, programming, complex math, etc.), you MUST respond with a short, cute, and witty reply that gently reminds them you are a farming expert. Make it a bit funny or punny.

Examples of such replies:
- "I'm an expert in soil, not showbiz! Got any questions about compost?"
- "My circuits are buzzing with crop data, not celebrity gossip! How about we talk about wheat instead?"
- "Whoops, that question is a bit outside my field! (Pun intended). Let's get back to farming."
- "I'm afraid my knowledge doesn't extend past the farm gate. What's your question about agriculture?"

For all other questions related to farming, provide a direct and helpful answer. Your responses should be formatted for easy readability with markdown.`;

        const options = {
            model: 'gemini-3-flash-preview', // Use the faster model for chat
            config: {
                systemInstruction: systemInstruction,
            },
        };
        
        await generateResponseStream(text, imageBase64, onChunk, options);
      
    } catch (err: any) {
      const errorMessage = t.error;
      setError(errorMessage);
      fullResponseText = `Sorry, I encountered an error. ${errorMessage}`;
    } finally {
      setIsLoading(false);

      // Finalize messages and save session
      const finalAiMessage = { ...aiMessagePlaceholder, text: fullResponseText };
      const finalMessages = [...messages, userMessage, finalAiMessage];
      setMessages(finalMessages);

      try {
          if (currentSession) {
            const updatedSession = { ...currentSession, messages: finalMessages, timestamp: Date.now() };
            await chatHistoryService.saveChatSession(user.username, updatedSession);
            setCurrentSession(updatedSession);
          } else {
            const initialTitle = text.substring(0, 30) + (text.length > 30 ? '...' : '') || "New Chat";
            const newSession: ChatSession = {
              id: String(Date.now()),
              title: initialTitle,
              timestamp: Date.now(),
              messages: finalMessages,
            };
            await chatHistoryService.saveChatSession(user.username, newSession);
            setCurrentSession(newSession);
            
            // Generate title in the background
            generateChatTitle(text).then(async (aiTitle) => {
                if (aiTitle) {
                    const updatedSessionWithTitle = { ...newSession, title: aiTitle };
                    await chatHistoryService.saveChatSession(user.username, updatedSessionWithTitle);
                    setCurrentSession(prev => prev && prev.id === newSession.id ? updatedSessionWithTitle : prev);
                }
            }).catch(console.error);
          }
      } catch (saveError: any) {
          console.error("Failed to save chat session:", saveError);
          setError("Failed to save chat session. Your message might be lost upon refresh.");
      }
    }
  }, [messages, currentSession, user.username, t.error, isLoading]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} language={language} />
        {error && <div className="text-center text-red-500 p-2">{error}</div>}
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} language={language}/>
      </div>
    </div>
  );
};

export default ChatPage;