import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarbarianTracker } from '../../components/BarbarianTracker';

describe('BarbarianTracker', () => {
  it('renders initial state', () => {
    render(<BarbarianTracker />);
    expect(screen.getByText('Barbarian Progress')).toBeInTheDocument();
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });

  it('increments knight count', () => {
    render(<BarbarianTracker />);
    const incrementButton = screen.getByRole('button', { name: /add knight/i });
    fireEvent.click(incrementButton);
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();
  });

  it('decrements knight count', () => {
    render(<BarbarianTracker />);
    const incrementButton = screen.getByRole('button', { name: /add knight/i });
    const decrementButton = screen.getByRole('button', { name: /remove knight/i });
    
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(decrementButton);
    
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();
  });

  it('prevents negative knight count', () => {
    render(<BarbarianTracker />);
    const decrementButton = screen.getByRole('button', { name: /remove knight/i });
    fireEvent.click(decrementButton);
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });

  it('advances barbarian progress', () => {
    render(<BarbarianTracker />);
    const progressBar = screen.getByRole('progressbar');
    const initialValue = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
    
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    fireEvent.click(advanceButton);
    
    const newValue = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
    expect(newValue).toBeGreaterThan(initialValue);
  });
});
