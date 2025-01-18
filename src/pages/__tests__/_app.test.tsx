import React from 'react';
import { render } from '@testing-library/react';
import App from '../_app';

// Mock CSS module
jest.mock('@/styles/globals.css', () => ({}));

// Mock ErrorBoundary component
jest.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('App', () => {
  it('renders without crashing', () => {
    const Component = () => <div>Test</div>;
    const pageProps = { test: true };

    const { container } = render(
      <App Component={Component} pageProps={pageProps} />
    );

    // Check that Component renders
    expect(container).toHaveTextContent('Test');
    
    // Check that min-h-screen class is applied
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('bg-gray-100');
  });

  it('passes props correctly to Component', () => {
    const mockProps = { testProp: 'value' };
    const Component = (props: any) => <div data-testid="component">{JSON.stringify(props)}</div>;

    const { getByTestId } = render(
      <App Component={Component} pageProps={mockProps} />
    );

    // Verify props are passed through
    expect(getByTestId('component')).toHaveTextContent(JSON.stringify(mockProps));
  });

  it('maintains component hierarchy', () => {
    const Component = () => <div>Child Component</div>;
    const { container } = render(
      <App Component={Component} pageProps={{}} />
    );

    // Check that the component is wrapped in a div with the correct classes
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.tagName).toBe('DIV');
    expect(outerDiv.classList.contains('min-h-screen')).toBe(true);
    expect(outerDiv.classList.contains('bg-gray-100')).toBe(true);
    expect(outerDiv).toHaveTextContent('Child Component');
  });
});