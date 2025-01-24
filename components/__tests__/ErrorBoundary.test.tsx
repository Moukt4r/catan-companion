import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ErrorComponent = () => {
  throw new Error('Test error');
};

const consoleError = console.error;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page and try again.')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('renders error UI in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page and try again.')).toBeInTheDocument();
    expect(screen.queryByText(/Error: Test error/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('calls componentDidCatch when error occurs', () => {
    const spy = jest.spyOn(console, 'error');
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toBe('Uncaught error:');
  });
});