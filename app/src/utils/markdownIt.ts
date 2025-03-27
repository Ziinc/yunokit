
// A simple wrapper for markdown-it to make it available globally
import markdownit from 'markdown-it';

// Add markdown-it to the window object
declare global {
  interface Window {
    markdownit: typeof markdownit;
  }
}

// Initialize markdown-it
window.markdownit = markdownit;

// Export for direct import if needed
export default markdownit;
