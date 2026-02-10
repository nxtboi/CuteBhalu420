
import { ChatSession } from '../types';

const getChatHistoryKey = (username: string) => `krishi_mitra_chat_history_${username}`;

export const getChatHistory = async (username: string): Promise<ChatSession[]> => {
    return new Promise((resolve) => {
        const historyJson = localStorage.getItem(getChatHistoryKey(username));
        const history: ChatSession[] = historyJson ? JSON.parse(historyJson) : [];
        resolve(history.sort((a, b) => b.timestamp - a.timestamp));
    });
};

export const saveChatSession = async (username: string, session: ChatSession): Promise<{ success: boolean }> => {
    return new Promise(async (resolve) => {
        const history = await getChatHistory(username);
        const sessionIndex = history.findIndex(s => s.id === session.id);
        if (sessionIndex > -1) {
            history[sessionIndex] = session;
        } else {
            history.push(session);
        }
        localStorage.setItem(getChatHistoryKey(username), JSON.stringify(history));
        resolve({ success: true });
    });
};

export const deleteChatSession = async (username: string, sessionId: string): Promise<{ success: boolean }> => {
    return new Promise(async (resolve) => {
        const history = await getChatHistory(username);
        const filteredHistory = history.filter(s => s.id !== sessionId);
        localStorage.setItem(getChatHistoryKey(username), JSON.stringify(filteredHistory));
        resolve({ success: true });
    });
};

export const deleteAllChatSessions = async (username: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
        localStorage.removeItem(getChatHistoryKey(username));
        resolve({ success: true });
    });
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
    return new Promise((resolve) => {
        let allSessions: ChatSession[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('krishi_mitra_chat_history_')) {
                const sessionsJson = localStorage.getItem(key);
                if (sessionsJson) {
                    allSessions = allSessions.concat(JSON.parse(sessionsJson));
                }
            }
        }
        resolve(allSessions);
    });
}
