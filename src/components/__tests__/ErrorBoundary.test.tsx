import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowError = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  // Mock console.error before all tests
  const originalError = console.error;
  const originalNodeEnv = process.env.NODE_ENV;
  let onErrorMock: jest.Mock;

  beforeAll(() => {
    console.error = jest.fn();
  });

  // Restore console.error after all tests
  afterAll(() => {
    console.error = originalError;
    process.env.NODE_ENV = originalNodeEnv;
  });

  // Clear mock before each test
  beforeEach(() => {
    onErrorMock = jest.fn();
    (console.error as jest.Mock).mockClear();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI in development mode', async () => {
    const message = 'Custom error message';
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError message={message} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please try again.')).toBeInTheDocument();
    expect(screen.getByTestId('error-details')).toHaveTextContent(message);
  });

  it('renders error UI in production mode', () => {
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please try again.')).toBeInTheDocument();
    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();
  });

  it('handles global window errors when mounted', () => {
    render(
      <ErrorBoundary onError={onErrorMock}>
        <div>Test content</div>
      </ErrorBoundary>
    );

    // Create a mock error object
    const error = new Error('Global error');
    
    // Simulate a global error
    const errorEvent = new ErrorEvent('error', {
      error,
      message: 'Global error'
    });
    Object.defineProperty(errorEvent, 'error', { value: error });

    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(onErrorMock).toHaveBeenCalled();
  });

  it('handles reset functionality', async () => {
    const onReset = jest.fn();
    const { rerender } = render(
      <ErrorBoundary onError={onErrorMock} onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>
    );

    const resetButton = screen.getByText('Try again');
    expect(resetButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(resetButton);
    });

    expect(onReset).toHaveBeenCalled();

    rerender(
      <ErrorBoundary onError={onErrorMock} onReset={onReset}>
        <div>Recovered content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
  });

  it('resets error state when children change', async () => {
    const { rerender } = render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    rerender(
      <ErrorBoundary onError={onErrorMock}>
        <div>New content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('New content')).toBeInTheDocument();
  });

  it('ignores errors after unmount', () => {
    const { unmount } = render(
      <ErrorBoundary onError={onErrorMock}>
        <div>Test content</div>
      </ErrorBoundary>
    );

    // First unmount the component
    unmount();

    // Create a mock error object
    const error = new Error('Post-unmount error');
    
    // Then simulate an error after unmount
    const errorEvent = new ErrorEvent('error', {
      error,
      message: 'Post-unmount error'
    });
    Object.defineProperty(errorEvent, 'error', { value: error });

    // Dispatch the error event
    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(onErrorMock).not.toHaveBeenCalled();
  });

  it('prevents default event behavior for global errors', () => {
    render(
      <ErrorBoundary onError={onErrorMock}>
        <div>Test content</div>
      </ErrorBoundary>
    );

    const preventDefault = jest.fn();
    const error = new Error('Global error');
    const errorEvent = new ErrorEvent('error', {
      error,
      message: 'Global error'
    });
    Object.defineProperty(errorEvent, 'preventDefault', {
      value: preventDefault
    });
    Object.defineProperty(errorEvent, 'error', { value: error });

    act(() => {
      window.dispatchEvent(errorEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });
});