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
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (!this.hasLogged) {
      console.error('Uncaught error:', error);
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
      this.hasLogged = true;
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined });
      this.hasLogged = false;
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // In error state, show error message
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
    this.hasLogged = false;
  }
}