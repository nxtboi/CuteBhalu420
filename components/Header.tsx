import React from 'react';
import { Page } from '../App';
import { LanguageCode, User } from '../types';
import { UserIcon, LogoutIcon, BackIcon, ShieldIcon } from './icons/Icons';
import translations from '../services/translations';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  user?: User | null;
  onSwitchToAdmin?: () => void;
}


const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onLogout, language, setLanguage, user, onSwitchToAdmin }) => {
  const t = (translations.header as any)[language];

  const navigateToDashboard = () => {
    onNavigate('dashboard');
  };

  return (
    <header className="bg-green-700 text-white p-4 shadow-md flex items-center justify-between z-10 sticky top-0">
      <div className="flex items-center">
        {currentPage !== 'dashboard' && (
          <button onClick={navigateToDashboard} className="mr-3 p-2 rounded-full hover:bg-green-600 transition-colors" aria-label="Back to Dashboard" title="Back to Dashboard">
            <BackIcon className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl md:text-2xl font-bold truncate max-w-[200px] md:max-w-none">
          {t[currentPage]}
        </h1>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
         <LanguageSelector language={language} setLanguage={setLanguage} className="text-white hover:bg-green-600 rounded-md" />
         
         {user?.username === 'admin' && onSwitchToAdmin && (
            <button 
                onClick={onSwitchToAdmin} 
                className="p-2 rounded-full hover:bg-green-600 transition-colors text-yellow-300" 
                aria-label="Admin Panel"
                title="Go to Admin Panel"
            >
                <ShieldIcon className="w-6 h-6" />
            </button>
         )}

        <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-green-600 transition-colors" aria-label="Profile">
          <UserIcon className="w-6 h-6" />
        </button>
        <button onClick={onLogout} className="p-2 rounded-full hover:bg-green-600 transition-colors" aria-label="Logout">
          <LogoutIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;