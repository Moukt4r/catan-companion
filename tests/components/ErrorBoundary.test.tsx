import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ message?: string }> = ({ message = 'Test error' }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const consoleError = console.error;

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    console.error = consoleError;
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error in production', () => {
    process.env.NODE_ENV = 'production';

    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText('Please refresh the page and try again.')).toBeInTheDocument();
    // Error details should not be visible in production
    expect(queryByText('Test error')).not.toBeInTheDocument();
  });

  it('renders error UI with error details in development', () => {
    process.env.NODE_ENV = 'development';
    const errorMessage = 'Custom test error message';

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError message={errorMessage} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText('Please refresh the page and try again.')).toBeInTheDocument();
    // Error details should be visible in development
    expect(getByText(new RegExp(errorMessage))).toBeInTheDocument();
  });

  it('calls componentDidCatch when an error occurs', () => {
    const spy = jest.spyOn(console, 'error');
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(spy).toHaveBeenCalled();
  });
});