import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  // Mock console.error before all tests
  const originalError = console.error;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // Prevent Jest from failing on React errors
    console.error = jest.fn();
  });

  // Restore console.error after all tests
  afterAll(() => {
    console.error = originalError;
    process.env.NODE_ENV = originalNodeEnv;
  });

  // Clear mock before each test
  beforeEach(() => {
    (console.error as jest.Mock).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Test component that can throw errors
  const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  // Helper to get instance access
  const getErrorBoundaryInstance = (): Promise<ErrorBoundary> => {
    return new Promise((resolve) => {
      render(
        <ErrorBoundary 
          ref={(ref: ErrorBoundary) => { 
            if (ref) resolve(ref);
          }}
        >
          <div>Test content</div>
        </ErrorBoundary>
      );
    });
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

  it('handles errors thrown outside React lifecycle', async () => {
    const onError = jest.fn();
    let boundary: ErrorBoundary | null = null;

    render(
      <ErrorBoundary 
        ref={(ref: ErrorBoundary) => { boundary = ref; }}
        onError={onError}
      >
        <div>Test content</div>
      </ErrorBoundary>
    );

    // Wait for ref to be set
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(boundary).not.toBeNull();
    
    // Trigger handleGlobalError directly
    act(() => {
      (boundary as any).handleGlobalError({ preventDefault: () => {}, error: new Error('Outside error') });
    });

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);

    // Additional error while in error state shouldn't trigger onError again
    act(() => {
      (boundary as any).handleGlobalError({ preventDefault: () => {}, error: new Error('Another error') });
    });
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

    rerender(
      <ErrorBoundary message="Updated error message">
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /updated error message/i })).toBeInTheDocument();
  });

  it('handles errors without onError prop', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
  });

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

  it('hides error details in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
  });

  it('only logs error once in various scenarios', async () => {
    const onError = jest.fn();
    let boundary: ErrorBoundary | null = null;

    render(
      <ErrorBoundary 
        ref={(ref: ErrorBoundary) => { boundary = ref; }}
        onError={onError}
      >
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    // First error should be logged
    expect(onError).toHaveBeenCalledTimes(1);

    // Wait for ref to be set
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Additional error while in error state shouldn't log
    act(() => {
      (boundary as any).handleGlobalError({ preventDefault: () => {}, error: new Error('Another error') });
    });
    expect(onError).toHaveBeenCalledTimes(1);

    // Reset error state
    act(() => {
      (boundary as any).handleReset();
    });

    // New error after reset should log
    act(() => {
      (boundary as any).handleGlobalError({ preventDefault: () => {}, error: new Error('Yet another error') });
    });
    expect(onError).toHaveBeenCalledTimes(2);
  });
});