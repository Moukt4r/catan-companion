import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  // Mock console.error before all tests
  const originalError = console.error;
  const originalOnError = window.onerror;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalConsoleError = console.error;

  beforeAll(() => {
    // Prevent Jest from failing on React errors
    console.error = jest.fn();
    window.onerror = jest.fn(() => true);
  });

  // Restore console.error after all tests
  afterAll(() => {
    console.error = originalError;
    window.onerror = originalOnError;
    process.env.NODE_ENV = originalNodeEnv;
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
    const { container } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    console.error = jest.fn(); // Silence React error boundary warning
    
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
    const { unmount } = render(
      <ErrorBoundary onError={onError}>
        <div>Test content</div>
      </ErrorBoundary>
    );

    // Mock error event that won't throw
    const error = new Error('Outside error');
    const errorEvent = new ErrorEvent('error', { 
      error,
      cancelable: true 
    });

    // Dispatch error event
    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);

    // Unmounting should prevent further error handling
    unmount();
    
    const anotherError = new Error('Another error');
    const anotherEvent = new ErrorEvent('error', { 
      error: anotherError,
      cancelable: true 
    });

    act(() => {
      window.dispatchEvent(anotherEvent);
    });
    
    // No additional error should be logged
    expect(onError).toHaveBeenCalledTimes(1);
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

  // New test for error handling without onError prop
  it('handles errors without onError prop', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
  });

  // New test for error details in development mode
  it('shows error details in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-details')).toBeInTheDocument();
    expect(screen.getByTestId('error-details')).toHaveTextContent('Test error');
  });

  // New test for error details in production mode
  it('hides error details in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
  });

  // Test error logging behavior
  it('only logs error once in various scenarios', () => {
    const onError = jest.fn();
    const { unmount } = render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // First error should be logged
    expect(onError).toHaveBeenCalledTimes(1);

    // Mock cancelable error event
    const error = new Error('Another error');
    const errorEvent = new ErrorEvent('error', { 
      error,
      cancelable: true 
    });

    // Additional error while in error state shouldn't log
    act(() => {
      window.dispatchEvent(errorEvent);
    });

    // No additional errors should be logged
    expect(onError).toHaveBeenCalledTimes(1);

    unmount();

    // Error after unmount shouldn't log
    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });
});