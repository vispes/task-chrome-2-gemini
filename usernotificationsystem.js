const UserNotificationSystem = (function() {
    let _notificationContainer = null;
    let _loadingContainer = null;
    const _defaultNotificationDuration = 5000; // 5 seconds for auto-hide

    /**
     * Helper to create DOM elements with optional class and text content.
     * @param {string} tag The HTML tag name (e.g., 'div', 'span').
     * @param {string} [className=''] Class names to add.
     * @param {string} [textContent=''] Text content for the element.
     * @returns {HTMLElement} The created DOM element.
     */
    function _createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    }

    /**
     * Common function to display a notification item.
     * @param {string} message The message to display.
     * @param {string} type The type of notification ('success', 'error', 'info').
     * @param {number} [duration] The duration in milliseconds before the notification fades out.
     */
    function _showNotification(message, type, duration) {
        if (!_notificationContainer) {
            console.warn("UserNotificationSystem: Not initialized. Call init() first.");
            return;
        }

        const notificationItem = _createElement('div', `notification-item notification-${type}`);
        // Add ARIA role for accessibility: 'alert' for errors (more urgent), 'status' for others.
        notificationItem.setAttribute('role', type === 'error' ? 'alert' : 'status');

        const messageElement = _createElement('span', 'notification-message', message);
        const closeButton = _createElement('button', 'notification-close', '?');
        closeButton.setAttribute('aria-label', 'Close notification'); // Accessible label for close button

        notificationItem.appendChild(messageElement);
        notificationItem.appendChild(closeButton);

        // Prepend to show newer notifications at the top
        _notificationContainer.prepend(notificationItem);

        // Trigger transition after a slight delay to allow DOM render
        // Initial opacity and transform are set by CSS class. We animate to the final state.
        setTimeout(() => {
            notificationItem.style.opacity = '1';
            notificationItem.style.transform = 'translateY(0)';
        }, 10);

        // Auto-hide after duration
        const timer = setTimeout(() => {
            _hideNotification(notificationItem);
        }, duration || _defaultNotificationDuration);

        // Manual close functionality
        closeButton.onclick = () => {
            clearTimeout(timer); // Prevent auto-hide after manual close
            _hideNotification(notificationItem);
        };
    }

    /**
     * Hides and removes a specific notification item with a transition.
     * @param {HTMLElement} item The notification item DOM element to hide.
     */
    function _hideNotification(item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        item.addEventListener('transitionend', () => {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }, { once: true }); // Use { once: true } instead of removing listener manually
    }

    return {
        /**
         * Initializes the notification system by creating and attaching necessary DOM elements.
         * This function should be called once when the application starts.
         * Notifications and loading indicators are appended to `document.body` for global overlay capability
         * within the extension's popup context, or to a specified reference element.
         *
         * @param {string} [referenceElementId] The ID of a reference HTML element in the DOM.
         *                                    If provided and found, elements will be appended there.
         *                                    Defaults to `document.body` if not provided or not found.
         */
        init: function(referenceElementId) {
            let parentElement = document.body;
            if (referenceElementId) {
                const mainReferenceContainer = document.getElementById(referenceElementId);
                if (mainReferenceContainer) {
                    parentElement = mainReferenceContainer;
                } else {
                    console.warn(`UserNotificationSystem: Reference element with ID '${referenceElementId}' not found. Appending to document.body instead.`);
                }
            }


            // --- Create Notification Container ---
            _notificationContainer = _createElement('div', 'user-notifications-container');
            _notificationContainer.setAttribute('role', 'status');     // ARIA role for live regions for general status updates
            _notificationContainer.setAttribute('aria-live', 'polite'); // Announce changes non-disruptively
            _notificationContainer.setAttribute('aria-atomic', 'true'); // Announce the entire notification item when added/removed

            // --- Create Loading Container ---
            _loadingContainer = _createElement('div', 'user-loading-container loading-hidden');
            _loadingContainer.setAttribute('role', 'status');           // ARIA role for status updates
            _loadingContainer.setAttribute('aria-label', 'Loading content'); // Accessible label for screen readers
            _loadingContainer.setAttribute('aria-busy', 'false');       // Initial state: not busy

            const loadingSpinner = _createElement('div', 'loading-spinner');
            const loadingMessage = _createElement('span', 'loading-message', '');
            _loadingContainer.appendChild(loadingSpinner);
            _loadingContainer.appendChild(loadingMessage);

            // Append containers to the determined parent element
            parentElement.appendChild(_notificationContainer);
            parentElement.appendChild(_loadingContainer);

            // Styles and keyframes are now expected to be provided via an external CSS file (e.g., popup.css).
        },

        /**
         * Displays a success notification.
         * @param {string} message The message to display.
         * @param {number} [duration] The duration in milliseconds before the notification fades out. Defaults to 5000ms.
         */
        showSuccess: function(message, duration) {
            _showNotification(message, 'success', duration);
        },

        /**
         * Displays an error notification.
         * @param {string} message The message to display.
         * @param {number} [duration] The duration in milliseconds before the notification fades out. Defaults to 5000ms.
         */
        showError: function(message, duration) {
            _showNotification(message, 'error', duration);
        },

        /**
         * Displays an informational notification.
         * @param {string} message The message to display.
         * @param {number} [duration] The duration in milliseconds before the notification fades out. Defaults to 5000ms.
         */
        showInfo: function(message, duration) {
            _showNotification(message, 'info', duration);
        },

        /**
         * Shows a persistent loading indicator with an optional message.
         * The loading indicator will block user interaction while visible.
         * @param {string} [message] The message to display alongside the spinner. Defaults to 'Loading...'.
         */
        showLoading: function(message = 'Loading...') {
            if (!_loadingContainer) {
                console.warn("UserNotificationSystem: Not initialized. Call init() first.");
                return;
            }
            const loadingMessageElement = _loadingContainer.querySelector('.loading-message');
            if (loadingMessageElement) {
                loadingMessageElement.textContent = message;
            }

            _loadingContainer.classList.remove('loading-hidden');
            _loadingContainer.setAttribute('aria-busy', 'true'); // Indicate busy state for accessibility
            // Trigger reflow to ensure CSS transition is applied
            _loadingContainer.offsetWidth;
            _loadingContainer.style.opacity = '1';
            _loadingContainer.style.pointerEvents = 'all'; // Allow interaction with the loading overlay (e.g., if we had a cancel button)
        },

        /**
         * Hides the loading indicator.
         */
        hideLoading: function() {
            if (!_loadingContainer) {
                return;
            }
            _loadingContainer.style.opacity = '0';
            _loadingContainer.style.pointerEvents = 'none'; // Revert to non-interactive
            _loadingContainer.setAttribute('aria-busy', 'false'); // Indicate not busy for accessibility
            _loadingContainer.addEventListener('transitionend', () => {
                _loadingContainer.classList.add('loading-hidden');
            }, { once: true }); // Use { once: true } instead of removing listener manually
        },

        /**
         * Clears all currently displayed non-loading notifications.
         * Does not affect the loading indicator.
         */
        clearAll: function() {
            if (!_notificationContainer) {
                return;
            }
            // Create a static array copy of children to avoid issues during removal
            const items = Array.from(_notificationContainer.children);
            items.forEach(item => _hideNotification(item));
        }
    };
})();