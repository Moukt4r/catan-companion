import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

afterEach(() => {
  jest.clearAllMocks();
});

// Components for testing
const ThrowError = () => {
  throw new Error('Test error');
};

const ThrowErrorOnClick = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  
  if (shouldThrow) {
    throw new Error('Error on click');
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Trigger Error
    </button>
  );
};

const ThrowErrorWithInfo = () => {
  throw new Error('Test error with info');
};

const ComponentWithKey = ({ id }: { id: number }) => {
  return <div>Component {id}</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
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

    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    expect(screen.getByTestId('error-details')).toBeInTheDocument();

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

    expect(screen.queryByTestId('error-details')).not.toBeInTheDocument();

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

  it('recovers from error when children change', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Rerender with new child
    rerender(
      <ErrorBoundary>
        <div>New Content</div>
      </ErrorBoundary>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('New Content')).toBeInTheDocument();
  });

  it('handles errors with componentStack information', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <div>
          <ThrowErrorWithInfo />
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-details')).toHaveTextContent(/in ThrowErrorWithInfo/);

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('preserves error state when props change but key remains same', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ComponentWithKey id={1} />
      </ErrorBoundary>
    );

    // Force an error
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Update props but keep same key
    rerender(
      <ErrorBoundary>
        <ComponentWithKey id={2} />
      </ErrorBoundary>
    );

    // Error UI should still be shown
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onError prop when an error occurs', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('handles multiple errors in succession', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledTimes(1);

    // Cause another error
    rerender(
      <ErrorBoundary>
        <ThrowErrorWithInfo />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledTimes(2);
  });
});