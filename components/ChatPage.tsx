import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chat, Content, Part, GenerateContentResponse } from '@google/genai';
import { ChatMessage, Role, LanguageCode, User, ChatSession } from '../types';
import { generateChatTitle, getAiClient } from '../services/geminiService';
import { getChatSession, saveChatSession } from '../services/chatHistoryService';
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

  const chatRef = useRef<Chat | null>(null);

  const getSystemInstruction = useCallback(() => {
    const langName = languages.find(l => l.code === language)?.name || 'English';
    return `
    You are Krishi Mitra, a friendly and knowledgeable AI assistant specifically for Indian farmers. 
    
    **LANGUAGE INSTRUCTIONS:**
    - Detect the language of the User's input.
    - **ALWAYS** respond in the **SAME** language as the user's input.
    - Example: If the user types in English, reply in English. If they type in Hindi, reply in Hindi. If they type in Punjabi, reply in Punjabi.
    - If the user's language is mixed, unclear, or you cannot detect it, default to responding in ${langName}.

    **MODERATION LAYER & INSTRUCTIONS:**
    1. **Analyze the input:** Determine if the user's text or image is related to agriculture (farming, crops, soil, weather, irrigation, pests, livestock, dairy, farm tools, market prices, or rural government schemes).
    
    2. **If Agriculture-Related:** 
       - Provide a helpful, concise, and practical answer tailored to the Indian context.
       - If needed, ask for specific details (crop name, soil type) to give better advice.

    3. **If NOT Agriculture-Related:** 
       - **DO NOT** answer the question (e.g., do not write code, do not discuss politics, movies, or general math).
       - Instead, provide a **CUTE, FUNNY, and POLITE** refusal message.
       - Use farming metaphors or puns.
       - Use emojis like 🚜, 🐮, 🌾, 🍅.
       - Example Refusal Style: "Oh, I'm just a simple AI who loves tractors! 🚜 I can't help with that, but I can tell you how to grow the biggest pumpkins! 🎃" or "My brain is full of seeds, not movie scripts! 🌽 Ask me about farming instead!"
    `;
  }, [language]);

  const mapMessagesToHistory = (messages: ChatMessage[]): Content[] => {
    return messages.map(msg => {
        const parts: Part[] = [];
        if (msg.text) {
             parts.push({ text: msg.text });
        }
        if (msg.image) {
            parts.push({
                inlineData: {
                    mimeType: msg.image.substring(5, msg.image.indexOf(';')),
                    data: msg.image.split(',')[1],
                }
            });
        }
        return {
            role: msg.role === Role.User ? 'user' : 'model',
            parts,
        };
    }).filter(c => c.parts.length > 0);
  };

  // Effect to load a chat session or start a new one
  useEffect(() => {
    let session: ChatSession | null = null;
    if (activeChatId) {
        session = getChatSession(user.username, activeChatId);
    }
    
    setCurrentSession(session);
    
    if (session) {
        setMessages(session.messages);
    } else {
        setMessages([
          {
            id: Date.now(),
            role: Role.AI,
            text: t.initialMessage,
          },
        ]);
    }

    try {
        const ai = getAiClient();
        const history = session ? mapMessagesToHistory(session.messages) : [];
        
        chatRef.current = ai.chats.create({ 
            model: 'gemini-3-flash-preview', 
            config: { 
                systemInstruction: getSystemInstruction(),
                thinkingConfig: { thinkingBudget: 0 } 
            },
            history: history 
        });
    } catch (e) {
        console.error("Failed to initialize chat session:", e);
        setError("Failed to initialize AI chat session.");
    }

  }, [activeChatId, user.username, language, getSystemInstruction, t.initialMessage]);
  

  const handleSendMessage = useCallback(async (text: string, imageBase64: string | null) => {
    if (!text && !imageBase64) return;
    
    if (!chatRef.current) {
        setError("Chat is not initialized. Please try refreshing the page.");
        return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: Role.User,
      text: text,
      image: imageBase64,
    };
    
    const messagesBeforeSend = messages;

    const aiMessagePlaceholder: ChatMessage = {
      id: Date.now() + 1,
      role: Role.AI,
      text: '',
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage, aiMessagePlaceholder]);
    setIsLoading(true);
    setError(null);

    try {
        const messageParts: Part[] = [];
        if (text) {
            messageParts.push({ text });
        }
        if (imageBase64) {
            messageParts.push({
                inlineData: {
                    mimeType: imageBase64.substring(5, imageBase64.indexOf(';')),
                    data: imageBase64.split(',')[1],
                }
            });
        }
      
      const stream = await chatRef.current.sendMessageStream({ message: messageParts });

      let fullResponseText = '';
      for await (const chunk of stream) {
        const responseChunk = chunk as GenerateContentResponse;
        if (responseChunk.text) {
            fullResponseText += responseChunk.text;
            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                const lastMessageIndex = newMessages.length - 1;
                if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === Role.AI) {
                    newMessages[lastMessageIndex] = { 
                        ...newMessages[lastMessageIndex], 
                        text: fullResponseText 
                    };
                }
                return newMessages;
            });
        }
      }

      const finalMessages = [...messagesBeforeSend, userMessage, { ...aiMessagePlaceholder, text: fullResponseText }];
      
      let sessionToSave: ChatSession;
      if (currentSession) {
        sessionToSave = { ...currentSession, messages: finalMessages, timestamp: Date.now() };
        saveChatSession(user.username, sessionToSave);
      } else {
        const initialTitle = text 
            ? (text.substring(0, 30) + (text.length > 30 ? '...' : '')) 
            : "New Chat Image";

        const newSession = {
          id: String(Date.now()),
          title: initialTitle,
          timestamp: Date.now(),
          messages: finalMessages,
        };
        
        sessionToSave = newSession;
        setCurrentSession(newSession);
        saveChatSession(user.username, newSession);

        if (text) {
            generateChatTitle(text).then((aiTitle) => {
                if (aiTitle) {
                    const updatedSession = { ...newSession, title: aiTitle };
                    saveChatSession(user.username, updatedSession);
                    setCurrentSession(prev => prev && prev.id === newSession.id ? updatedSession : prev);
                }
            }).catch(console.error);
        }
      }

    } catch (err) {
      const errorMessage = t.error;
      setError(errorMessage);
       const aiErrorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: Role.AI,
        text: `Sorry, I encountered an error. ${errorMessage}`,
      };
      setMessages([...messagesBeforeSend, userMessage, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentSession, user.username, t.error]);


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