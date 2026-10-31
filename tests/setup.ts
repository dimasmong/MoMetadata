import '@testing-library/jest-dom';

// Polyfill URL.createObjectURL and revokeObjectURL for jsdom environment
if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = (_blob: any) => `blob:mock-url-${Math.random()}`;
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }
}
