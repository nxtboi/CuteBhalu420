// NOTE: The content of all project files is stored here to simulate a virtual file system.
// This is necessary because we cannot dynamically read files from the filesystem in a browser environment.
export const initialProjectFiles: Record<string, string> = {
  'index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './AppContainer';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>
);`,
  'metadata.json': `{
  "name": "Krishi Mitra AI",
  "description": "An AI-powered chat assistant for farmers in India, providing comprehensive agricultural support from crop planning and health analysis to innovative tool solutions, with multilingual voice and text input.",
  "requestFramePermissions": [
    "microphone",
    "geolocation"
  ]
}`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Krishi Mitra AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Poppins', sans-serif;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@^19.2.4",
    "react-dom/": "https://esm.sh/react-dom@^19.2.4/",
    "react/": "https://esm.sh/react@^19.2.4/",
    "@google/genai": "https://esm.sh/@google/genai@^1.40.0",
    "react-syntax-highlighter": "https://esm.sh/react-syntax-highlighter@15.5.0",
    "react-syntax-highlighter/": "https://esm.sh/react-syntax-highlighter@15.5.0/"
  }
}
</script>
</head>
  <body class="bg-gray-100">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`,
  'App.tsx': `import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import ChatPage from './components/ChatPage';
import ProfilePage from './components/ProfilePage';
import ShopPage from './components/ShopPage';
import IrrigationPlannerPage from './components/IrrigationPlannerPage';
import Header from './components/Header';
import AdminPage from './components/admin/AdminPage';
import { User, LanguageCode } from './types';
import { clearCurrentUser, getCurrentUser } from './services/authService';

export type Page = 'dashboard' | 'chat' | 'profile' | 'shop' | 'irrigation';

interface AppProps {
  projectFiles: Record<string, string>;
  onUpdateFiles: (updatedFiles: Record<string, { content: string }>) => void;
}

const App: React.FC<AppProps> = ({ projectFiles, onUpdateFiles }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(currentUser?.username === 'admin');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.username === 'admin') {
      setIsAdmin(true);
    } else {
      setCurrentPage('dashboard');
    }
  };
  
  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setIsAdmin(false);
    setAuthPage('login');
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleNavigation = (page: Page) => {
    if (page === 'chat') {
        setActiveChatId(null); // This signifies a new chat
    }
    setCurrentPage(page);
  };
  
  const handleViewChat = (sessionId: string) => {
    setActiveChatId(sessionId);
    setCurrentPage('chat');
  }

  if (!currentUser) {
    if (authPage === 'login') {
      return <LoginPage 
        onAuthSuccess={handleAuthSuccess} 
        onSwitchToSignup={() => setAuthPage('signup')}
        language={language}
        setLanguage={setLanguage}
      />;
    } else {
      return <SignupPage 
        onAuthSuccess={handleAuthSuccess} 
        onSwitchToLogin={() => setAuthPage('login')}
        language={language}
        setLanguage={setLanguage}
      />;
    }
  }
  
  // If user is admin, show the admin panel
  if (isAdmin) {
    return <AdminPage 
              user={currentUser} 
              onLogout={handleLogout} 
              projectFiles={projectFiles}
              onUpdateFiles={onUpdateFiles}
            />;
  }

  // Otherwise, show the regular farmer app
  return (
    <div className="flex flex-col h-screen bg-stone-50">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
      />
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <Dashboard user={currentUser} onNavigate={handleNavigation} onViewChat={handleViewChat} language={language} />}
        {currentPage === 'chat' && <ChatPage user={currentUser} language={language} activeChatId={activeChatId} />}
        {currentPage === 'profile' && <ProfilePage user={currentUser} onUserUpdate={handleUserUpdate} language={language}/>}
        {currentPage === 'shop' && <ShopPage language={language}/>}
        {currentPage === 'irrigation' && <IrrigationPlannerPage language={language} />}
      </main>
      <footer className="p-4 text-center text-xs text-stone-600 bg-stone-100 border-t border-stone-200">
        <p>© Copyright FarmFusion AI 2026</p>
      </footer>
    </div>
  );
};

export default App;`,
  'types.ts': `export enum Role {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: number;
  role: Role;
  text: string;
  image?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface FarmDetails {
  crop: string;
  soil: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export type LanguageCode = 'en' | 'hi' | 'pa' | 'bn' | 'mr' | 'gu' | 'te' | 'kn' | 'rwr' | 'bgc' | 'bho';

export interface Language {
  code: LanguageCode;
  name: string; // e.g., "English"
  nativeName: string; // e.g., "English" or "हिन्दी"
}


export interface User {
  fullName: string;
  username: string;
  phone?: string;
  password?: string; // Password is used for creation, but should not be passed around.
}

export enum Crop {
    Rice = "Rice",
    Wheat = "Wheat",
    Maize = "Maize",
    Sugarcane = "Sugarcane",
    Cotton = "Cotton",
    Soybean = "Soybean",
    Potato = "Potato",
    Tomato = "Tomato",
    Onion = "Onion",
    Mustard = "Mustard"
}

export enum SoilType {
    Alluvial = "Alluvial Soil",
    Black = "Black Soil",
    Red = "Red and Yellow Soil",
    Laterite = "Laterite Soil",
    Arid = "Arid Soil",
    Saline = "Saline Soil",
    Peaty = "Peaty and Marshy Soil",
    Forest = "Forest Soil",
}


// E-commerce types
export enum ProductCategory {
  Seeds = "Seeds & Saplings",
  Fertilizers = "Fertilizers & Pesticides",
  Tools = "Farming Tools",
  Irrigation = "Irrigation Systems",
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  keywords: string[];
}

// Admin Panel Types
export type AdminPageType = 'dashboard' | 'users' | 'translations' | 'playground' | 'codeEditor';`,
  'services/geminiService.ts': `import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Use a variable to cache the initialized client.
let aiInstance: GoogleGenAI | null = null;

// Lazily initialize and cache the AI client.
// This ensures \`process.env.API_KEY\` is read at the time of the first API call,
// resolving potential timing issues, and prevents re-creating the client on every subsequent call.
const getAiClient = () => {
    if (aiInstance) {
        return aiInstance;
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
    }
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
    return aiInstance;
};

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const generateResponse = async (prompt: string, imageBase64: string | null): Promise<string> => {
  try {
    // Get the client instance just before making the call.
    const ai = getAiClient();
    const model = 'gemini-3-flash-preview';

    if (imageBase64) {
      const imageMimeType = imageBase64.substring(5, imageBase64.indexOf(';'));
      const imageData = imageBase64.split(',')[1];
      const imagePart = fileToGenerativePart(imageData, imageMimeType);
      
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }, imagePart] },
      });
      return response.text ?? "Sorry, I couldn't process that request.";

    } else {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text ?? "Sorry, I couldn't process that request.";
    }
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    throw new Error("Failed to communicate with the AI model. Please check your network connection and API key.");
  }
};

/**
 * Generates a response from the AI model using streaming.
 * @param prompt The text prompt to send to the model.
 * @param imageBase64 Optional base64 encoded image data.
 * @param onChunk A callback function that receives text chunks as they are generated.
 */
export const generateResponseStream = async (
    prompt: string, 
    imageBase64: string | null,
    onChunk: (chunk: string) => void
): Promise<void> => {
    try {
        const ai = getAiClient();
        const model = 'gemini-3-flash-preview';

        const contents = imageBase64 
            ? { parts: [
                { text: prompt }, 
                fileToGenerativePart(imageBase64.split(',')[1], imageBase64.substring(5, imageBase64.indexOf(';')))
              ]}
            : prompt;

        const responseStream = await ai.models.generateContentStream({
            model,
            contents,
        });

        for await (const chunk of responseStream) {
            const responseChunk = chunk as GenerateContentResponse;
            if (responseChunk.text) {
                onChunk(responseChunk.text);
            }
        }
    } catch (error) {
        console.error("Error generating streaming response from Gemini:", error);
        throw new Error("Failed to communicate with the AI model. Please check your network connection and API key.");
    }
};


interface PlaygroundConfig {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    topK?: number;
    topP?: number;
}

export const generatePlaygroundResponse = async (config: PlaygroundConfig): Promise<string> => {
    try {
        const ai = getAiClient();
        const model = 'gemini-3-flash-preview'; 

        const response = await ai.models.generateContent({
            model,
            contents: config.prompt,
            config: {
                systemInstruction: config.systemInstruction,
                temperature: config.temperature,
                topK: config.topK,
                topP: config.topP,
            },
        });

        return response.text ?? "Sorry, the model did not return a response.";

    } catch (error) {
        console.error("Error in playground generation:", error);
        throw new Error("Failed to get response from AI model. Please check your configuration and API key.");
    }
};

export const generateCodeEditResponse = async (fullPrompt: string): Promise<string> => {
    try {
        const ai = getAiClient();
        // Use a more powerful model for complex code generation tasks.
        const model = 'gemini-3-pro-preview'; 

        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
        });

        return response.text ?? "Sorry, the model did not return a valid response.";
    } catch (error) {
        console.error("Error in code edit generation:", error);
        throw new Error("Failed to get response from AI model. Please check your configuration, API key, and the prompt length.");
    }
};`,
  'AppContainer.tsx': `import React, { useState } from 'react';
import App from './App';
import { initialProjectFiles } from './virtualFileSystem';

const AppContainer: React.FC = () => {
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>(initialProjectFiles);

  const handleUpdateFiles = (updatedFiles: Record<string, { content: string }>) => {
    setProjectFiles(prevFiles => {
      const newFiles = { ...prevFiles };
      for (const path in updatedFiles) {
        // Ensure we only update files that are part of our virtual system
        if (newFiles.hasOwnProperty(path)) {
          newFiles[path] = updatedFiles[path].content;
        }
      }
      return newFiles;
    });
  };

  return <App projectFiles={projectFiles} onUpdateFiles={handleUpdateFiles} />;
};

export default AppContainer;`,
  'components/SetupModal.tsx': `import React, { useState } from 'react';
import { FarmDetails, Crop, SoilType, LanguageCode } from '../types';
import { LocationIcon } from './icons/Icons';
import translations from '../services/translations';

interface SetupModalProps {
  onComplete: (details: FarmDetails) => void;
  language: LanguageCode;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete, language }) => {
  const [crop, setCrop] = useState<Crop>(Crop.Rice);
  const [soil, setSoil] = useState<SoilType>(SoilType.Alluvial);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const t = (translations.setupModal as any)[language];

  const handleStart = () => {
    setError(null);
    setIsLocating(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onComplete({
          crop,
          soil,
          location: { latitude, longitude },
        });
        setIsLocating(false);
      },
      () => {
        setError(t.buttonError);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">{t.title}</h2>
        <p className="text-gray-600 mb-6 text-center">{t.description}</p>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-1">
              {t.cropLabel}
            </label>
            <select
              id="crop"
              value={crop}
              onChange={(e) => setCrop(e.target.value as Crop)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm"
            >
              {Object.values(Crop).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="soil" className="block text-sm font-medium text-gray-700 mb-1">
              {t.soilLabel}
            </label>
            <select
              id="soil"
              value={soil}
              onChange={(e) => setSoil(e.target.value as SoilType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm"
            >
              {Object.values(SoilType).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="mt-8">
          <button
            onClick={handleStart}
            disabled={isLocating}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLocating ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.buttonLocating}
                </>
            ) : (
                <>
                    <LocationIcon className="mr-2"/>
                    {t.buttonStart}
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupModal;`,
  'components/ChatWindow.tsx': `import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-white/50">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
              <div className="flex items-center space-x-2 bg-gray-200 rounded-lg p-3">
                  <span className="text-gray-500">AI is thinking</span>
                  <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  </div>
              </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default ChatWindow;`,
  'components/MessageBubble.tsx': `import React from 'react';
import { ChatMessage, Role } from '../types';
import { UserIcon, RobotIcon } from './icons/Icons';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.User;

  const renderTextWithFormatting = (text: string) => {
    const parts = text.split(/(\\*\\*.*?\\*\\*|\`.*?\`|\\n)/g).filter(part => part);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('\`') && part.endsWith('\`')) {
        return <code key={index} className="bg-gray-200 text-sm rounded px-1 font-mono">{part.slice(1, -1)}</code>;
      }
      if (part === '\\n') {
        return <br key={index} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={\`flex items-start gap-3 \${isUser ? 'justify-end' : 'justify-start'}\`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white flex-shrink-0">
          <RobotIcon />
        </div>
      )}
      <div
        className={\`max-w-lg rounded-xl p-3 shadow-md \${
          isUser
            ? 'bg-green-700 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none'
        }\`}
      >
        {message.image && (
          <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-h-64" />
        )}
        <div className="prose prose-sm text-inherit whitespace-pre-wrap">{renderTextWithFormatting(message.text)}</div>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;`,
  'components/InputBar.tsx': `import React, { useState, useRef, useEffect } from 'react';
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
        rwr: 'hi-IN', // Marwari fallback
        bgc: 'hi-IN', // Haryanvi fallback
        bho: 'hi-IN', // Bhojpuri fallback
    };
    return langMap[lang] || 'en-IN';
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, language }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening, browserSupportsSpeechRecognition } = useVoiceRecognition({ 
    lang: getVoiceRecognitionLang(language)
  });
  const t = (translations.inputBar as any)[language];
  
  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    if ((text.trim() || image) && !isLoading) {
      onSendMessage(text, image);
      setText('');
      setImage(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
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
    <div className="bg-gray-100 p-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        {image && (
          <div className="relative w-24 h-24 mb-2">
            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-md" />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              X
            </button>
          </div>
        )}
        <div className="flex items-end bg-white border border-gray-300 rounded-lg shadow-sm p-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-green-700"
            aria-label="Attach file"
          >
            <PaperclipIcon />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? t.listening : t.typing}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none p-2 text-gray-800 placeholder-gray-500"
            rows={1}
            style={{ maxHeight: '100px' }}
          />
           {browserSupportsSpeechRecognition && (
            <button onClick={toggleListening} className="p-2 text-gray-500 hover:text-green-700" aria-label={isListening ? "Stop listening" : "Start listening"}>
              {isListening ? <StopCircleIcon className="text-red-500" /> : <MicIcon />}
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={isLoading || (!text.trim() && !image)}
            className="p-2 text-white bg-green-700 rounded-full disabled:bg-gray-400 hover:bg-green-800 transition-colors"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;`,
  'hooks/useVoiceRecognition.ts': `import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const getSpeechRecognition = () => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  }
  return null;
};

const SpeechRecognitionApi = getSpeechRecognition();

export const useVoiceRecognition = ({ lang }: { lang: string }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionApi) {
      console.warn('Speech Recognition is not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if(finalTranscript) {
        setTranscript(prev => prev ? \`\${prev} \${finalTranscript}\`: finalTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [lang]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition: !!SpeechRecognitionApi,
  };
};`,
  'components/icons/Icons.tsx': `import React from 'react';

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
    <circle cx="12" cy="12" r="10"></circle>
    <rect x="9" y="9" width="6" height="6"></rect>
  </svg>
);

export const LocationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
    <circle cx="12" cy="5" r="3"></circle>
    <path d="M12 8v3M8 11h8"></path>
    <line x1="8" y1="16" x2="8.01" y2="16"></line>
    <line x1="16" y1="16" x2="16.01" y2="16"></line>
  </svg>
);

export const BackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

export const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

export const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

export const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

export const AmazonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Amazon</title>
        <path d="M16.313 14.823c-.156.3-.39.548-.67.728-.28.18-.596.27-.926.27-.45 0-.875-.12-1.25-.36-1.031-.66-1.531-1.89-1.469-3.33.031-.72.266-1.38.688-1.922.422-.547.984-.945 1.625-1.156.453-.157.922-.227 1.39-.227.563 0 1.094.102 1.578.305.906.39 1.484 1.25 1.484 2.453 0 .28-.031.547-.078.797l-3.328.016c.063.812.5 1.406 1.188 1.406.406 0 .766-.172 1.016-.484l.218.828zm-1.578-3.344c-.031-.563-.312-1.016-.719-1.016-.438 0-.828.422-.938.985h1.657v.03zM21.5 24H2.5C1.125 24 0 22.875 0 21.5V2.5C0 1.125 1.125 0 2.5 0h19C22.875 0 24 1.125 24 2.5v19c0 1.375-1.125 2.5-2.5 2.5zM22.5 21.5c0-.563-.469-1-1-1H2.5c-.562 0-1 .438-1 1V2.5c0-.563.438-1 1-1h19c.531 0 1 .438 1 1v19z" fill="currentColor"/>
    </svg>
);

export const FlipkartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Flipkart</title>
        <path d="M22.213 6.613H17.88V2.946h-3.957v3.667H9.72v3.666h4.203v5.52h4.247v-5.52h3.043zM1.46 14.054h8.26V9.887H1.46z" fill="#2874F0"/>
    </svg>
);

export const IndiaMartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>IndiaMART</title>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.124 18.421H8.35v-5.18h2.527c1.373 0 2.486 1.114 2.486 2.486v.208c0 1.373-1.113 2.486-2.488 2.486zm.104-7.668H8.35V5.578h2.63c1.372 0 2.485 1.114 2.485 2.486v.208c0 1.372-1.113 2.486-2.485 2.486zm5.833 6.035l-2.073-2.072 2.073-2.073c.188-.188.188-.49 0-.679l-.679-.679a.479.479 0 00-.679 0l-2.073 2.073-2.072-2.073a.479.479 0 00-.679 0l-.679.679a.479.479 0 000 .679l2.073 2.073-2.073 2.072a.479.479 0 000 .679l.679.679c.188.188.49.188.679 0l2.072-2.073 2.073 2.073c.188.188.49.188.679 0l.679-.679a.479.479 0 000-.679z" fill="#00A699"/>
    </svg>
);

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 3.03 1.09 5.4 2.5 6.94L8 18h8l.5-2.06C17.91 14.4 19 11.03 19 9a7 7 0 0 0-7-7z"></path>
    </svg>
);

export const WaterDropIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22a7 7 0 0 0 7-7c0-2.39-1.08-4.83-3-6.5S12 2 12 2s-3.08 1.67-5 3.5S5 12.61 5 15a7 7 0 0 0 7 7z"></path>
    </svg>
);

export const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5h5"></path>
        <path d="M12 7v5l4 2"></path>
    </svg>
);

export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

export const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export const TranslateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14"></path>
        <path d="M12 5l7 7-7 7"></path>
        <path d="M12 19l7-7-7-7"></path>
        <path d="M5 12h1a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H5"></path>
        <path d="M5 12h1a3 3 0 0 0 3-3v0a3 3 0 0 0-3-3H5"></path>
    </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z" />
        <path d="M22 13l-1.5 1.5L19 16l1.5 1.5L22 19l1.5-1.5L25 16l-1.5-1.5z" />
        <path d="M5 3l-1.5 1.5L2 6l1.5 1.5L5 9l1.5-1.5L8 6l-1.5-1.5z" />
    </svg>
);

export const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);`,
  'components/admin/AdminPage.tsx': `import React, { useState } from 'react';
import { User, AdminPageType } from '../../types';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import UserManagementPage from './UserManagementPage';
import TranslationsEditor from './TranslationsEditor';
import PlaygroundPage from './PlaygroundPage';
import CodeEditorPage from './CodeEditorPage';
import { LogoutIcon } from '../icons/Icons';

interface AdminPageProps {
  user: User;
  onLogout: () => void;
  projectFiles: Record<string, string>;
  onUpdateFiles: (updatedFiles: Record<string, { content: string }>) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ user, onLogout, projectFiles, onUpdateFiles }) => {
  const [activePage, setActivePage] = useState<AdminPageType>('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagementPage />;
      case 'translations':
        return <TranslationsEditor />;
      case 'playground':
        return <PlaygroundPage />;
      case 'codeEditor':
        return <CodeEditorPage projectFiles={projectFiles} onUpdateFiles={onUpdateFiles} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <AdminSidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
          <h1 className="text-2xl font-semibold text-gray-800 capitalize">{activePage === 'codeEditor' ? 'AI Code Editor' : activePage}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.fullName}</span>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-600"
              aria-label="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;`,
  'components/admin/AdminSidebar.tsx': `import React from 'react';
import { AdminPageType } from '../../types';
import { DashboardIcon, UsersIcon, TranslateIcon, RobotIcon, SparklesIcon, CodeIcon } from '../icons/Icons';

interface AdminSidebarProps {
  activePage: AdminPageType;
  setActivePage: (page: AdminPageType) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
    { id: 'users', label: 'User Management', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'translations', label: 'Translations Editor', icon: <TranslateIcon className="w-5 h-5" /> },
    { id: 'playground', label: 'AI Playground', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'codeEditor', label: 'AI Code Editor', icon: <CodeIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-700">
        <RobotIcon className="w-8 h-8 text-lime-400" />
        <span className="text-xl font-bold">Admin Panel</span>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id as AdminPageType)}
                className={\`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors \${
                  activePage === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }\`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>© Krishi Mitra AI</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;`,
  'components/admin/AdminDashboard.tsx': `import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/authService';
import { getAllChatData } from '../../services/chatHistoryService';
import { User } from '../../types';
import { UsersIcon, HistoryIcon } from '../icons/Icons';

const AdminDashboard: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalChatSessions, setTotalChatSessions] = useState(0);

  useEffect(() => {
    // Fetch total users
    const users = getAllUsers();
    setTotalUsers(users.length);

    // Fetch total chat sessions
    const chatData = getAllChatData();
    const sessionCount = Object.values(chatData).reduce((acc, userSessions) => acc + userSessions.length, 0);
    setTotalChatSessions(sessionCount);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Application Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<UsersIcon className="w-8 h-8 text-blue-500" />}
          title="Total Users"
          value={totalUsers.toString()}
          color="blue"
        />
        <StatCard
          icon={<HistoryIcon className="w-8 h-8 text-green-500" />}
          title="Total Chat Sessions"
          value={totalChatSessions.toString()}
          color="green"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    color: 'blue' | 'green' | 'purple' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        purple: 'bg-purple-100',
        yellow: 'bg-yellow-100',
    };
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-6">
            <div className={\`p-4 rounded-full \${colorClasses[color]}\`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};


export default AdminDashboard;`,
  'components/admin/UserManagementPage.tsx': `import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser } from '../../services/authService';
import { User } from '../../types';
import { TrashIcon } from '../icons/Icons';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm(\`Are you sure you want to delete the user "\${username}"? This cannot be undone.\`)) {
      const result = deleteUser(username);
      if (result.success) {
        setFeedback({ type: 'success', message: \`User "\${username}" has been deleted.\` });
        loadUsers(); // Refresh the list
      } else {
        setFeedback({ type: 'error', message: result.message || 'Failed to delete user.' });
      }
      setTimeout(() => setFeedback(null), 3000); // Clear feedback after 3 seconds
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Management</h2>
      
      {feedback && (
        <div className={\`p-4 mb-4 rounded-md text-sm \${
            feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }\`}>
          {feedback.message}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.username} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.username.toLowerCase() !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className="text-red-600 hover:text-red-900"
                        title={\`Delete \${user.username}\`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;`,
  'components/admin/TranslationsEditor.tsx': `import React, { useState } from 'react';
import { rawTranslations } from '../../services/translations';

const TranslationsEditor: React.FC = () => {
  const [jsonString, setJsonString] = useState(JSON.stringify(rawTranslations, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonString(e.target.value);
    try {
      JSON.parse(e.target.value);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format. Please correct the syntax.');
    }
  };

  const handleCopyToClipboard = () => {
    if (error) {
        alert("Cannot copy invalid JSON.");
        return;
    }
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Failed to copy.');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleReset = () => {
      if(window.confirm("Are you sure you want to reset all changes?")) {
        setJsonString(JSON.stringify(rawTranslations, null, 2));
        setError(null);
      }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Translations Editor</h2>
      <p className="text-gray-600 mb-6">
        Edit the translations below. After making changes, copy the JSON and replace the content of the \`services/translations.ts\` file.
      </p>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <textarea
          value={jsonString}
          onChange={handleJsonChange}
          className={\`w-full h-[60vh] p-4 font-mono text-sm border rounded-md focus:ring-2 focus:outline-none \${
            error ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
          }\`}
          spellCheck="false"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={handleCopyToClipboard}
          disabled={!!error}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {copySuccess ? copySuccess : 'Copy to Clipboard'}
        </button>
         <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default TranslationsEditor;`,
  'components/admin/PlaygroundPage.tsx': `import React, { useState } from 'react';
import { generatePlaygroundResponse } from '../../services/geminiService';
import { SparklesIcon } from '../icons/Icons';

const PlaygroundPage: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('Write a short story about a robot farmer in rural India who helps a village predict the monsoon.');
    const [systemInstruction, setSystemInstruction] = useState<string>('You are a creative storyteller who writes uplifting and imaginative stories.');
    const [temperature, setTemperature] = useState(0.7);
    const [topK, setTopK] = useState(40);
    const [topP, setTopP] = useState(0.95);

    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setResponse('');
        try {
            const result = await generatePlaygroundResponse({
                prompt,
                systemInstruction,
                temperature,
                topK,
                topP,
            });
            setResponse(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Playground</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md flex-1 flex flex-col gap-4">
                    {/* System Prompt */}
                    <div>
                        <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700 mb-1">System Instruction</label>
                        <textarea
                            id="system-prompt"
                            rows={3}
                            value={systemInstruction}
                            onChange={(e) => setSystemInstruction(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., You are a helpful assistant."
                        />
                    </div>

                    {/* User Prompt */}
                    <div>
                        <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-700 mb-1">User Prompt</label>
                        <textarea
                            id="user-prompt"
                            rows={8}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your prompt here..."
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt}
                        className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 self-start"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>

            {/* Config & Response */}
            <div className="w-full lg:w-2/5 flex flex-col gap-6">
                {/* Config */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                    {/* Temperature */}
                    <div className="mb-4">
                        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature: <span className="font-bold">{temperature.toFixed(2)}</span></label>
                        <input
                            type="range"
                            id="temperature"
                            min="0" max="1" step="0.05"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Top K */}
                    <div className="mb-4">
                         <label htmlFor="topK" className="block text-sm font-medium text-gray-700">Top-K: <span className="font-bold">{topK}</span></label>
                        <input
                            type="range"
                            id="topK"
                            min="1" max="100" step="1"
                            value={topK}
                            onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Top P */}
                    <div>
                         <label htmlFor="topP" className="block text-sm font-medium text-gray-700">Top-P: <span className="font-bold">{topP.toFixed(2)}</span></label>
                        <input
                            type="range"
                            id="topP"
                            min="0" max="1" step="0.05"
                            value={topP}
                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Response */}
                <div className="bg-gray-900 p-6 rounded-lg shadow-md flex-1 overflow-y-auto">
                     <h3 className="text-lg font-semibold mb-4 text-white">Response</h3>
                     {isLoading && <p className="text-gray-400">Generating response...</p>}
                     {error && <p className="text-red-400">{error}</p>}
                     {response && !isLoading && (
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200">{response}</pre>
                     )}
                     {!isLoading && !response && !error && <p className="text-gray-500">AI response will appear here.</p>}
                </div>
            </div>
        </div>
    );
};

export default PlaygroundPage;`,
  'components/admin/CodeEditorPage.tsx': `import React, { useState } from 'react';
import { generateCodeEditResponse } from '../../services/geminiService';
import { SparklesIcon } from '../icons/Icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yLight as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import PreviewModal from './PreviewModal';

interface CodeEditorPageProps {
    projectFiles: Record<string, string>;
    onUpdateFiles: (updatedFiles: Record<string, { content: string }>) => void;
}

const CodeEditorPage: React.FC<CodeEditorPageProps> = ({ projectFiles, onUpdateFiles }) => {
    const [selectedFile, setSelectedFile] = useState<string>('App.tsx');
    const [prompt, setPrompt] = useState<string>('Change the footer copyright year to 2025 and make the text color lime green.');
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string>('');
    const [isPreviewing, setIsPreviewing] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setAiResponse('');

        try {
            const allFilesString = Object.entries(projectFiles)
                .map(([path, content]) => \`--- START OF FILE \${path} ---\\n\\n\${content}\`)
                .join('\\n\\n');
            
            const fullPrompt = \`You are a world-class senior frontend engineer acting as a code generation bot. The user wants to change the current application.
Your task is to generate the necessary code changes based on the user's prompt.
The current application's source code is provided below, with each file delimited by "--- START OF FILE [path] ---".
You MUST only return the full content of the file(s) that need to be changed, enclosed in the specified XML format. Do not add any conversational text or explanations outside of the XML block. Keep your changes minimal to satisfy the user's request.

<changes>
  <change>
    <file>[full_path_of_file_1]</file>
    <description>[description of change]</description>
    <content><![CDATA[Full content of file_1]]></content>
  </change>
</changes>

USER PROMPT:
"\${prompt}"

CURRENT APP SOURCE CODE:
\${allFilesString}
\`;
            const result = await generateCodeEditResponse(fullPrompt);
            setAiResponse(result);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyChanges = () => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(aiResponse, "text/xml");
            const errorNode = xmlDoc.querySelector("parsererror");
            if (errorNode) {
                throw new Error("Failed to parse AI response as XML.");
            }

            const changeNodes = xmlDoc.getElementsByTagName('change');
            if (changeNodes.length === 0) {
                throw new Error("No valid <change> tags found in AI response.");
            }
            
            const updates: Record<string, { content: string }> = {};
            
            for (const node of Array.from(changeNodes)) {
                const file = node.getElementsByTagName('file')[0]?.textContent;
                const content = node.getElementsByTagName('content')[0]?.textContent; 
                if (file && content) {
                    updates[file] = { content };
                }
            }
            
            if (Object.keys(updates).length > 0) {
                onUpdateFiles(updates);
                setAiResponse('');
                setError(null);
                setNotification('Code changes applied successfully to the editor!');
                setTimeout(() => setNotification(''), 4000);
            } else {
                 throw new Error("Parsed XML contained no file content to apply.");
            }

        } catch (e: any) {
            console.error("Failed to parse or apply changes:", e);
            setError(\`Failed to apply changes: \${e.message}. Please check the AI response format.\`);
        }
    }
    
    const getLanguageForFile = (filename: string) => {
        const extension = filename.split('.').pop();
        switch (extension) {
            case 'tsx': return 'typescript';
            case 'ts': return 'typescript';
            case 'js': return 'javascript';
            case 'json': return 'json';
            case 'html': return 'xml';
            default: return 'plaintext';
        }
    }

    return (
        <div className="relative">
             {notification && (
                <div className="fixed top-24 right-6 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
                    {notification}
                </div>
            )}
            <div className="flex h-[80vh] gap-4">
                {/* File Browser */}
                <div className="w-1/4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-3">Project Files</h3>
                    <ul>
                        {Object.keys(projectFiles).sort().map(file => (
                            <li key={file}>
                                <button
                                    onClick={() => setSelectedFile(file)}
                                    className={\`w-full text-left p-2 rounded-md text-sm \${selectedFile === file ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100'}\`}
                                >
                                    {file}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Editor and Prompt */}
                <div className="w-3/4 flex flex-col gap-4">
                    <div className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-3">Viewing: {selectedFile}</h3>
                        <SyntaxHighlighter language={getLanguageForFile(selectedFile)} style={syntaxStyle} customStyle={{ margin: 0, padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }} codeTagProps={{style:{fontFamily: 'monospace'}}}>
                            {projectFiles[selectedFile] || 'File not found.'}
                        </SyntaxHighlighter>
                    </div>
                    <div className="h-2/5 bg-white rounded-lg shadow-md p-4 flex flex-col">
                        <h3 className="text-lg font-semibold mb-3">Prompt</h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the changes you want to make..."
                            className="w-full flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none mb-3"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 self-start"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isLoading ? 'Generating Changes...' : 'Generate Changes'}
                        </button>
                    </div>
                </div>

                {/* AI Response Modal */}
                {(isLoading || aiResponse || error) && (
                    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-xl font-semibold">AI Generated Response</h2>
                                <button onClick={() => { setAiResponse(''); setError(null); setIsLoading(false); }} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto">
                                {isLoading && <p className="text-center">Generating response...</p>}
                                {error && <div className="text-red-700 bg-red-100 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">{error}</div>}
                                {aiResponse && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">Review the changes below. Click "Apply Changes" to update the editor content.</p>
                                        <div className="bg-gray-50 p-2 rounded-md">
                                            <SyntaxHighlighter language="xml" style={syntaxStyle} customStyle={{ margin: 0, background: 'transparent' }} codeTagProps={{style:{fontFamily: 'monospace'}}}>
                                                {aiResponse}
                                            </SyntaxHighlighter>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {aiResponse && !error && (
                                <div className="p-4 border-t bg-gray-50 flex space-x-4">
                                    <button onClick={handleApplyChanges} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                                        Apply Changes
                                    </button>
                                    <button onClick={() => setIsPreviewing(true)} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
                                        Preview Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {isPreviewing && (
                    <PreviewModal
                        projectFiles={projectFiles}
                        onClose={() => setIsPreviewing(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default CodeEditorPage;`,
  'components/admin/PreviewModal.tsx': `import React, { useState, useEffect } from 'react';

declare const Babel: any; // Assuming Babel Standalone is loaded globally

interface PreviewModalProps {
  projectFiles: Record<string, string>;
  onClose: () => void;
}

// Simple path resolution utility
const resolvePath = (currentPath: string, relativePath: string): string => {
    const pathParts = currentPath.split('/');
    pathParts.pop(); // Remove current file name to get directory
    
    const relativeParts = relativePath.split('/');
    for (const part of relativeParts) {
        if (part === '.') continue;
        if (part === '..') {
            if (pathParts.length > 0) pathParts.pop();
        } else {
            pathParts.push(part);
        }
    }
    
    let resolved = pathParts.join('/');
    // Add extension if missing (naive check)
    if (!/\\.\\w+$/.test(resolved)) {
        if (projectFiles[resolved + '.ts']) resolved += '.ts';
        else if (projectFiles[resolved + '.tsx']) resolved += '.tsx';
    }
    return resolved;
}

const generatePreviewHtml = (projectFiles: Record<string, string>): { html: string, cleanup: () => void } => {
    const importMap: Record<string, any> = { imports: {} };
    const blobUrlsToRevoke: string[] = [];

    // Base HTML structure
    let baseHtml = projectFiles['index.html'];

    try {
        // Transpile all files and rewrite imports
        const rewrittenCodeMap = new Map<string, string>();

        for (const path in projectFiles) {
            if (/\\.(tsx|ts|js)$/.test(path)) {
                let content = projectFiles[path];
                 // Transpile using Babel
                let transpiledCode = Babel.transform(content, {
                    presets: ['react', 'typescript'],
                    filename: path,
                }).code;

                // Rewrite relative imports to use bare specifiers (which will be our paths)
                transpiledCode = transpiledCode.replace(/from\\s+['"](\\..*?)['"]/g, (_match: string, relativePath: string) => {
                    const absolutePath = resolvePath(path, relativePath);
                    return \`from "\${absolutePath}"\`;
                });
                
                rewrittenCodeMap.set(path, transpiledCode);
            }
        }
        
        // Create Blob URLs and populate the import map
        for (const [path, rewrittenCode] of rewrittenCodeMap.entries()) {
             const blob = new Blob([rewrittenCode], { type: 'application/javascript' });
             const url = URL.createObjectURL(blob);
             blobUrlsToRevoke.push(url);
             importMap.imports[path] = url;
        }

        // Inject the new import map
        const importMapString = JSON.stringify(importMap, null, 2);
        baseHtml = baseHtml.replace(/<script type="importmap">[\\s\\S]*?<\\/script>/, \`<script type="importmap">\${importMapString}</script>\`);

        // Change the entry point to use the module system
        baseHtml = baseHtml.replace(/<script type="module" src="\\/index.tsx"><\\/script>/, \`<script type="module">import "index.tsx";</script>\`);

    } catch (e) {
        console.error("Preview generation failed:", e);
        baseHtml = \`<body><h1>Preview Failed</h1><pre>\${(e as Error).message}</pre></body>\`;
    }

    const cleanup = () => {
        blobUrlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };

    return { html: baseHtml, cleanup };
};


const PreviewModal: React.FC<PreviewModalProps> = ({ projectFiles, onClose }) => {
  const [iframeContent, setIframeContent] = useState<string>('');
  
  useEffect(() => {
    const { html, cleanup } = generatePreviewHtml(projectFiles);
    setIframeContent(html);
    
    // Cleanup blob URLs when the component unmounts
    return () => {
        cleanup();
    };
  }, [projectFiles]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">App Preview</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="flex-1 p-2 bg-gray-200">
           <iframe
                srcDoc={iframeContent}
                title="App Preview"
                className="w-full h-full border-0 bg-white rounded-md"
                sandbox="allow-scripts allow-same-origin"
           />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;`,
};
