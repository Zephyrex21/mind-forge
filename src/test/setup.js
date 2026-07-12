import '@testing-library/jest-dom';

// jsdom doesn't implement matchMedia — every real browser does. ThemeProvider
// checks system dark-mode preference on mount, so components that render
// inside it need this mocked in the test environment.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

