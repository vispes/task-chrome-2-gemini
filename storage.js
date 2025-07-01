const StorageManager = {
    STORAGE_KEYS: {
        TASKS: 'marketingProductivityExtension_tasks',
        NOTES: 'marketingProductivityExtension_notes',
        SETTINGS: 'marketingProductivityExtension_settings',
    },

    async init() {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
            const errorMsg = 'Chrome Storage API not available. Data persistence will not work.';
            console.error(errorMsg);
            throw new Error(errorMsg); // Propagate error when API is unavailable
        }
        // If chrome.storage.local is available, the async function implicitly resolves.
    },

    async getItem(key, defaultValue = null) {
        try {
            const result = await chrome.storage.local.get(key);
            return result[key] !== undefined ? result[key] : defaultValue;
        } catch (error) {
            console.error(`Error getting item "${key}":`, error);
            throw error; // Propagate error
        }
    },

    async setItem(key, value) {
        try {
            await chrome.storage.local.set({ [key]: value });
        } catch (error) {
            console.error(`Error setting item "${key}":`, error);
            throw error; // Propagate error
        }
    },

    async removeItem(key) {
        try {
            await chrome.storage.local.remove(key);
        } catch (error) {
            console.error(`Error removing item "${key}":`, error);
            throw error; // Propagate error
        }
    },

    async clearAll() {
        try {
            await chrome.storage.local.clear();
        } catch (error) {
            console.error('Error clearing all storage:', error);
            throw error; // Propagate error
        }
    },

    async getAllTasks() {
        return this.getItem(this.STORAGE_KEYS.TASKS, []);
    },

    async saveAllTasks(tasks) {
        return this.setItem(this.STORAGE_KEYS.TASKS, tasks);
    },

    async getAllNotes() {
        return this.getItem(this.STORAGE_KEYS.NOTES, []);
    },

    async saveAllNotes(notes) {
        return this.setItem(this.STORAGE_KEYS.NOTES, notes);
    },

    async getSettings() {
        return this.getItem(this.STORAGE_KEYS.SETTINGS, {});
    },

    async saveSettings(settings) {
        return this.setItem(this.STORAGE_KEYS.SETTINGS, settings);
    },
};

export const STORAGE_KEYS = StorageManager.STORAGE_KEYS; // Re-export STORAGE_KEYS if they need to be accessed directly from imports
export const init = StorageManager.init;
export const getItem = StorageManager.getItem;
export const setItem = StorageManager.setItem;
export const removeItem = StorageManager.removeItem;
export const clearAll = StorageManager.clearAll;
export const getAllTasks = StorageManager.getAllTasks;
export const saveAllTasks = StorageManager.saveAllTasks;
export const getAllNotes = StorageManager.getAllNotes;
export const saveAllNotes = StorageManager.saveAllNotes;
export const getSettings = StorageManager.getSettings;
export const saveSettings = StorageManager.saveSettings;