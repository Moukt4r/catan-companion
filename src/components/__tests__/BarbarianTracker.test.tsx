import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarbarianTracker, BarbarianTrackerRef } from '../BarbarianTracker';

// Mock Audio
beforeEach(() => {
  // Mock Audio and its play method
  (global as any).Audio = jest.fn().mockImplementation(() => ({
    play: jest.fn().mockResolvedValue(undefined),
  }));
});

jest.mock('lucide-react', () => ({
  Swords: () => <span data-testid="mock-swords-icon" />,
  Settings: () => <span data-testid="mock-settings-icon" />
}));

describe('BarbarianTracker', () => {
  it('renders initial state', () => {
    render(<BarbarianTracker />);
    expect(screen.getByText('Barbarian Progress')).toBeInTheDocument();
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-swords-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mock-settings-icon')).toBeInTheDocument();
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
    expect(screen.getByText('Knights: 0')).toBeInTheDocument(); // Knights reset after attack
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

  it('allows external control of threshold', () => {
    const { rerender } = render(<BarbarianTracker threshold={5} />);
    
    // Open settings to see threshold value
    fireEvent.click(screen.getByTitle('Configure threshold'));
    expect(screen.getByLabelText(/attack threshold/i)).toHaveValue(5);
    
    // Update controlled value
    rerender(<BarbarianTracker threshold={8} />);
    expect(screen.getByLabelText(/attack threshold/i)).toHaveValue(8);
  });

  it('handles audio play failures gracefully', () => {
    // Mock Audio.play to reject
    (global as any).Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn().mockRejectedValue(new Error('Audio playback failed')),
    }));

    render(<BarbarianTracker defaultThreshold={2} />);
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    // Should not throw when audio fails
    expect(() => {
      fireEvent.click(advanceButton);
      fireEvent.click(advanceButton);
    }).not.toThrow();

    // Attack should still happen
    expect(screen.getByText(/failed!/i)).toBeInTheDocument();
  });

  // New test for ref.advance function
  it('exposes advance function through ref', () => {
    const ref = React.createRef<BarbarianTrackerRef>();
    render(<BarbarianTracker ref={ref} defaultThreshold={7} />);
    
    const progressBar = screen.getByRole('progressbar');
    const initialValue = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
    
    // Use ref to advance progress
    ref.current?.advance();
    
    const newValue = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
    expect(newValue).toBeGreaterThan(initialValue);
  });

  // New test for invalid threshold input
  it('ignores invalid threshold values', () => {
    render(<BarbarianTracker defaultThreshold={7} />);
    
    // Open settings
    fireEvent.click(screen.getByTitle('Configure threshold'));
    const thresholdInput = screen.getByLabelText(/attack threshold/i);
    
    // Try setting an invalid value
    fireEvent.change(thresholdInput, { target: { value: 'invalid' } });
    
    // Threshold should remain unchanged
    expect(thresholdInput).toHaveValue(7);
  });
});
