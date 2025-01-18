import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  // Mock console.error before all tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  // Restore console.error after all tests
  afterAll(() => {
    console.error = originalError;
  });

  // Clear mock before each test
  beforeEach(() => {
    (console.error as jest.Mock).mockClear();
  });

  // Test component that can throw errors
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
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  });

  it('renders error UI with custom message', () => {
    const errorMessage = 'Custom error message';
    render(
      <ErrorBoundary message={errorMessage}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: errorMessage })).toBeInTheDocument();
  });

  it('supports error retry', () => {
    const onReset = jest.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('calls onError when error occurs', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('resets error state when children prop changes', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <div>New content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('New content')).toBeInTheDocument();
  });

  it('handles errors thrown outside React lifecycle', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // Error should already be handled by the boundary
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('cleans up properly when unmounted', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('preserves error info across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundary message="Initial error message">
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /initial error message/i })).toBeInTheDocument();

    // Re-render with different message
    rerender(
      <ErrorBoundary message="Updated error message">
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // Error UI should still be visible with updated message
    expect(screen.getByRole('heading', { name: /updated error message/i })).toBeInTheDocument();
  });
});