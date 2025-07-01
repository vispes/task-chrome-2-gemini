const BackgroundService = {
    /**
     * Handles the extension installation or update events.
     * Sets default settings and initial data on first install.
     * @param {object} details - Details about the reason for the event.
     */
    handleInstalled: async function(details) {
        if (details.reason === 'install') {
            console.log('Extension installed. Performing initial setup...');
            try {
                // Set default settings and initial empty data structures for tasks, notes, and settings
                await chrome.storage.local.set({
                    tasks: [],
                    notes: [],
                    settings: {
                        theme: 'light',
                        defaultView: 'tasks',
                        notificationsEnabled: true
                    },
                    youtubeVideos: [] // Placeholder for saved YouTube video info/references
                });
                console.log('Default settings and initial data set successfully.');
            } catch (e) {
                console.error('Failed to set initial data on install:', e);
            }
        } else if (details.reason === 'update') {
            // Handle migrations or update-specific logic if needed
            console.log('Extension updated.');
            // Example: Migrate old data formats if necessary
        } else if (details.reason === 'chrome_update') {
            // Handle Chrome update specific logic
            console.log('Chrome updated.');
        }
    },

    /**
     * Handles browser startup event.
     * Can be used for background tasks like checking overdue tasks or syncing.
     */
    handleStartup: async function() {
        // Perform any background tasks that need to run on browser launch
        // e.g., check for overdue tasks, sync with external services (if applicable)
        console.log('Background script started up.');
        // Future: Could implement a check for overdue tasks here and send a notification
    },

    /**
     * Handles messages from other parts of the extension (e.g., popup, content script).
     * @param {object} message - The message object.
     * @param {object} sender - Details about the sender of the message.
     * @param {function} sendResponse - Function to send a response back to the sender.
     * @returns {boolean} - True if sendResponse will be called asynchronously.
     */
    handleMessage: async function(message, sender, sendResponse) {
        if (!message || !message.type) {
            sendResponse({ status: 'error', message: 'Message type is missing' });
            return false;
        }

        let response = { status: 'error', message: 'Unhandled request' };

        switch (message.type) {
            case 'GET_STORED_DATA':
                try {
                    // Allows fetching any stored key(s)
                    const result = await chrome.storage.local.get(message.key);
                    response = { status: 'success', data: result };
                } catch (e) {
                    response = { status: 'error', message: `Failed to get data for ${message.key}: ${e.message}` };
                }
                break;
            case 'SET_TASKS':
                try {
                    // Validates that tasks data is an array before setting
                    if (!Array.isArray(message.data)) {
                        throw new Error('Invalid data format for SET_TASKS. Expected an array.');
                    }
                    await chrome.storage.local.set({ tasks: message.data });
                    response = { status: 'success', message: 'Tasks saved successfully' };
                } catch (e) {
                    response = { status: 'error', message: `Failed to set tasks: ${e.message}` };
                }
                break;
            case 'SET_NOTES':
                try {
                    // Validates that notes data is an array before setting
                    if (!Array.isArray(message.data)) {
                        throw new Error('Invalid data format for SET_NOTES. Expected an array.');
                    }
                    await chrome.storage.local.set({ notes: message.data });
                    response = { status: 'success', message: 'Notes saved successfully' };
                } catch (e) {
                    response = { status: 'error', message: `Failed to set notes: ${e.message}` };
                }
                break;
            case 'SET_SETTINGS':
                try {
                    // Validates that settings data is an object before setting
                    if (typeof message.data !== 'object' || message.data === null) {
                        throw new Error('Invalid data format for SET_SETTINGS. Expected an object.');
                    }
                    await chrome.storage.local.set({ settings: message.data });
                    response = { status: 'success', message: 'Settings saved successfully' };
                } catch (e) {
                    response = { status: 'error', message: `Failed to set settings: ${e.message}` };
                }
                break;
            case 'CLEAR_ALL_DATA':
                try {
                    // Clears all data from local storage - usually for reset/debug purposes
                    await chrome.storage.local.clear();
                    response = { status: 'success', message: 'All local data cleared' };
                } catch (e) {
                    response = { status: 'error', message: `Failed to clear all data: ${e.message}` };
                }
                break;
            case 'FETCH_YOUTUBE_INFO':
                // Implement actual YouTube Data API integration here.
                // This would typically involve:
                // 1. Fetching a YouTube Data API key (securely, not hardcoded in client-side JS).
                // 2. Making a 'fetch' request to the YouTube Data API (e.g., videos.list endpoint)
                //    to retrieve video metadata (title, duration, thumbnail).
                // 3. Parsing the API response and handling potential errors or rate limits.
                try {
                    const videoId = message.videoId;
                    if (!videoId) {
                        throw new Error('YouTube videoId is missing.');
                    }
                    // --- Start: Simulated API Call (replace with actual fetch to YouTube Data API) ---
                    const videoInfo = {
                        title: `Simulated Video Title for ${videoId}`,
                        duration: '5:30', // Example duration
                        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                        embedUrl: `https://www.youtube.com/embed/${videoId}`
                    };
                    // --- End: Simulated API Call ---
                    response = { status: 'success', data: videoInfo };
                } catch (e) {
                    response = { status: 'error', message: `Failed to fetch YouTube info: ${e.message}` };
                }
                break;
            case 'GET_ACTIVE_TAB_URL':
                // This functionality requires the 'activeTab' permission in the manifest.
                // 'activeTab' is a special permission that grants temporary host permissions
                // to the currently active tab when the user invokes the extension (e.g., clicks its icon).
                // This is generally safe and preferred over '<all_urls>' if tab URL/title is only
                // needed in response to direct user interaction with the extension.
                try {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tab) {
                        response = { status: 'success', url: tab.url, title: tab.title };
                    } else {
                        response = { status: 'error', message: 'No active tab found' };
                    }
                } catch (e) {
                    response = { status: 'error', message: `Failed to get active tab URL: ${e.message}` };
                }
                break;
            default:
                response = { status: 'error', message: `Unknown message type: ${message.type}` };
                break;
        }

        sendResponse(response);
        return true; // Indicate that sendResponse will be called asynchronously
    },

    /**
     * Sends a message to the extension's popup.
     * @param {string} type - The type of the message.
     * @param {object} data - The data to send with the message.
     */
    sendMessageToPopup: async function(type, data) {
        try {
            await chrome.runtime.sendMessage({ type: type, data: data });
            // Check for specific error if the message port closed or couldn't be delivered
            if (chrome.runtime.lastError) {
                console.warn(`Error sending message to popup (${type}): ${chrome.runtime.lastError.message}`);
            }
        } catch (error) {
            // This catch block handles synchronous errors during the call itself or unexpected errors
            console.error(`Unexpected error in sendMessageToPopup (${type}):`, error);
        }
    },

    /**
     * Initializes the background script by registering all necessary event listeners.
     */
    init: function() {
        // Register event listeners for extension lifecycle and messaging
        chrome.runtime.onInstalled.addListener(this.handleInstalled);
        chrome.runtime.onStartup.addListener(this.handleStartup);
        chrome.runtime.onMessage.addListener(this.handleMessage);
        console.log('Background script initialized. Event listeners registered.');
    }
};

// Call the initialization function when the background script loads
BackgroundService.init();