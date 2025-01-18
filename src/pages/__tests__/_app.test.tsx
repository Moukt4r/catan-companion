import React from 'react';
import { render } from '@testing-library/react';
import App from '../_app';

// Mock next/app
jest.mock('next/app', () => ({
  __esModule: true,
  default: ({ Component, pageProps }: any) => <Component {...pageProps} />
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
});