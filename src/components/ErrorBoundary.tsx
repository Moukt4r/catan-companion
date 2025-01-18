import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  message?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  private hasLogged: boolean = false;
  private mounted: boolean = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined
    };
    window.addEventListener('error', this.handleGlobalError);
  }

  private handleGlobalError = (event: ErrorEvent) => {
    if (!this.state.hasError && this.mounted) {
      event.preventDefault();
      this.setState({ 
        hasError: true, 
        error: event.error 
      });
      this.logError(event.error);
    }
  };

  private logError(error: Error) {
    if (!this.hasLogged && this.mounted) {
      if (this.props.onError) {
        this.props.onError(error, {
          componentStack: error.stack || ''
        });
      }
      this.hasLogged = true;
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.hasLogged = false;
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidMount(): void {
    this.mounted = true;
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.mounted) {
      this.logError(error);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined });
      this.hasLogged = false;
    }
  }

  public componentWillUnmount(): void {
    this.mounted = false;
    window.removeEventListener('error', this.handleGlobalError);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div role="alert" className="p-8 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {this.props.message || 'Something went wrong'}
            </h2>
            <p className="text-gray-600">
              Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre 
                className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm"
                data-testid="error-details"
              >
                {this.state.error.toString()}
              </pre>
            )}
            {this.props.onReset && (
              <button
                onClick={this.handleReset}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}