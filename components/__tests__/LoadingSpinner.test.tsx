import React from 'react';
import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders a loading spinner with correct styles', () => {
    const { container } = render(<LoadingSpinner />);
    
    // Check container
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('flex', 'justify-center', 'items-center', 'p-4');

    // Check spinner element
    const spinnerDiv = containerDiv.firstChild as HTMLElement;
    expect(spinnerDiv).toHaveClass('animate-spin', 'rounded-full', 'h-8', 'w-8', 'border-b-2', 'border-blue-600');
  });

  it('is accessible', () => {
    const { container } = render(<LoadingSpinner />);
    
    // Check if spinner container is visible
    expect(container.firstChild).toBeVisible();
  });
});