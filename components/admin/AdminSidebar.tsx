import React from 'react';
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
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

export default AdminSidebar;
