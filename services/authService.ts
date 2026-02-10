
import { User } from '../types';

const USERS_KEY = 'krishi_mitra_users';
const CURRENT_USER_KEY = 'krishi_mitra_currentUser';

// Hashing is not secure on the frontend, but for simulation we'll do a simple base64 "hash".
// In a real app, this would be handled by a secure backend.
const hashPassword = (pass: string) => btoa(pass);

const initializeUsers = () => {
  let users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  // This ensures the database is recreated with specific users if it's empty
  // or if we want to enforce a reset on load. For this request, we'll reset it.
  users = [
    {
      fullName: 'Admin User',
      username: 'admin',
      phone: '0000000000',
      password: hashPassword('Vijay@147896'), // Default admin password
    },
    {
      fullName: 'NxtBoi User',
      username: 'nxtboi',
      phone: '9999999999',
      password: hashPassword('147896'), // User-requested password
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  return users;
};


let allUsers: User[] = initializeUsers();

const saveUsers = () => {
  localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
};

export const login = async (username: string, password_raw: string): Promise<{ user: User }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      const user = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() || u.phone === username);
      if (user && user.password === hashPassword(password_raw)) {
        const userToReturn = { ...user };
        delete userToReturn.password;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user.username));
        resolve({ user: userToReturn });
      } else {
        reject(new Error('Invalid username or password.'));
      }
    }, 500);
  });
};

export const signup = async (fullName: string, username: string, phone: string, password_raw: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (allUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                return reject(new Error('Username already exists. Please choose another.'));
            }

            const newUser: User = {
                fullName,
                username,
                phone,
                password: hashPassword(password_raw),
            };

            allUsers.push(newUser);
            saveUsers();

            const userToReturn = { ...newUser };
            delete userToReturn.password;
            resolve(userToReturn);
        }, 500);
    });
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    const currentUsername = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUsername) {
      return resolve(null);
    }
    const user = allUsers.find(u => u.username === JSON.parse(currentUsername));
    if (user) {
      const userToReturn = { ...user };
      delete userToReturn.password;
      resolve(userToReturn);
    } else {
      resolve(null);
    }
  });
};

export const updateUser = async (updates: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
        const currentUsername = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
        if (!currentUsername) return reject(new Error("Not logged in"));

        const userIndex = allUsers.findIndex(u => u.username === currentUsername);
        if (userIndex === -1) return reject(new Error("User not found"));

        if (updates.username && updates.username !== currentUsername && allUsers.some(u => u.username === updates.username)) {
            return reject(new Error("This username is already taken. Please choose another."));
        }
        
        if (updates.password) {
            allUsers[userIndex].password = hashPassword(updates.password);
            delete updates.password; // Don't store the update object with plain password
        }

        allUsers[userIndex] = { ...allUsers[userIndex], ...updates };
        saveUsers();
        
        if (updates.username) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updates.username));
        }

        const userToReturn = { ...allUsers[userIndex] };
        delete userToReturn.password;
        resolve(userToReturn);
    });
};

export const resetPassword = async (username: string, newPassword_raw: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        const userIndex = allUsers.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
        if (userIndex === -1) {
            return reject(new Error("User not found. Please check the username."));
        }
        allUsers[userIndex].password = hashPassword(newPassword_raw);
        saveUsers();
        resolve({ success: true });
    });
};

// Admin functions
export const getAllUsers = async (): Promise<User[]> => {
    return Promise.resolve(allUsers.map(u => {
        const userToReturn = { ...u };
        delete userToReturn.password;
        return userToReturn;
    }));
};

export const deleteUser = async (username: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        if (username.toLowerCase() === 'admin') {
            return reject(new Error("Cannot delete the admin user."));
        }
        const initialLength = allUsers.length;
        allUsers = allUsers.filter(u => u.username !== username);
        if (allUsers.length === initialLength) {
             return reject(new Error("User not found."));
        }
        saveUsers();
        resolve({ success: true });
    });
};
