// Shared client-side file checks used by FileField/SignaturePadField so every
// upload widget rejects the same way the server would (mime + size), instead
// of only complaining after a slow multipart upload finishes.

export function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.ceil(bytes / 1024)} KB`;
}

/**
 * @param {File} file
 * @param {{ accept?: string, maxSizeBytes?: number }} constraints
 * @returns {string|null} an error message, or null if the file is acceptable
 */
export function validateFile(file, { accept, maxSizeBytes } = {}) {
    if (!file) return null;

    if (maxSizeBytes && file.size > maxSizeBytes) {
        return `File must be smaller than ${formatBytes(maxSizeBytes)}.`;
    }

    if (accept) {
        const patterns = accept.split(",").map((p) => p.trim().toLowerCase());
        const name = file.name.toLowerCase();
        const type = (file.type || "").toLowerCase();

        const matches = patterns.some((pattern) => {
            if (pattern.startsWith(".")) return name.endsWith(pattern);
            if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
            return type === pattern;
        });

        if (!matches) {
            return `That file type is not accepted (expected ${accept}).`;
        }
    }

    return null;
}
