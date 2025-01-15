import React from 'react';
import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner with correct styles', () => {
    const { container } = render(<LoadingSpinner />);
    
    // Container has flex styles
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('flex', 'justify-center', 'items-center', 'p-4');

    // Spinner has animation and size styles
    const spinnerDiv = containerDiv.firstChild as HTMLElement;
    expect(spinnerDiv).toHaveClass(
      'animate-spin',  
      'rounded-full',
      'h-8',
      'w-8',
      'border-b-2',
      'border-blue-600'
    );
  });

  it('is visible and accessible', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeVisible();
  });
});