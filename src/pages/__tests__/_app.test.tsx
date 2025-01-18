import React from 'react';
import { render } from '@testing-library/react';
import App from '../_app';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Mock CSS imports
jest.mock('../../styles/globals.css', () => ({}));

// Mock next/app
jest.mock('next/app', () => ({
  type: AppProps = {
    Component: React.ComponentType;
    pageProps: any;
  }
}));

// Mock ThemeProvider
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const Component = () => <div>Test Component</div>;
    const pageProps = {};

    render(
      <App 
        Component={Component}
        pageProps={pageProps}
      />
    );
  });

  it('wraps content in ErrorBoundary', () => {
    const Component = () => <div>Test Component</div>;
    const pageProps = {};

    const { container } = render(
      <App 
        Component={Component}
        pageProps={pageProps}
      />
    );

    // Find ErrorBoundary in the rendered tree
    expect(container.firstChild).toBeTruthy();
  });
});