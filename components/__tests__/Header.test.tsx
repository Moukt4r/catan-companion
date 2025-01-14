import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

describe('Header', () => {
  it('renders the default title', () => {
    render(<Header />);
    const title = screen.getByText('Catan Companion');
    expect(title).toBeInTheDocument();
  });

  it('renders a custom title when provided', () => {
    render(<Header title="Custom Title" />);
    const title = screen.getByText('Custom Title');
    expect(title).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(<Header className="custom-class" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-class');
  });
});