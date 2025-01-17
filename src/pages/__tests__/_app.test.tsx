import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProps } from 'next/app';
import App from '../_app';

// Mock ErrorBoundary component
jest.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>
}));

describe('App', () => {
  const mockPageProps = {};
  const MockComponent = () => <div>Mock Page Content</div>;
  
  const mockAppProps: AppProps = {
    Component: MockComponent,
    pageProps: mockPageProps,
    router: {} as any,  // We're not testing router functionality here
  };

  it('renders the page component inside an error boundary', () => {
    render(<App {...mockAppProps} />);
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByText('Mock Page Content')).toBeInTheDocument();
  });

  it('applies the min-h-screen and background classes', () => {
    render(<App {...mockAppProps} />);
    
    const container = screen.getByText('Mock Page Content').parentElement;
    expect(container).toHaveClass('min-h-screen', 'bg-gray-100');
  });

  it('passes pageProps to the Component', () => {
    const MockComponentWithProps = jest.fn(() => <div>Content with Props</div>);
    const propsWithData = {
      ...mockAppProps,
      Component: MockComponentWithProps,
      pageProps: { testProp: 'test-value' }
    };

    render(<App {...propsWithData} />);
    
    expect(MockComponentWithProps).toHaveBeenCalledWith(
      { testProp: 'test-value' },
      expect.anything()
    );
  });
});