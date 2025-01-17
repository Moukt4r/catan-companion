import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarbarianTracker } from '../BarbarianTracker';

// Mock Audio
beforeEach(() => {
  // Mock Audio and its play method
  (global as any).Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn().mockResolvedValue(undefined),
  }));
});

describe('BarbarianTracker', () => {
  it('renders initial state', () => {
    render(<BarbarianTracker />);
    expect(screen.getByText('Barbarian Progress')).toBeInTheDocument();
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('increments knight count', () => {
    render(<BarbarianTracker />);
    const addKnightButton = screen.getByRole('button', { name: /add knight/i });
    fireEvent.click(addKnightButton);
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();
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

  it('triggers barbarian attack when progress reaches threshold', () => {
    render(<BarbarianTracker defaultThreshold={2} />);
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    // Advance twice to reach threshold
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    
    // Should show attack in history
    expect(screen.getByText(/failed!/i)).toBeInTheDocument();
    
    // Should reset progress and knights
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
  });

  it('shows successful defense with enough knights', () => {
    render(<BarbarianTracker defaultThreshold={2} />);
    const addKnightButton = screen.getByRole('button', { name: /add knight/i });
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    // Add 3 knights
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    fireEvent.click(addKnightButton);
    
    // Trigger attack
    fireEvent.click(advanceButton);
    fireEvent.click(advanceButton);
    
    expect(screen.getByText(/defended!/i)).toBeInTheDocument();
  });

  it('allows threshold configuration', () => {
    render(<BarbarianTracker defaultThreshold={7} />);
    
    // Open settings
    const settingsButton = screen.getByTitle('Configure threshold');
    fireEvent.click(settingsButton);
    
    // Change threshold
    const thresholdInput = screen.getByLabelText(/attack threshold/i);
    fireEvent.change(thresholdInput, { target: { value: '5' } });
    
    // Verify threshold changed
    expect(thresholdInput).toHaveValue(5);
  });
});