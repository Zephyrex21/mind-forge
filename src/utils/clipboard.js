/**
 * Clipboard utility for copying markdown content.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Trigger a download of a text file in the browser.
 * @param {string} content - File content
 * @param {string} filename - Name of the downloaded file
 * @param {string} mimeType - MIME type (default: text/markdown)
 */
export function downloadFile(content, filename = 'README.md', mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
