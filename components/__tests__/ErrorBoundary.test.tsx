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
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    console.error = consoleError;
    process.env.NODE_ENV = 'test';
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
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page and try again.')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('renders error UI in production mode', () => {
    process.env.NODE_ENV = 'production';
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page and try again.')).toBeInTheDocument();
    expect(screen.queryByText(/Error: Test error/)).not.toBeInTheDocument();
  });

  it('calls componentDidCatch with error info', () => {
    const errorSpy = jest.spyOn(console, 'error');
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(errorSpy).toHaveBeenCalledWith(
      'Uncaught error:',
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('handles null error in development mode', () => {
    class NullErrorComponent extends React.Component {
      componentDidMount() {
        throw null;
      }
      render() {
        return <div>Should not render</div>;
      }
    }

    render(
      <ErrorBoundary>
        <NullErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Error: null')).not.toBeInTheDocument();
  });
});