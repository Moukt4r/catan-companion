// Add testing-library jest-dom matchers
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: 'img',
}));

// Mock console.warn to reduce noise in tests
global.console.warn = jest.fn();

// Add window.URL.createObjectURL mock
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn();
}

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;
