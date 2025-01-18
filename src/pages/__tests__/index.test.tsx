import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../index';

// Mock components
jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid="mock-header">Header Component</div>
}));

jest.mock('@/components/DiceRoller', () => ({
  DiceRoller: () => <div data-testid="mock-dice-roller">Dice Roller Component</div>
}));

describe('Home', () => {
  it('renders the header component', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('renders the dice roller component', () => {
    render(<Home />);
    expect(screen.getByTestId('mock-dice-roller')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    render(<Home />);
    expect(screen.getByText('Roll the Dice')).toBeInTheDocument();
  });

  it('applies container classes for responsive layout', () => {
    render(<Home />);
    expect(screen.getByRole('main').querySelector('.container')).toHaveClass(
      'mx-auto',
      'p-4'
    );
  });

  it('centers dice roller content with max width', () => {
    render(<Home />);
    const container = screen.getByTestId('mock-dice-roller').parentElement;
    expect(container).toHaveClass('max-w-md', 'mx-auto');
  });

  it('applies proper spacing to title', () => {
    render(<Home />);
    const title = screen.getByText('Roll the Dice');
    expect(title).toHaveClass('text-xl', 'mb-4');
  });

  it('renders all components in correct order', () => {
    render(<Home />);
    const main = screen.getByRole('main');
    const children = Array.from(main.children);
    
    expect(children[0]).toHaveAttribute('data-testid', 'mock-header');
    expect(children[1]).toHaveClass('container');
  });
});