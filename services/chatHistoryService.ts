import { ChatSession } from '../types';

const CHAT_HISTORY_DB_KEY = 'krishi_mitra_chat_history_db';

type ChatHistoryDB = Record<string, ChatSession[]>;

const database = {
  read: (): ChatHistoryDB => {
    try {
      const dbJson = localStorage.getItem(CHAT_HISTORY_DB_KEY);
      return dbJson ? JSON.parse(dbJson) : {};
    } catch (error) {
      console.error("Error reading chat history from localStorage:", error);
      return {};
    }
  },
  write: (db: ChatHistoryDB): void => {
    try {
      localStorage.setItem(CHAT_HISTORY_DB_KEY, JSON.stringify(db));
    } catch (error) {
      console.error("Error writing chat history to localStorage:", error);
    }
  }
};

/**
 * Retrieves all chat sessions for a specific user, sorted by the most recent.
 */
export const getChatHistory = (username: string): ChatSession[] => {
  const db = database.read();
  const userHistory = db[username.toLowerCase()] || [];
  return userHistory.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Retrieves a single chat session by its ID for a given user.
 */
export const getChatSession = (username: string, sessionId: string): ChatSession | null => {
  const history = getChatHistory(username);
  return history.find(session => session.id === sessionId) || null;
};

/**
 * Saves or updates a chat session for a specific user.
 */
export const saveChatSession = (username: string, session: ChatSession): void => {
  const db = database.read();
  const userHistory = db[username.toLowerCase()] || [];
  
  const existingIndex = userHistory.findIndex(s => s.id === session.id);
  
  if (existingIndex > -1) {
    // Update existing session
    userHistory[existingIndex] = session;
  } else {
    // Add new session
    userHistory.push(session);
  }
  
  db[username.toLowerCase()] = userHistory;
  database.write(db);
};

/**
 * Deletes a single chat session for a specific user.
 */
export const deleteChatSession = (username: string, sessionId: string): void => {
  const db = database.read();
  let userHistory = db[username.toLowerCase()] || [];
  
  userHistory = userHistory.filter(session => session.id !== sessionId);
  
  db[username.toLowerCase()] = userHistory;
  database.write(db);
};

/**
 * Deletes all chat sessions for a specific user.
 */
export const deleteAllChatSessions = (username: string): void => {
  const db = database.read();
  db[username.toLowerCase()] = [];
  database.write(db);
};

/**
 * Retrieves the entire chat history database for all users. Used for admin stats.
 */
export const getAllChatData = (): ChatHistoryDB => {
    return database.read();
};