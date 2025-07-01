# task-chrome-2-gemini

## Marketing Productivity Chrome Extension

A Google Chrome extension designed to significantly enhance marketing productivity by centralizing task management, rich text note-taking, and multimedia learning (YouTube integration) into a single, user-friendly browser popup interface.

## Overview

This project provides a unified platform to streamline daily workflows for online marketers, reducing application switching and boosting overall efficiency and learning capabilities. It consolidates essential tools directly within your browser, offering seamless access to your tasks, notes, and educational content, aiming to improve focus and productivity by minimizing the need to switch between multiple applications.

## Features

The Marketing Productivity Chrome Extension offers a robust set of capabilities to supercharge your daily workflow:

*   **Comprehensive Task Management:** Easily add, view, edit, mark complete, and delete tasks and subtasks. Tasks can include detailed descriptions and due dates, providing a clear overview of your responsibilities.
*   **Rich Text Note-Taking:** Create, edit, and manage notes with advanced formatting capabilities, powered by an integrated rich text editor. This allows for detailed and organized record-keeping.
*   **YouTube Video Embedding:** Seamlessly embed and view YouTube tutorials and relevant videos directly within the extension's interface by simply pasting a URL. This feature facilitates learning and content consumption without leaving your workflow.
*   **Persistent Data Storage:** All your tasks, notes, and personalized user settings are securely saved and persist across browser sessions using Chrome's native storage APIs (`chrome.storage.local`). Your data is always available when you need it.
*   **Intuitive User Interface:** Experience a responsive, touch-friendly, and accessible design, available instantly via a browser action popup. The UI is crafted for ease of use and quick navigation.
*   **Customizable Settings:** A dedicated options page allows you to personalize extension appearance (e.g., UI theme) and behavior to fit your preferences, ensuring a tailored user experience.
*   **In-Popup Navigation:** Utilize a clear and efficient navigation system (e.g., tabs, sidebar) within the popup for quick switching between different features like tasks, notes, and YouTube integration.
*   **User Feedback System:** Receive clear notifications for successful operations, errors, and loading states, ensuring a transparent and smooth user experience.

## Architecture

The Marketing Productivity Chrome Extension operates as a browser action (popup) extension, leveraging Google Chrome's native APIs for core functionality and data persistence. The architecture is primarily client-side, built using standard web technologies: HTML5 for structure, CSS3 for styling, and JavaScript (ES6+) for all interactive logic and API integrations.

Data is stored locally using `chrome.storage.local` to ensure persistence across browser sessions. A modular JavaScript approach, potentially utilizing a modern front-end framework (though not strictly specified for MVP, it's recommended), and a component-based structure, is adopted for efficient UI development and state management. A third-party rich text editor library will be integrated for enhanced note-taking capabilities.

The extension is designed to be self-contained within its popup and options page, with no content script injection or modification of visited web pages, ensuring minimal impact on the user's browsing experience.

## Key Flows

User interactions are streamlined through four primary flows, accessible via intuitive internal navigation within the popup:

1.  **Task Management Flow:**
    *   Users click the extension icon to open the popup.
    *   Navigate to the 'Tasks' section.
    *   They can then view existing tasks (and subtasks), add new tasks with details (e.g., description, due date).
    *   Mark tasks as complete, edit task details, or delete tasks.
    *   All interactions are direct within the popup, with immediate visual feedback.
2.  **Notes Management Flow:**
    *   Users navigate to a 'Notes' section within the popup.
    *   Here, they can create new notes using an integrated rich text editor, save them.
    *   Browse through existing notes, select and view specific notes, make edits, or delete notes.
    *   Data persistence is immediate upon saving.
3.  **YouTube Integration Flow:**
    *   Within the popup, users can access a dedicated 'YouTube' section or a specific input field within tasks/notes.
    *   They paste YouTube URLs into this field, and the extension processes the URL to embed and display the video directly within the extension's interface, allowing for seamless content consumption.
4.  **Settings/Configuration Flow:**
    *   Users access a dedicated 'Settings' or 'Options' page. This page, typically opened in a new browser tab, allows users to customize extension preferences such as UI theme, default view, or other behavioral settings.
    *   Changes are saved persistently using `chrome.storage.sync` or `chrome.storage.local`.

## Installation

To install `task-chrome-2-gemini` in your Chrome browser:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/task-chrome-2-gemini.git
    cd task-chrome-2-gemini
    ```
    *(Note: Replace `your-username` with the actual repository owner if this project is publicly available)*
2.  **Open Chrome Extensions page:**
    *   Type `chrome://extensions` into your Chrome browser's address bar and press Enter.
    *   Alternatively, go to Chrome Menu (three dots) > More Tools > Extensions.
3.  **Enable Developer mode:**
    *   Toggle on the "Developer mode" switch, usually found in the top-right corner of the Extensions page.
4.  **Load the unpacked extension:**
    *   Click on the "Load unpacked" button that appears.
    *   Navigate to the cloned `task-chrome-2-gemini` directory on your computer.
    *   Select the entire directory (containing `manifest.json`) and click "Select Folder".
5.  **Pin the extension (optional but recommended):**
    *   Click the puzzle piece icon (Extensions icon) in your browser toolbar.
    *   Find "Marketing Productivity Chrome Extension" (or similar name from `manifest.json`).
    *   Click the pin icon next to it to make the extension visible on your toolbar for easy access.

The extension icon will now appear in your browser toolbar.

## Usage

Once installed and pinned, click on the extension icon in your Chrome toolbar to open the popup interface.

*   **Tasks:**
    *   The default view might be tasks, or you can navigate to the "Tasks" tab if present.
    *   Use the input fields to add new tasks with details.
    *   Click on existing tasks to expand, view details, mark as complete, edit, or delete them.
*   **Notes:**
    *   Navigate to the "Notes" tab.
    *   Click "New Note" (or a similar button) to open the rich text editor. Type your notes, apply various formatting options, and save.
    *   Browse through your saved notes, click to open and edit them.
*   **YouTube:**
    *   Access the "YouTube" section or locate a video embed input field within tasks/notes.
    *   Paste a YouTube URL into the designated input field and confirm (e.g., press Enter or click an "Embed" button). The video will embed and play directly within the extension's interface.
*   **Settings:**
    *   Look for a "Settings" or "Options" button (often represented by a gear icon) within the popup, or right-click the extension icon in your toolbar and select "Options".
    *   This will typically open a new browser tab where you can customize preferences such as UI theme, default view, or other behavioral settings.

## Project Structure & Key Files

The project is organized into several modules and files, each serving a specific purpose within the extension's architecture.

| File/Module               | Type       | Purpose                                                                                                                                                                                                                                                                                                                                                             | Dependencies                                                                                                                                                                                                                                                                  |
| :------------------------ | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest.json`           | JSON       | The core configuration file for the Chrome Extension, defining its metadata, required permissions, entry points (`popup.html`, `options.html`, `background.js`), and other browser-specific settings.                                                                                                                                                                  | `i18nmessagefiles.json` (for localization)                                                                                                                                                                                                                                |
| `background.js`           | JavaScript | A service worker script that runs persistently in the background. It handles extension lifecycle events (e.g., installation, update), manages global states, and can perform long-running tasks. For MVP, it primarily handles installation routines.                                                                                                                 | -                                                                                                                                                                                                                                                                         |
| `popup.html`              | HTML       | The primary HTML structure for the extension's browser action popup. This file defines the layout and content areas for the task management, note-taking, and YouTube video embedding sections.                                                                                                                                                                         | `popup.css`, `popup.js`                                                                                                                                                                                                                                   |
| `popup.css`               | CSS        | Contains all the cascading style sheet rules for `popup.html`, ensuring a clean, responsive, touch-friendly, and visually appealing user interface within the popup.                                                                                                                                                                                                  | `popup.html`                                                                                                                                                                                                                                                              |
| `popup.js`                | JavaScript | The main JavaScript entry point for the popup interface. It orchestrates UI rendering, manages user events (e.g., adding tasks, navigating tabs, saving notes), and coordinates interactions with other core modules like task management, note management, and data storage.                                                                                         | `task.js`, `note.js`, `youtube.js`, `storage.js`, `inputvalidator.js`, `usernotificationsystem.js`, `richtexteditor.js` (via `richtext.js`), `notification.js`, `config.ini`, `data.csv`, `error.log`, `i18n.pot` (for string extraction)                                      |
| `storage.js`              | JavaScript | A dedicated utility module that provides a simplified wrapper around Chrome's `chrome.storage.local` API. It offers convenient functions for saving, retrieving, and managing all application data persistently across browser sessions.                                                                                                                                | -                                                                                                                                                                                                                                                                         |
| `richtext.js`             | JavaScript | This module is responsible for initializing and interacting with the chosen third-party rich text editor library (e.g., Quill, TinyMCE). It provides abstraction functions to create, get content from, set content for, and potentially destroy editor instances.                                                                                                       | *Third-party rich text editor library (e.g., Quill.js, TinyMCE, CKEditor)*                                                                                                                                                                                                |
| `richtexteditor.js`       | JavaScript | A concrete implementation file for handling specific rich text editor operations, likely building upon or complementing `richtext.js` with more granular control or custom editor features.                                                                                                                                                                            | -                                                                                                                                                                                                                                                                         |
| `task.js`                 | JavaScript | Manages all business logic related to tasks and subtasks. This includes functions for CRUD (Create, Read, Update, Delete) operations, marking tasks as complete/incomplete, and structuring task-related data.                                                                                                                                                       | `storage.js`                                                                                                                                                                                                                                                              |
| `note.js`                 | JavaScript | Handles all functionalities related to rich text notes, including CRUD operations for notes. It manages the content of notes by integrating with the rich text editor functionalities provided by `richtext.js`.                                                                                                                                                   | `storage.js`                                                                                                                                                                                                                                                              |
| `youtube.js`              | JavaScript | Provides essential functions for embedding YouTube videos directly within the extension's interface. This includes logic to extract video IDs from URLs and convert them into embeddable iframe URLs for seamless video consumption.                                                                                                                                  | -                                                                                                                                                                                                                                                                         |
| `options.html`            | HTML       | The HTML structure for the extension's settings or options page. This page, typically opened in a new tab, allows users to customize extension preferences such as UI layout, theme, or other behavioral settings.                                                                                                                                                  | `options.css`, `options.js`                                                                                                                                                                                                                               |
| `options.css`             | CSS        | Contains the CSS rules specifically for styling the `options.html` page, ensuring a visually consistent and user-friendly settings interface that matches the extension's overall design.                                                                                                                                                                            | `options.html`                                                                                                                                                                                                                                                            |
| `options.js`              | JavaScript | The JavaScript logic for the options page. It is responsible for loading current user preferences, saving updated settings using the `storage.js` module, and handling all UI interactions on the settings page.                                                                                                                                                       | `storage.js`, `settings.xml` (for structured config data)                                                                                                                                                                                                 |
| `config.ini`              | INI        | A configuration file in INI format, used to store initial or default settings that might not be user-configurable, or for development-specific parameters and feature flags.                                                                                                                                                                                           | `popup.js` (read by relevant modules during initialization)                                                                                                                                                                                                       |
| `data.csv`                | CSV        | A CSV (Comma Separated Values) file that could be used for importing initial sample data (e.g., pre-populated tasks or notes) into the extension, or potentially for exporting user data for backup purposes.                                                                                                                                                        | `popup.js` (or a dedicated data import/export module)                                                                                                                                                                                                     |
| `error.log`               | Log        | A plain text log file designed to record application errors, warnings, or detailed debug information. This file is crucial for troubleshooting issues and monitoring the extension's behavior during development and usage.                                                                                                                                        | `popup.js` (and other modules for logging errors)                                                                                                                                                                                                         |
| `i18n.pot`                | POT        | A Portable Object Template file used for internationalization (i18n). It contains all translatable strings extracted from the extension's code and UI, serving as a base for creating language-specific translation files.                                                                                                                                             | `popup.js` (and other UI-related JS/HTML files for string extraction)                                                                                                                                                                                     |
| `i18nmessagefiles.json`   | JSON       | Refers to concrete JSON files (e.g., `messages.json` within `_locales/<lang>/` directories) that contain key-value pairs for all user-facing strings. These files enable multi-language support for the extension's UI.                                                                                                                                             | `manifest.json` (as `manifest.json` references the `_locales` directory for internationalization)                                                                                                                                                         |
| `messages.json`           | JSON       | A specific JSON file containing translated key-value pairs for user-facing strings, typically residing in a `_locales/<lang>` directory. This is a primary source for displaying localized text in the UI.                                                                                                                                                         | `i18nmessagefiles.json` (part of the overall i18n system)                                                                                                                                                                                                 |
| `settings.xml`            | XML        | An XML file, potentially used for storing more complex or structured configuration data that requires a hierarchical format, such as predefined layouts or advanced customization options for the extension's behavior.                                                                                                                                              | `options.js` (read by the options page logic)                                                                                                                                                                                                             |
| `inputvalidator.js`       | JavaScript | A utility module containing a set of functions designed to validate various user inputs. This includes checks for empty fields, correct URL formats (especially for YouTube URLs), and valid date/time entries, ensuring data integrity.                                                                                                                                 | `popup.js` (used for form validation), `task.js`, `note.js`, `youtube.js` (where input validation is needed)                                                                                                                                              |
| `usernotificationsystem.js` | JavaScript | A centralized system or collection of functions for displaying various types of user feedback within the popup interface. This includes success messages, error alerts, informational messages, and loading indicators to provide clear communication to the user.                                                                                                    | `popup.js` (used by popup logic to display messages)                                                                                                                                                                                                      |
| `notification.js`         | JavaScript | A more granular module for handling specific types of user notifications, such as displaying "toast" messages (temporary pop-up notifications) or modal dialogues. It likely builds upon or integrates with `usernotificationsystem.js`.                                                                                                                                | `usernotificationsystem.js` (as a sub-component or alternative notification method)                                                                                                                                                                         |

## External Dependencies

While the project primarily leverages Chrome's native APIs and standard web technologies, the following *external* dependencies are implied or specifically mentioned as integrations:

*   **Rich Text Editor Library:** A third-party JavaScript library will be integrated to provide the advanced rich text editing capabilities for the Notes feature. Examples of such libraries include Quill.js, TinyMCE, or CKEditor. The specific library choice is part of the implementation detail but is crucial for the functionality described in `richtext.js` and `richtexteditor.js`.

## Contributing

We welcome contributions to the `task-chrome-2-gemini` project! If you have suggestions, bug reports, or want to contribute code, please feel free to:

1.  Fork the repository.
2.  Create a new branch for your feature or bugfix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b bugfix/issue-description
    ```
3.  Make your changes and commit them with clear, descriptive messages:
    ```bash
    git commit -m 'feat: Add new task sorting option'
    ```
4.  Push your changes to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
5.  Open a Pull Request to the `main` branch of this repository.

Please ensure your code adheres to the project's coding standards and includes appropriate tests if applicable.

## License

This project is licensed under the [MIT License](LICENSE.md).

---
*This README was generated by an AI assistant based on the provided project details.*