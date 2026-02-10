import React, { useState } from 'react';
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
  onSwitchToDashboard: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ user, onLogout, projectFiles, onUpdateFiles, onSwitchToDashboard }) => {
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
             <button
                onClick={onSwitchToDashboard}
                className="text-gray-600 hover:text-green-600 font-medium px-3 py-1 border border-gray-300 rounded-md hover:border-green-600 transition-colors"
            >
                User Dashboard
            </button>
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

export default AdminPage;