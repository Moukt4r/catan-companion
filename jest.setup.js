// Add DOM testing library matchers
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock CSS imports globally
jest.mock('styles/globals.css', () => ({}));

// Mock window object for localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true
});

// Mock Audio API
class MockAudio {
  play() {
    return Promise.resolve();
  }
}

Object.defineProperty(window, 'Audio', {
  writable: true,
  value: MockAudio
});