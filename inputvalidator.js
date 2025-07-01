function isValidText(text, min, max) {
    if (typeof text !== 'string') {
        return false;
    }

    const trimmedText = text.trim();

    const minVal = typeof min === 'number' && !isNaN(min) && min >= 0 ? min : 0;
    const maxVal = typeof max === 'number' && !isNaN(max) && max >= minVal ? max : Number.MAX_SAFE_INTEGER;

    return trimmedText.length >= minVal && trimmedText.length <= maxVal;
}

function isValidUrl(url) {
    if (typeof url !== 'string' || url.trim() === '') {
        return null; // Return null if not a string or empty
    }

    try {
        const urlObj = new URL(url);
        // Return the URL object itself if it has a valid http/https protocol
        if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
            return urlObj;
        }
        return null; // Not an http/https URL
    } catch (e) {
        return null; // URL parsing failed
    }
}

function isValidDate(dateString) {
    if (typeof dateString !== 'string' || dateString.trim() === '') {
        return false;
    }

    // Stricter validation: Expect YYYY-MM-DD format
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormatRegex.test(dateString)) {
        return false; // Does not match YYYY-MM-DD format
    }

    const date = new Date(dateString);

    // Check if it's a valid date (not NaN) AND if the parsed year, month, and day
    // match the input. This prevents cases like '2023-02-30' or '2023-13-01'
    // where `new Date()` might "correct" the date or produce an unexpected one.
    // Note: getMonth() is 0-indexed, so we add 1 for comparison.
    return !isNaN(date.getTime()) &&
           date.getFullYear() === parseInt(dateString.substring(0, 4), 10) &&
           (date.getMonth() + 1) === parseInt(dateString.substring(5, 7), 10) &&
           date.getDate() === parseInt(dateString.substring(8, 10), 10);
}

function isValidYoutubeUrl(url) {
    // isValidUrl now returns the URL object or null
    const urlObj = isValidUrl(url);

    // If urlObj is null, it means the URL is not valid http/https
    if (!urlObj) {
        return false;
    }

    const hostname = urlObj.hostname;
    return hostname === 'youtube.com' ||
           hostname === 'www.youtube.com' ||
           hostname === 'm.youtube.com' ||
           hostname === 'youtu.be';
}

function isNonEmpty(value) {
    if (value === null || typeof value === 'undefined') {
        return false;
    }

    if (typeof value === 'string') {
        return value.trim() !== '';
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    // More general object check:
    // If it's an object, not null, and not an array, then check its own enumerable properties.
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return Object.keys(value).length > 0;
    }

    // For numbers, booleans, functions, etc., they are considered non-empty if not null/undefined.
    return true;
}

export { isValidText, isValidUrl, isValidDate, isValidYoutubeUrl, isNonEmpty };