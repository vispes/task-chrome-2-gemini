import * as StorageManager from './storage.js';
import * as YoutubeManager from './youtube.js';
import * as RichTextEditorManager from './richtexteditor.js';
import { isValidText, isValidUrl } from './inputvalidator.js';

const PopupManager = (() => {
    const STORAGE_KEYS = StorageManager.STORAGE_KEYS;

    // Cache UI Elements for efficiency
    const uiElements = {};
    let noteEditorInstance = null; // Instance for the rich text editor

    /**
     * Applies internationalization strings to UI elements.
     */
    function applyI18n() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translatedText = chrome.i18n.getMessage(key);
            if (translatedText) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translatedText;
                } else {
                    element.textContent = translatedText;
                }
            } else {
                console.warn(`Missing i18n translation for key: ${key}`);
            }
        });
    }

    /**
     * Generates a unique ID for new items (tasks, notes, videos).
     * Aligns with crypto.randomUUID used elsewhere for consistency.
     * @returns {string} A unique ID string.
     */
    function generateUniqueId() {
        return crypto.randomUUID();
    }

    /**
     * Initializes the popup application.
     * Caches UI elements, binds event listeners, and refreshes data.
     */
    async function init() {
        // Cache all necessary UI elements
        uiElements.navTasks = document.getElementById('nav-tasks');
        uiElements.navNotes = document.getElementById('nav-notes');
        uiElements.navYoutube = document.getElementById('nav-youtube');

        uiElements.tasksSection = document.getElementById('tasks-section');
        uiElements.notesSection = document.getElementById('notes-section');
        uiElements.youtubeSection = document.getElementById('youtube-section');

        uiElements.taskForm = document.getElementById('task-form');
        uiElements.taskInput = document.getElementById('task-input');
        uiElements.taskList = document.getElementById('task-list');

        uiElements.noteForm = document.getElementById('note-form');
        uiElements.noteTitleInput = document.getElementById('note-title-input');
        uiElements.noteEditorContainer = document.getElementById('note-editor-container'); // Changed from noteContentInput to a container for RTE
        uiElements.noteList = document.getElementById('note-list');

        uiElements.youtubeEmbedForm = document.getElementById('youtube-embed-form');
        uiElements.youtubeUrlInput = document.getElementById('youtube-url-input');
        uiElements.youtubeVideosContainer = document.getElementById('youtube-videos-container');

        // Initialize rich text editor
        if (uiElements.noteEditorContainer) {
            noteEditorInstance = RichTextEditorManager.create(uiElements.noteEditorContainer);
        } else {
            console.error("Note editor container not found. Rich text editor not initialized.");
        }

        bindEventListeners();
        applyI18n(); // Apply i18n translations
        await refreshData();
        navigateTo('tasks'); // Default view on load
    }

    /**
     * Navigates to a specific section of the popup UI.
     * Hides all sections and displays the target section, updating navigation button styles.
     * @param {string} section - The ID of the section to navigate to ('tasks', 'notes', 'youtube').
     */
    function navigateTo(section) {
        // Hide all section elements
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        // Deactivate all navigation buttons
        document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));

        // Show the target section and activate its corresponding button
        switch (section) {
            case 'tasks':
                uiElements.tasksSection.classList.add('active');
                uiElements.navTasks.classList.add('active');
                break;
            case 'notes':
                uiElements.notesSection.classList.add('active');
                uiElements.navNotes.classList.add('active');
                break;
            case 'youtube':
                uiElements.youtubeSection.classList.add('active');
                uiElements.navYoutube.classList.add('active');
                break;
        }
    }

    /**
     * Renders the list of tasks to the UI.
     * @param {Array<Object>} tasks - An array of task objects to display.
     */
    function renderTasks(tasks) {
        uiElements.taskList.innerHTML = ''; // Clear current tasks

        if (tasks.length === 0) {
            uiElements.taskList.innerHTML = '<li class="no-items">' + chrome.i18n.getMessage('noTasksYet') + '</li>';
            return;
        }

        // Sort tasks by timestamp (newest first)
        tasks.sort((a, b) => b.timestamp - a.timestamp);

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            li.className = task.completed ? 'completed' : '';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.dataset.action = 'toggle-complete';
            li.appendChild(checkbox);

            const span = document.createElement('span');
            span.textContent = task.content; // Use textContent to prevent XSS
            li.appendChild(span);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = chrome.i18n.getMessage('deleteButton');
            deleteButton.dataset.action = 'delete-task';
            li.appendChild(deleteButton);

            uiElements.taskList.appendChild(li);
        });
    }

    /**
     * Renders the list of notes to the UI.
     * @param {Array<Object>} notes - An array of note objects to display.
     */
    function renderNotes(notes) {
        uiElements.noteList.innerHTML = ''; // Clear current notes

        if (notes.length === 0) {
            uiElements.noteList.innerHTML = '<div class="no-items">' + chrome.i18n.getMessage('noNotesYet') + '</div>';
            return;
        }

        // Sort notes by timestamp (newest first)
        notes.sort((a, b) => b.timestamp - a.timestamp);

        notes.forEach(note => {
            const div = document.createElement('div');
            div.dataset.id = note.id;
            div.className = 'note-item';

            const h3 = document.createElement('h3');
            h3.textContent = note.title; // Use textContent to prevent XSS
            div.appendChild(h3);

            const p = document.createElement('p');
            // Assuming note.content is HTML from the rich text editor
            p.innerHTML = note.content;
            div.appendChild(p);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = chrome.i18n.getMessage('deleteButton');
            deleteButton.dataset.action = 'delete-note';
            div.appendChild(deleteButton);

            uiElements.noteList.appendChild(div);
        });
    }

    /**
     * Renders the list of embedded YouTube videos to the UI.
     * @param {Array<Object>} videos - An array of video objects to display.
     */
    function renderYoutubeVideos(videos) {
        uiElements.youtubeVideosContainer.innerHTML = ''; // Clear current videos

        if (videos.length === 0) {
            uiElements.youtubeVideosContainer.innerHTML = '<div class="no-items">' + chrome.i18n.getMessage('noVideosEmbeddedYet') + '</div>';
            return;
        }

        // Sort videos by timestamp (newest first)
        videos.sort((a, b) => b.timestamp - a.timestamp);

        videos.forEach(video => {
            const videoId = video.videoId;
            if (!videoId) return;

            const div = document.createElement('div');
            div.dataset.id = video.id;
            div.className = 'youtube-item';

            // Use YoutubeManager to render the embed
            const iframeHTML = YoutubeManager.renderVideoEmbed(videoId);
            div.innerHTML = iframeHTML; // This injects the iframe

            const deleteButton = document.createElement('button');
            deleteButton.textContent = chrome.i18n.getMessage('deleteButton');
            deleteButton.dataset.action = 'delete-youtube';
            div.appendChild(deleteButton); // Append the button after the iframe HTML

            uiElements.youtubeVideosContainer.appendChild(div);
        });
    }

    /**
     * Handles the submission of the task form.
     * Prevents default form submission, creates a new task, saves it to storage, and re-renders tasks.
     * @param {Event} event - The form submission event.
     */
    async function handleTaskFormSubmit(event) {
        event.preventDefault();
        const taskContent = uiElements.taskInput.value.trim();

        if (!isValidText(taskContent, 1)) { // Use input validator
            alert(chrome.i18n.getMessage('taskContentRequired'));
            return;
        }

        try {
            const tasks = await StorageManager.getItem(STORAGE_KEYS.TASKS);
            const newTask = {
                id: generateUniqueId(),
                content: taskContent,
                completed: false,
                timestamp: Date.now()
            };
            tasks.push(newTask);
            await StorageManager.setItem(STORAGE_KEYS.TASKS, tasks);
            uiElements.taskInput.value = ''; // Clear input field
            renderTasks(tasks); // Re-render the task list
        } catch (error) {
            console.error("Error handling task form submission:", error);
            alert(chrome.i18n.getMessage('addTaskFailed'));
        }
    }

    /**
     * Handles the submission of the note form.
     * Prevents default form submission, creates a new note, saves it to storage, and re-renders notes.
     * @param {Event} event - The form submission event.
     */
    async function handleNoteFormSubmit(event) {
        event.preventDefault();
        const noteTitle = uiElements.noteTitleInput.value.trim();
        // Get content from the rich text editor
        const noteContent = noteEditorInstance ? RichTextEditorManager.getHtmlContent(noteEditorInstance) : '';

        if (!isValidText(noteTitle, 1)) {
            alert(chrome.i18n.getMessage('noteTitleRequired'));
            return;
        }
        if (!isValidText(noteContent, 1)) { // Check for actual content from RTE
            alert(chrome.i18n.getMessage('noteContentRequired'));
            return;
        }

        try {
            const notes = await StorageManager.getItem(STORAGE_KEYS.NOTES);
            const newNote = {
                id: generateUniqueId(),
                title: noteTitle,
                content: noteContent, // Store as HTML
                timestamp: Date.now()
            };
            notes.push(newNote);
            await StorageManager.setItem(STORAGE_KEYS.NOTES, notes);
            uiElements.noteTitleInput.value = ''; // Clear title input
            if (noteEditorInstance) {
                RichTextEditorManager.setHtmlContent(noteEditorInstance, ''); // Clear rich text editor
            }
            renderNotes(notes); // Re-render the note list
        } catch (error) {
            console.error("Error handling note form submission:", error);
            alert(chrome.i18n.getMessage('addNoteFailed'));
        }
    }

    /**
     * Handles the submission of the YouTube embed form.
     * Extracts video ID from the URL, checks for duplicates, saves to storage, and re-renders videos.
     * @param {Event} event - The form submission event.
     */
    async function handleYoutubeEmbed(event) {
        event.preventDefault();
        const youtubeUrl = uiElements.youtubeUrlInput.value.trim();

        if (!isValidUrl(youtubeUrl)) { // Use input validator
            alert(chrome.i18n.getMessage('invalidYoutubeUrl'));
            return;
        }

        // Use YoutubeManager to extract video ID
        const videoId = YoutubeManager.extractVideoId(youtubeUrl);

        if (!videoId) {
            alert(chrome.i18n.getMessage('invalidYoutubeUrlSpecific'));
            return;
        }

        try {
            const videos = await StorageManager.getItem(STORAGE_KEYS.YOUTUBE_VIDEOS);
            // Prevent adding duplicate videos (check by videoId)
            if (videos.some(video => video.videoId === videoId)) {
                alert(chrome.i18n.getMessage('videoAlreadyEmbedded'));
                uiElements.youtubeUrlInput.value = '';
                return;
            }

            const newVideo = {
                id: generateUniqueId(),
                videoId: videoId,
                timestamp: Date.now()
            };
            videos.push(newVideo);
            await StorageManager.setItem(STORAGE_KEYS.YOUTUBE_VIDEOS, videos);
            uiElements.youtubeUrlInput.value = ''; // Clear input field
            renderYoutubeVideos(videos); // Re-render the video list
        } catch (error) {
            console.error("Error handling YouTube embed:", error);
            alert(chrome.i18n.getMessage('embedVideoFailed'));
        }
    }

    /**
     * Binds all necessary event listeners to UI elements.
     * Includes navigation, form submissions, and dynamic item actions (via event delegation).
     */
    function bindEventListeners() {
        // Navigation button click listeners
        uiElements.navTasks.addEventListener('click', () => navigateTo('tasks'));
        uiElements.navNotes.addEventListener('click', () => navigateTo('notes'));
        uiElements.navYoutube.addEventListener('click', () => navigateTo('youtube'));

        // Form submission listeners
        uiElements.taskForm.addEventListener('submit', handleTaskFormSubmit);
        uiElements.noteForm.addEventListener('submit', handleNoteFormSubmit);
        uiElements.youtubeEmbedForm.addEventListener('submit', handleYoutubeEmbed);

        // Event delegation for dynamic task actions (toggle complete, delete)
        uiElements.taskList.addEventListener('click', async (event) => {
            const target = event.target;
            const listItem = target.closest('li[data-id]');
            if (!listItem) return; // Not a list item or its descendant

            const taskId = listItem.dataset.id;
            let tasks = [];
            try {
                tasks = await StorageManager.getItem(STORAGE_KEYS.TASKS);
                if (target.dataset.action === 'toggle-complete') {
                    tasks = tasks.map(task =>
                        task.id === taskId ? { ...task, completed: target.checked } : task
                    );
                } else if (target.dataset.action === 'delete-task') {
                    tasks = tasks.filter(task => task.id !== taskId);
                } else {
                    return; // Clicked on something else within the list item
                }
                await StorageManager.setItem(STORAGE_KEYS.TASKS, tasks);
                renderTasks(tasks); // Re-render after action
            } catch (error) {
                console.error("Error updating tasks:", error);
                alert(chrome.i18n.getMessage('updateTaskFailed'));
            }
        });

        // Event delegation for dynamic note actions (delete)
        uiElements.noteList.addEventListener('click', async (event) => {
            const target = event.target;
            const noteItem = target.closest('.note-item[data-id]');
            if (!noteItem) return;

            const noteId = noteItem.dataset.id;
            let notes = [];
            try {
                notes = await StorageManager.getItem(STORAGE_KEYS.NOTES);
                if (target.dataset.action === 'delete-note') {
                    notes = notes.filter(note => note.id !== noteId);
                    await StorageManager.setItem(STORAGE_KEYS.NOTES, notes);
                    renderNotes(notes); // Re-render after action
                }
            } catch (error) {
                console.error("Error deleting note:", error);
                alert(chrome.i18n.getMessage('deleteNoteFailed'));
            }
        });

        // Event delegation for dynamic YouTube video actions (delete)
        uiElements.youtubeVideosContainer.addEventListener('click', async (event) => {
            const target = event.target;
            const youtubeItem = target.closest('.youtube-item[data-id]');
            if (!youtubeItem) return;

            const videoId = youtubeItem.dataset.id; // This is the unique ID assigned to the item, not the youtube video ID
            let videos = [];
            try {
                videos = await StorageManager.getItem(STORAGE_KEYS.YOUTUBE_VIDEOS);
                if (target.dataset.action === 'delete-youtube') {
                    videos = videos.filter(video => video.id !== videoId);
                    await StorageManager.setItem(STORAGE_KEYS.YOUTUBE_VIDEOS, videos);
                    renderYoutubeVideos(videos); // Re-render after action
                }
            } catch (error) {
                console.error("Error deleting YouTube video:", error);
                alert(chrome.i18n.getMessage('deleteVideoFailed'));
            }
        });
    }

    /**
     * Refreshes all application data by fetching it from Chrome storage
     * and re-rendering all relevant UI components.
     */
    async function refreshData() {
        try {
            const [tasks, notes, youtubeVideos] = await Promise.all([
                StorageManager.getItem(STORAGE_KEYS.TASKS),
                StorageManager.getItem(STORAGE_KEYS.NOTES),
                StorageManager.getItem(STORAGE_KEYS.YOUTUBE_VIDEOS)
            ]);
            renderTasks(tasks);
            renderNotes(notes);
            renderYoutubeVideos(youtubeVideos);
        } catch (error) {
            console.error("Error refreshing data:", error);
            alert(chrome.i18n.getMessage('loadDataFailed'));
        }
    }

    // Expose the init function to be called from the global scope (DOMContentLoaded listener)
    return {
        init: init
    };
})();

// Initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', PopupManager.init);