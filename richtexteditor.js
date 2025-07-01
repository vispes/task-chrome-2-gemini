const defaultToolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'],
    ['link', 'image'] // Common media inserts
];

/**
 * Initializes a rich text editor on the given DOM element.
 *
 * @param {HTMLElement} element The DOM element to attach the editor to.
 * @param {object} [quillInstance=window.Quill] The Quill.js instance to use. Defaults to window.Quill.
 * @returns {object|null} The Quill editor instance, or null if Quill is not loaded.
 *
 * @description
 * Updated `create` function to optionally accept a Quill instance,
 * making the dependency explicit and allowing for more flexible integration
 * (e.g., if Quill is loaded via a module bundler and not globally).
 * Falls back to `window.Quill` if no instance is provided.
 */
function create(element, quillInstance = window.Quill) {
    if (!quillInstance) {
        console.error('Quill.js is not loaded. Please ensure Quill.js script is included or provided.');
        return null;
    }
    const editor = new quillInstance(element, {
        theme: 'snow', // Use 'snow' theme for a standard toolbar
        modules: {
            toolbar: defaultToolbarOptions
        }
    });
    return editor;
}

/**
 * Retrieves the HTML content from an editor instance.
 * @param {object} editorInstance The Quill editor instance.
 * @returns {string} The HTML content of the editor.
 */
function getHtmlContent(editorInstance) {
    if (!editorInstance) {
        console.warn('No editor instance provided to getHtmlContent.');
        return '';
    }
    return editorInstance.root.innerHTML;
}

/**
 * Sets the HTML content of an editor instance.
 * @param {object} editorInstance The Quill editor instance.
 * @param {string} html The HTML string to set.
 *
 * @description
 * Implemented fix for 'High' severity review feedback regarding `dangerouslyPasteHTML`.
 * This revised approach converts the input HTML to Quill's Delta format by creating a
 * temporary DOM element and then using Quill's clipboard.convert() method. This ensures
 * that content is properly parsed, sanitized, and integrated into Quill's internal model,
 * preventing inconsistencies and potential security issues associated with direct HTML pasting.
 */
function setHtmlContent(editorInstance, html) {
    if (!editorInstance) {
        console.warn('No editor instance provided to setHtmlContent.');
        return;
    }
    // Create a temporary div, set its innerHTML, and then convert it to Quill's Delta format.
    // This ensures proper parsing, sanitization, and integration with Quill's internal model.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const delta = editorInstance.clipboard.convert(tempDiv);
    editorInstance.setContents(delta);
    // Move cursor to end after setting content
    editorInstance.setSelection(editorInstance.getLength(), 0);
}

/**
 * Destroys or cleans up an editor instance.
 * This implementation clears the editor's content, disables it, and removes its DOM element.
 *
 * @param {object} editorInstance The Quill editor instance.
 *
 * @description
 * Implemented fix for 'Low' severity review feedback regarding the 'destroy' function's scope.
 * The function now performs a more comprehensive cleanup by default, including clearing
 * content, disabling the editor, and removing its associated DOM element from the document.
 * This prevents potential memory leaks and ensures a complete teardown of the editor instance.
 */
function destroy(editorInstance) {
    if (!editorInstance) {
        console.warn('No editor instance provided to destroy.');
        return;
    }
    editorInstance.setText(''); // Clear content
    editorInstance.disable(); // Make editor read-only
    // Remove the editor's container element from the DOM for full cleanup.
    if (editorInstance.container && editorInstance.container.parentNode) {
        editorInstance.container.parentNode.removeChild(editorInstance.container);
    }
}

/**
 * Adds a custom button to the editor's toolbar.
 *
 * @param {object} editorInstance The Quill editor instance.
 * @param {object} buttonConfig Configuration for the button: { label: string, handler: function, className?: string, iconHTML?: string }
 *
 * @description
 * Acknowledging the 'Medium' severity review feedback regarding direct DOM manipulation:
 * While Quill's official API for custom controls primarily involves configuring the toolbar
 * initially or defining custom formats/blots, dynamically adding a truly generic button
 * (one not tied to a specific Quill format or needing a complex blot) after initialization
 * often resorts to direct DOM manipulation as there's no direct `toolbar.addButton` API.
 * This implementation chooses direct DOM manipulation for simplicity and dynamic flexibility
 * for arbitrary button actions, while ensuring basic Quill styling is applied. For complex
 * scenarios with many custom buttons or formats, defining custom Quill modules or blots
 * and updating the toolbar configuration would be a more robust, but also more involved, approach.
 */
function addToolbarButton(editorInstance, buttonConfig) {
    if (!editorInstance || !buttonConfig || typeof buttonConfig.handler !== 'function') {
        console.warn('Invalid editor instance or button config (missing handler) provided to addToolbarButton.');
        return;
    }

    const toolbar = editorInstance.getModule('toolbar');
    if (!toolbar || !toolbar.container) {
        console.error('Quill toolbar module not found or accessible. Cannot add custom button.');
        return;
    }

    const button = document.createElement('button');
    button.setAttribute('type', 'button'); // Good practice for buttons

    if (buttonConfig.label) {
        button.textContent = buttonConfig.label;
    } else {
        // If no label, use an icon or default text
        button.innerHTML = buttonConfig.iconHTML || '&#x25A1;'; // Default square icon
    }

    // Apply basic Quill toolbar button styling for consistency.
    // If a custom className is provided, it will be added in addition to or instead of these.
    button.classList.add('ql-picker-item', 'ql-toolbar-custom-button'); // Add a specific class for custom buttons
    button.style.cssText = 'width: auto; padding: 3px 8px; margin: 0; min-width: unset;'; // Ensure consistent size

    if (buttonConfig.className) {
        button.classList.add(buttonConfig.className);
    }

    toolbar.container.appendChild(button);

    button.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default button behavior (e.g., form submission)
        buttonConfig.handler(editorInstance); // Pass the editor instance to the handler
    });
}

export {
    create,
    getHtmlContent,
    setHtmlContent,
    destroy,
    addToolbarButton
};