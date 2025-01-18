import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  const originalError = console.error;
  const spy = jest.fn();

  beforeAll(() => {
    console.error = spy;
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    spy.mockClear();
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
    expect(spy).not.toHaveBeenCalled();
  });

  it('renders error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('renders error UI with custom message', () => {
    const errorMessage = 'Custom error message';
    render(
      <ErrorBoundary message={errorMessage}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { level: 2, name: errorMessage })).toBeInTheDocument();
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

  it('cleans up properly when unmounted', () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );

    unmount();
    
    // The error should be logged only once during the initial render
    expect(spy).toHaveBeenCalledTimes(1);
  });
});