import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../_app';

// Mock the ErrorBoundary component
jest.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  )
}));

// Mock the CSS import
jest.mock('@/styles/globals.css', () => ({}));

describe('App', () => {
  const mockComponent = () => <div>Test Content</div>;
  const mockPageProps = { testProp: 'test-value' };

  it('renders without crashing', () => {
    render(<App Component={mockComponent} pageProps={mockPageProps} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wraps content in ErrorBoundary', () => {
    render(<App Component={mockComponent} pageProps={mockPageProps} />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('applies layout classes', () => {
    const { container } = render(
      <App Component={mockComponent} pageProps={mockPageProps} />
    );
    const layoutDiv = container.querySelector('div.min-h-screen.bg-gray-100');
    expect(layoutDiv).toBeInTheDocument();
  });

  it('passes pageProps to Component', () => {
    const TestComponent = (props: any) => (
      <div>Props: {JSON.stringify(props)}</div>
    );
    render(<App Component={TestComponent} pageProps={mockPageProps} />);
    expect(screen.getByText('Props: {"testProp":"test-value"}')).toBeInTheDocument();
  });

  it('handles empty pageProps', () => {
    render(<App Component={mockComponent} pageProps={{}} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles undefined pageProps', () => {
    // @ts-ignore - Testing with undefined pageProps
    render(<App Component={mockComponent} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles complex Components', () => {
    const ComplexComponent = ({ children, className }: any) => (
      <div className={className}>
        <header>Header</header>
        {children}
        <footer>Footer</footer>
      </div>
    );

    render(
      <App
        Component={ComplexComponent}
        pageProps={{
          children: <div>Content</div>,
          className: 'test-class',
        }}
      />
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});