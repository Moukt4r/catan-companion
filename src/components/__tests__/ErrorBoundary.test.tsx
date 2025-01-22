import React, { ErrorInfo } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import '@testing-library/jest-dom';

const ThrowError = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  const originalEnv = process.env.NODE_ENV;
  const onErrorMock = jest.fn();
  const onResetMock = jest.fn();
  const originalConsoleError = console.error;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  beforeAll(() => {
    console.error = jest.fn();
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI in development mode', () => {
    process.env.NODE_ENV = 'development';
    
    const { container } = render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByTestId('error-details')).toHaveTextContent('Custom error message');
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('renders error UI in production mode', () => {
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary message="Custom error UI">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.getByText('Please try again.')).toBeInTheDocument();
    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
  });

  it('handles global window errors when mounted', () => {
    const { unmount } = render(
      <ErrorBoundary onError={onErrorMock}>
        <div>Content</div>
      </ErrorBoundary>
    );

    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));

    // Simulate a global error
    const errorEvent = new ErrorEvent('error', {
      error: new Error('Global error'),
      message: 'Global error'
    });
    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(onErrorMock).toHaveBeenCalled();

    // Should not log error again for same error
    onErrorMock.mockClear();
    act(() => {
      window.dispatchEvent(errorEvent);
    });
    expect(onErrorMock).not.toHaveBeenCalled();

    // Unmount should remove listener
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('handles reset functionality', () => {
    render(
      <ErrorBoundary onReset={onResetMock}>
        <ThrowError />
      </ErrorBoundary>
    );

    const resetButton = screen.getByText('Try again');
    fireEvent.click(resetButton);

    expect(onResetMock).toHaveBeenCalled();
  });

  it('resets error state when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <div>New content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('New content')).toBeInTheDocument();
  });

  it('ignores errors after unmount', () => {
    const { unmount } = render(
      <ErrorBoundary onError={onErrorMock}>
        <div>Content</div>
      </ErrorBoundary>
    );

    unmount();

    const errorEvent = new ErrorEvent('error', {
      error: new Error('Post-unmount error'),
      message: 'Post-unmount error'
    });

    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(onErrorMock).not.toHaveBeenCalled();
  });

  it('prevents default event behavior for global errors', () => {
    render(
      <ErrorBoundary onError={onErrorMock}>
        <div>Content</div>
      </ErrorBoundary>
    );

    const preventDefault = jest.fn();
    const errorEvent = new ErrorEvent('error', {
      error: new Error('Global error'),
      message: 'Global error'
    });
    Object.defineProperty(errorEvent, 'preventDefault', {
      value: preventDefault
    });

    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });
});