import '@testing-library/jest-dom';
import React from 'react';

// Mock Audio API
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    play: jest.fn().mockResolvedValue(undefined),
  })),
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.storage
Object.defineProperty(window.navigator, 'storage', {
  writable: true,
  value: {
    estimate: jest.fn().mockResolvedValue({ quota: 100000000, usage: 0 }),
  },
});