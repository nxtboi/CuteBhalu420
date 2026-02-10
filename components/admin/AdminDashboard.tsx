import React, { useState, useEffect } from 'react';
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
            <div className={`p-4 rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};


export default AdminDashboard;
