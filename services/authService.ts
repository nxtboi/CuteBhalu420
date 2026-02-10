import { User } from '../types';

const USERS_DB_KEY = 'krishi_mitra_users_db';
const CURRENT_USER_SESSION_KEY = 'krishi_mitra_current_user';

// Temporary store for OTPs (Simulated DB table for OTPs)
// Key: Username, Value: OTP
const otpStore: Record<string, string> = {};

// --- In-Browser Database Simulation using localStorage ---
// This acts as our "database". All user accounts are stored as a single
// JSON string in the browser's localStorage. This is suitable for a prototype
// but would be replaced by a real database in a production application.
const database = {
  read: (): User[] => {
    try {
      const dbJson = localStorage.getItem(USERS_DB_KEY);
      // If the database exists, parse it.
      if (dbJson) {
        return JSON.parse(dbJson);
      } 
      // Otherwise, seed it with default users for the first run.
      else {
        const defaultUsers: User[] = [
           {
            fullName: 'Admin User',
            username: 'admin',
            password: 'Vijay@147896',
            phone: '0000000000'
          },
          {
            fullName: 'Test Farmer',
            username: 'farmer',
            password: 'password123',
            phone: '9876543210'
          },
          {
            fullName: 'Nxtboi User',
            username: 'nxtboi',
            password: '147896',
            phone: '1234567890'
          }
        ];
        // Write the default users back to localStorage and return them.
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
    } catch (error) {
      console.error("Error reading from localStorage database:", error);
      // In case of corrupted data, return an empty array to prevent crashing.
      return [];
    }
  },
  write: (users: User[]): void => {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Error writing to localStorage database:", error);
    }
  }
};


// --- Authentication Logic ---

/**
 * Signs up a new user, adds them to the database, and starts a session.
 */
export const signup = async (fullName: string, username: string, phone: string, password_raw: string): Promise<{ success: boolean; message?: string; user?: User }> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network delay
      const allUsers = database.read();
      const existingUser = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

      if (existingUser) {
        resolve({ success: false, message: 'Username already exists. Please choose another.' });
        return;
      }

      // Create the new user record, including the password for storage.
      const newUser: User = { 
        fullName, 
        username, 
        phone,
        password: password_raw // IMPORTANT: In a real app, this MUST be hashed!
      };
      
      // Add the new user to the existing list and write it back to the database.
      const updatedUsers = [...allUsers, newUser];
      database.write(updatedUsers);
      
      // For the session, we create a version of the user object without the password.
      const { password, ...userForSession } = newUser;
      saveCurrentUser(userForSession, false); // Default to sessionStorage on signup

      resolve({ success: true, user: userForSession });
    }, 500);
  });
};

/**
 * Logs in an existing user by verifying their credentials against the database.
 */
export const login = async (username: string, password_raw: string, rememberMe: boolean): Promise<{ success: boolean; message?: string; user?: User }> => {
    return new Promise(resolve => {
        setTimeout(() => { // Simulate network delay
            const allUsers = database.read();
            const userRecord = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

            // Check if the user exists and if the password matches.
            if (!userRecord || userRecord.password !== password_raw) {
                resolve({ success: false, message: 'Invalid username or password.' });
                return;
            }
            
            // For the session, we create a version of the user object without the password.
            const { password, ...userForSession } = userRecord;
            saveCurrentUser(userForSession, rememberMe);

            resolve({ success: true, user: userForSession });
        }, 500);
    });
};

/**
 * Updates a user's profile information.
 */
export const updateUser = async (
  currentUsername: string,
  updates: Partial<User>
): Promise<{ success: boolean; message?: string; user?: User }> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network delay
      const allUsers = database.read();
      
      // Check if the new username is already taken by another user (if username is being updated)
      if (updates.username) {
          const conflictingUser = allUsers.find(
            u => u.username.toLowerCase() === updates.username!.toLowerCase() && u.username.toLowerCase() !== currentUsername.toLowerCase()
          );

          if (conflictingUser) {
            resolve({ success: false, message: 'This username is already taken. Please choose another.' });
            return;
          }
      }

      const userIndex = allUsers.findIndex(u => u.username.toLowerCase() === currentUsername.toLowerCase());

      if (userIndex === -1) {
        resolve({ success: false, message: 'Could not find the user to update.' });
        return;
      }

      const userToUpdate = allUsers[userIndex];
      
      // Handle password update separately
      if (updates.password && updates.password.length > 0) {
        userToUpdate.password = updates.password;
      }
      
      // Remove password from updates object to avoid overwriting with undefined or empty string if passed incorrectly
      // and merge other fields
      const { password, ...otherUpdates } = updates;
      
      Object.assign(userToUpdate, otherUpdates);

      allUsers[userIndex] = userToUpdate;
      database.write(allUsers);
      
      const { password: _, ...userForSession } = userToUpdate;
      // Preserve the "remember me" state by checking which storage is currently used
      const wasRemembered = !!localStorage.getItem(CURRENT_USER_SESSION_KEY);
      saveCurrentUser(userForSession, wasRemembered);

      resolve({ success: true, user: userForSession });
    }, 500);
  });
};


/**
 * Checks if a user exists in the database.
 */
export const checkUserExists = async (username: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const allUsers = database.read();
            const userExists = allUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
            resolve(userExists);
        }, 300);
    });
};


/**
 * Requests an OTP for password reset.
 * Generates a random 4-digit code and stores it in memory.
 */
export const requestPasswordResetOtp = async (username: string): Promise<{ success: boolean; message?: string; otp?: string; maskedPhone?: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const allUsers = database.read();
            const userRecord = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

            if (!userRecord || !userRecord.phone) {
                resolve({ success: false, message: "User not found or no phone number is registered." });
                return;
            }

            // Generate a 4-digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            
            // Store it in our temporary store
            otpStore[username.toLowerCase()] = otp;

            // Mask the phone number for display
            const maskedPhone = `******${userRecord.phone.slice(-4)}`;

            // In a real app, we would send this via SMS/Email. 
            // Here we return it so the UI can display it for testing.
            resolve({ success: true, otp, maskedPhone }); 
        }, 500);
    });
};

/**
 * Verifies the OTP entered by the user.
 */
export const verifyPasswordResetOtp = async (username: string, otp: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const storedOtp = otpStore[username.toLowerCase()];
            if (storedOtp && storedOtp === otp) {
                // Clear the OTP after successful verification to prevent reuse
                delete otpStore[username.toLowerCase()];
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};

/**
 * Resets the password for a given user.
 */
export const resetPassword = async (username: string, newPassword_raw: string): Promise<{ success: boolean; message?: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const allUsers = database.read();
            const userIndex = allUsers.findIndex(u => u.username.toLowerCase() === username.toLowerCase());

            if (userIndex === -1) {
                resolve({ success: false, message: "User not found." });
                return;
            }

            allUsers[userIndex].password = newPassword_raw;
            database.write(allUsers);
            resolve({ success: true });
        }, 500);
    });
};


// --- Admin Functions ---

/**
 * Retrieves all users from the database, excluding their passwords.
 */
export const getAllUsers = (): Omit<User, 'password'>[] => {
  const allUsers = database.read();
  return allUsers.map(({ password, ...user }) => user);
};

/**
 * Deletes a user from the database by their username.
 */
export const deleteUser = (username: string): { success: boolean; message?: string } => {
  if (username.toLowerCase() === 'admin') {
    return { success: false, message: "Cannot delete the admin user." };
  }
  const allUsers = database.read();
  const updatedUsers = allUsers.filter(u => u.username.toLowerCase() !== username.toLowerCase());

  if (allUsers.length === updatedUsers.length) {
    return { success: false, message: "User not found." };
  }

  database.write(updatedUsers);
  return { success: true };
};


// --- Session Management (using sessionStorage and localStorage) ---

/**
 * Saves the currently logged-in user's data to the appropriate storage.
 * @param user The user data to save (without password).
 * @param rememberMe If true, saves to localStorage; otherwise, saves to sessionStorage.
 */
const saveCurrentUser = (user: User, rememberMe: boolean) => {
    try {
        const storage = rememberMe ? localStorage : sessionStorage;
        // We only store non-sensitive user data in the session.
        storage.setItem(CURRENT_USER_SESSION_KEY, JSON.stringify(user));
    } catch(error) {
        console.error("Could not save current user to storage", error);
    }
}

/**
 * Retrieves the currently logged-in user's data from localStorage or sessionStorage.
 * It checks localStorage first for persistent sessions.
 */
export const getCurrentUser = (): User | null => {
    try {
        // Check localStorage first for "remembered" users.
        let userJson = localStorage.getItem(CURRENT_USER_SESSION_KEY);
        // If not found, check sessionStorage for the current session.
        if (!userJson) {
            userJson = sessionStorage.getItem(CURRENT_USER_SESSION_KEY);
        }
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error("Could not parse current user from storage", error);
        return null;
    }
}

/**
 * Clears the current user's session data from both storages, effectively logging them out.
 */
export const clearCurrentUser = () => {
    sessionStorage.removeItem(CURRENT_USER_SESSION_KEY);
    localStorage.removeItem(CURRENT_USER_SESSION_KEY);
}