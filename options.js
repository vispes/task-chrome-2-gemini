import * as StorageManager from './storage.js';

let themeSelect;
let saveButton;
let saveMessage;
let themePreview;
let bodyElement;

const defaultSettings = {
    theme: 'light' // Default theme
};

/**
 * Initializes the options page by loading settings and binding event listeners.
 * This is the primary entry point for the script.
 */
async function init() {
    // Cache DOM elements once when the DOM is loaded
    themeSelect = document.getElementById('themeSelect');
    saveButton = document.getElementById('saveButton');
    saveMessage = document.getElementById('saveMessage');
    themePreview = document.getElementById('themePreview');
    bodyElement = document.body;

    await loadSettingsAndRender();
    bindEventListeners();
}

/**
 * Loads the extension settings from Chrome's synchronized storage.
 * If no settings are found, it uses the `defaultSettings`.
 * After loading, it populates the UI elements with the retrieved settings.
 */
async function loadSettingsAndRender() {
    try {
        // Use StorageManager.getSettings which returns a Promise
        const items = await StorageManager.getSettings(defaultSettings);

        if (themeSelect) {
            themeSelect.value = items.theme;
            updateThemePreview(items.theme);
        } else {
            console.warn('Theme select element not found. UI might not be correctly initialized.');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        // Optionally provide user feedback for loading error
    }
}

/**
 * Saves the current settings from the UI to Chrome's synchronized storage.
 * Provides visual feedback to the user upon successful saving or an error.
 */
async function saveSettings() {
    if (!themeSelect) {
        console.error('Theme select element not found. Cannot save settings.');
        return;
    }

    const settings = {
        theme: themeSelect.value
    };

    try {
        // Use StorageManager.saveSettings which returns a Promise
        await StorageManager.saveSettings(settings);

        if (saveMessage) {
            saveMessage.textContent = 'Settings saved!';
            saveMessage.style.color = 'green';
            setTimeout(() => {
                saveMessage.textContent = ''; // Clear message after a short delay
            }, 2000);
        }
        // Ensure the UI immediately reflects the saved theme
        updateThemePreview(settings.theme);

        // Send a message to background script or active tabs to apply theme changes immediately.
        chrome.runtime.sendMessage({ action: "settingsUpdated", settings: settings });

    } catch (error) {
        console.error('Error saving settings:', error);
        if (saveMessage) {
            saveMessage.textContent = 'Error saving settings!';
            saveMessage.style.color = 'red';
        }
    }
}

/**
 * Binds event listeners to UI elements, such as the save button and theme selector.
 */
function bindEventListeners() {
    // Event listener for the Save button
    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    } else {
        console.warn('Save button element not found. Save functionality might not work.');
    }

    // Event listener for theme selection change
    if (themeSelect) {
        themeSelect.addEventListener('change', (event) => {
            updateThemePreview(event.target.value);
        });
    } else {
        console.warn('Theme select element not found. Theme preview might not update.');
    }
}

/**
 * Updates a visual preview element to reflect the currently selected theme.
 * This function is typically called when the theme selection changes.
 *
 * @param {string} theme - The name of the theme to apply (e.g., 'light', 'dark').
 */
function updateThemePreview(theme) {
    // Helper function to dynamically remove all classes prefixed with 'theme-'
    const removeThemeClasses = (element) => {
        if (!element) return;
        // Convert DOMTokenList to an array, filter for theme classes, and remove them
        const classesToRemove = Array.from(element.classList).filter(cls => cls.startsWith('theme-'));
        element.classList.remove(...classesToRemove);
    };

    if (themePreview) {
        removeThemeClasses(themePreview);
        themePreview.classList.add(`theme-${theme}`);
    }

    // Apply theme class to body as well for consistent styling
    if (bodyElement) {
        removeThemeClasses(bodyElement);
        bodyElement.classList.add(`theme-${theme}`);
    }
}

// Ensure the DOM is fully loaded before initializing the script.
document.addEventListener('DOMContentLoaded', init);