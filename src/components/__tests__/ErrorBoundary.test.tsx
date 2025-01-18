import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock console.error to prevent noise in test output
const originalError = console.error;

beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    (console.error as jest.Mock).mockClear();
  });

  const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('renders error UI when error occurs', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders error UI with custom message', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorMessage = 'Custom error message';
    render(
      <ErrorBoundary message={errorMessage}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('supports error retry', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText(/Try again/i);
    fireEvent.click(retryButton);

    expect(onReset).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('cleans up properly when unmounted', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    unmount();
    
    expect(spy).toHaveBeenCalledTimes(1); // Only from the initial error
    spy.mockRestore();
  });
});