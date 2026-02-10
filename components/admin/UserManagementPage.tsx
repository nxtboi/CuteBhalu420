
import React, { useState, useEffect } from 'react';
import * as authService from '../../services/authService';
import { User } from '../../types';
import { TrashIcon } from '../icons/Icons';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
        const allUsers = await authService.getAllUsers();
        setUsers(allUsers);
    } catch(error) {
        console.error("Failed to load users:", error);
        setFeedback({ type: 'error', message: 'Failed to load users.' });
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (window.confirm(`Are you sure you want to delete the user "${username}"? This cannot be undone.`)) {
      try {
        await authService.deleteUser(username);
        setFeedback({ type: 'success', message: `User "${username}" has been deleted.` });
        loadUsers(); // Refresh the list
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to delete user.' });
      } finally {
        setTimeout(() => setFeedback(null), 3000); // Clear feedback after 3 seconds
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Management</h2>
      
      {feedback && (
        <div className={`p-4 mb-4 rounded-md text-sm ${
            feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
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
                        title={`Delete ${user.username}`}
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

export default UserManagementPage;
