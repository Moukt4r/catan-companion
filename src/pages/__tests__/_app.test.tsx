import React from 'react';
import { render } from '@testing-library/react';
import App from '../_app';

// Mock CSS imports
jest.mock('@/styles/globals.css', () => ({}));

// Mock ErrorBoundary component
jest.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('App', () => {
  it('renders without crashing', () => {
    const Component = () => <div>Test</div>;
    const pageProps = { test: true };

    const { getByText } = render(
      <App Component={Component} pageProps={pageProps} />
    );

    expect(getByText('Test')).toBeInTheDocument();
  });

  it('passes props to Component', () => {
    const Component = (props: any) => <div>Props: {JSON.stringify(props)}</div>;
    const pageProps = { testProp: 'test-value' };

    const { getByText } = render(
      <App Component={Component} pageProps={pageProps} />
    );

    expect(getByText('Props: {"testProp":"test-value"}')).toBeInTheDocument();
  });

  it('wraps Component in a styled container', () => {
    const Component = () => <div>Test</div>;
    const pageProps = {};

    const { container } = render(
      <App Component={Component} pageProps={pageProps} />
    );

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.className).toContain('min-h-screen');
    expect(mainContainer.className).toContain('bg-gray-100');
  });
});