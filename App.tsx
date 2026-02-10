import React, { useState } from 'react';
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
              onSwitchToDashboard={() => setIsAdmin(false)}
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
        user={currentUser}
        onSwitchToAdmin={() => setIsAdmin(true)}
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

export default App;