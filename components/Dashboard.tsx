import React, { useMemo, useState, useEffect } from 'react';
import { Page } from '../App';
import { RobotIcon, UserIcon, ShoppingCartIcon, ArrowRightIcon, LightbulbIcon, WaterDropIcon, HistoryIcon, TrashIcon } from './icons/Icons';
import { User, LanguageCode, ChatSession } from '../types';
import translations, { languages } from '../services/translations';
import { getChatHistory, deleteChatSession, deleteAllChatSessions } from '../services/chatHistoryService';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onViewChat: (sessionId: string) => void;
  language: LanguageCode;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onViewChat, language }) => {
    const t = (translations.dashboard as any)[language];
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [greetingIndex, setGreetingIndex] = useState(0);
    
    useEffect(() => {
        const history = getChatHistory(user.username);
        setChatHistory(history);
    }, [user.username]);

     useEffect(() => {
        const intervalId = setInterval(() => {
            setGreetingIndex(prevIndex => (prevIndex + 1) % languages.length);
        }, 3000); // Change greeting every 3 seconds

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const handleDeleteChat = (sessionId: string) => {
        // Optimistically update UI
        setChatHistory(prev => prev.filter(session => session.id !== sessionId));
        // Update storage
        deleteChatSession(user.username, sessionId);
    };

    const handleClearAllChats = () => {
        if (window.confirm(t.clearAllConfirm)) {
            // Optimistically update UI
            setChatHistory([]);
            // Update storage
            deleteAllChatSessions(user.username);
        }
    };

    const randomTip = useMemo(() => {
      const tipsArray = t.tipContent as string[];
      if (!tipsArray || tipsArray.length === 0) {
        return "";
      }
      const randomIndex = Math.floor(Math.random() * tipsArray.length);
      return tipsArray[randomIndex];
    }, [t]);
    
    const currentGreetingLanguage = languages[greetingIndex];
    const greetingText = t.greetings[currentGreetingLanguage.code];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-lime-50 to-amber-50 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-stone-800">{t.welcome} {user.fullName}!</h1>
        <p className="mt-2 text-sm md:text-lg text-gray-600">{t.description}</p>

        {/* Dynamic Greetings Section */}
        <div className="mt-6 text-center h-16 flex flex-col justify-center">
            <div key={greetingIndex} className="animate-fade-in">
                <p className="text-2xl md:text-3xl font-semibold text-stone-700">{greetingText}</p>
                <p className="text-xs md:text-sm text-stone-500">{currentGreetingLanguage.name}</p>
            </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
          <DashboardCard
            icon={<RobotIcon className="w-8 h-8 md:w-10 md:h-10 text-green-600"/>}
            title={t.startChat}
            description={t.startChatDesc}
            onClick={() => onNavigate('chat')}
          />
           <DashboardCard
            icon={<WaterDropIcon className="w-8 h-8 md:w-10 md:h-10 text-sky-600"/>}
            title={t.irrigationPlanner}
            description={t.irrigationPlannerDesc}
            onClick={() => onNavigate('irrigation')}
          />
          <DashboardCard
            icon={<ShoppingCartIcon className="w-8 h-8 md:w-10 md:h-10 text-amber-600"/>}
            title={t.shop}
            description={t.shopDesc}
            onClick={() => onNavigate('shop')}
          />
           <DashboardCard
            icon={<UserIcon className="w-8 h-8 md:w-10 md:h-10 text-stone-600"/>}
            title={t.viewProfile}
            description={t.viewProfileDesc}
            onClick={() => onNavigate('profile')}
          />
        </div>

        <div className="mt-8 md:mt-12">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t.recentChatsTitle}</h2>
                {chatHistory.length > 0 && (
                    <button onClick={handleClearAllChats} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50">
                        <TrashIcon className="w-4 h-4" />
                        {t.clearAllButton}
                    </button>
                )}
            </div>
            {chatHistory.length > 0 ? (
                <div className="space-y-3">
                    {chatHistory.slice(0, 5).map(session => (
                        <div key={session.id} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between border border-gray-100">
                            <button onClick={() => onViewChat(session.id)} className="flex-grow text-left overflow-hidden">
                                <p className="font-semibold text-gray-700 truncate">{session.title}</p>
                                <p className="text-xs text-gray-500">{new Date(session.timestamp).toLocaleString()}</p>
                            </button>
                            <button onClick={() => handleDeleteChat(session.id)} className="ml-4 p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors" aria-label={t.deleteChatButton}>
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-8 px-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <HistoryIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-300" />
                    <p className="mt-4 text-sm md:text-base text-gray-500">{t.noChatsMessage}</p>
                </div>
            )}
        </div>

        <div className="mt-8 md:mt-12 mb-8 bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-400 p-2 rounded-full">
                    <LightbulbIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h2 className="ml-3 md:ml-4 text-lg md:text-xl font-semibold text-gray-800">{t.tipTitle}</h2>
            </div>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 italic">
                "{randomTip}"
            </p>
        </div>

      </div>
    </div>
  );
};

interface DashboardCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, onClick}) => {
    return (
        <button 
            onClick={onClick} 
            className="group bg-white p-4 md:p-6 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left border border-gray-200 hover:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-opacity-75 active:bg-gray-50"
        >
            <div className="flex justify-between items-start">
                <div className="p-2 md:p-3 bg-gray-100 rounded-full">
                    {icon}
                </div>
                <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-lime-600 transition-colors" />
            </div>
            <h3 className="mt-3 md:mt-4 text-base md:text-lg font-bold text-gray-800">{title}</h3>
            <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500">{description}</p>
        </button>
    )
}

export default Dashboard;