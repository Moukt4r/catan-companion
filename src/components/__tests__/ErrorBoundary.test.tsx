import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Create components that will throw errors
const ThrowError = (): React.ReactElement => {
  throw new Error('Test error');
};

const ThrowErrorWithInfo = (): React.ReactElement => {
  throw new Error('Test error with info');
};

const ThrowErrorOnClick = (): React.ReactElement => {
  const handleClick = () => {
    throw new Error('Error on click');
  };
  return <button onClick={handleClick}>Trigger Error</button>;
};

describe('ErrorBoundary', () => {
  // Prevent console.error spam during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
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

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page and try again.')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorMessage = screen.getByText(/Error: Test error/);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage.parentElement).toHaveAttribute('class', expect.stringContaining('bg-gray-100'));

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('logs error information to console.error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('does not show error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Error: Test error/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('handles runtime errors from event handlers', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorOnClick />
      </ErrorBoundary>
    );

    const button = screen.getByText('Trigger Error');
    fireEvent.click(button);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('recovers when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <div>Working content</div>
      </ErrorBoundary>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('preserves error state when props change but key remains same', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Update props but keep same error-throwing child
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('resets error state when key changes', () => {
    const { rerender } = render(
      <ErrorBoundary key="1">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Render with new key
    rerender(
      <ErrorBoundary key="2">
        <div>Working content</div>
      </ErrorBoundary>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Working content')).toBeInTheDocument();
  });

  it('cleans up properly when unmounted', () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    unmount();
    
    // No memory leaks or errors on unmount
    expect(console.error).toHaveBeenCalledTimes(1); // Only from the initial error
  });
});
