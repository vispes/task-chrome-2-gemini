function extractVideoId(url) {
    if (typeof url !== 'string' || !url) {
        return null;
    }

    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    return match ? match[1] : null;
}

/**
 * Generates the standard YouTube embed URL for a given video ID.
 * @param {string} videoId The 11-character YouTube video ID.
 * @returns {string|null} The YouTube embed URL, or null if videoId is invalid.
 */
function getEmbedUrl(videoId) {
    if (typeof videoId !== 'string' || videoId.length !== 11) {
        return null;
    }
    return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Renders a YouTube video embed (iframe) into the specified DOM element.
 * The element will be cleared before the iframe is appended.
 * Error messages are logged to console, and the function returns false on failure.
 * The caller is responsible for displaying user-facing error messages.
 * @param {HTMLElement} element The DOM element where the iframe should be appended.
 * @param {string} youtubeUrl The original YouTube URL.
 * @returns {boolean} True if the video was successfully rendered, false otherwise.
 */
function renderVideoEmbed(element, youtubeUrl) {
    if (!(element instanceof HTMLElement)) {
        console.error('renderVideoEmbed: Provided element is not a valid HTMLElement.');
        return false;
    }
    if (typeof youtubeUrl !== 'string' || !youtubeUrl) {
        console.error('renderVideoEmbed: Provided youtubeUrl is invalid.');
        return false;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
        console.error(`renderVideoEmbed: Could not extract video ID from URL: ${youtubeUrl}`);
        return false;
    }

    const embedUrl = getEmbedUrl(videoId);
    // The check for !embedUrl is redundant because if videoId is successfully extracted (and thus valid),
    // getEmbedUrl(videoId) is guaranteed to return a non-null string.

    element.innerHTML = ''; // Clear existing content

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', embedUrl);
    iframe.setAttribute('frameborder', '0');
    // Removed 'autoplay' from the allow attribute as per review feedback to prevent unexpected audio/data usage.
    iframe.setAttribute('allow', 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('title', `YouTube video player for ID: ${videoId}`);
    iframe.setAttribute('loading', 'lazy'); // Add lazy loading for better performance

    // Basic styling for responsiveness, assume container manages dimensions
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    element.appendChild(iframe);
    return true;
}

export { extractVideoId, getEmbedUrl, renderVideoEmbed };