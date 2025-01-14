import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ErrorBoundary } from './components/ErrorBoundary';
// Import mocks
import './testUtils/mockComponents';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };