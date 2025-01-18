import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  private hasLogged: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined
    };
    // Wrap all event handlers in error boundary
    window.addEventListener('error', this.handleGlobalError);
  }

  private handleGlobalError = (event: ErrorEvent) => {
    if (!this.state.hasError) {
      event.preventDefault();
      this.setState({ 
        hasError: true, 
        error: event.error 
      });
      this.logError(event.error);
    }
  };

  private logError(error: Error) {
    if (!this.hasLogged) {
      console.error('Uncaught error:', error);
      if (this.props.onError) {
        this.props.onError(error, {
          componentStack: error.stack || ''
        });
      }
      this.hasLogged = true;
    }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.logError(error);
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined });
      this.hasLogged = false;
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div role="alert" className="p-8 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600">
              Please refresh the page and try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre 
                className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm"
                data-testid="error-details"
              >
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  public componentWillUnmount(): void {
    window.removeEventListener('error', this.handleGlobalError);
    this.hasLogged = false;
  }
}