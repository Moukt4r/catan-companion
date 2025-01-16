import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BarbarianTracker } from '../BarbarianTracker';
import '@testing-library/jest-dom';

describe('BarbarianTracker', () => {
  it('renders initial state', () => {
    render(<BarbarianTracker />);
    expect(screen.getByText('Barbarian Progress')).toBeInTheDocument();
    expect(screen.getByText('Knights: 0')).toBeInTheDocument();
  });

  it('advances progress when clicking advance button', () => {
    render(<BarbarianTracker defaultThreshold={7} />);
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    act(() => {
      fireEvent.click(advanceButton);
    });
    
    // Progress bar should be about 14% (1/7)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '14.29%' });
  });

  it('adds knights when clicking add knight button', () => {
    render(<BarbarianTracker />);
    const addKnightButton = screen.getByRole('button', { name: /add knight/i });
    
    act(() => {
      fireEvent.click(addKnightButton);
    });
    
    expect(screen.getByText('Knights: 1')).toBeInTheDocument();
  });

  it('shows settings panel when clicking settings button', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByRole('button', { name: /configure threshold/i });
    
    act(() => {
      fireEvent.click(settingsButton);
    });
    
    expect(screen.getByRole('spinbutton', { name: /attack threshold/i })).toBeInTheDocument();
  });

  it('updates threshold via settings', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByRole('button', { name: /configure threshold/i });
    
    act(() => {
      fireEvent.click(settingsButton);
    });
    
    const thresholdInput = screen.getByRole('spinbutton', { name: /attack threshold/i });
    act(() => {
      fireEvent.change(thresholdInput, { target: { value: '10' } });
    });
    
    expect(thresholdInput).toHaveValue(10);
  });

  it('ignores invalid threshold inputs', () => {
    render(<BarbarianTracker />);
    const settingsButton = screen.getByRole('button', { name: /configure threshold/i });
    
    act(() => {
      fireEvent.click(settingsButton);
    });
    
    const thresholdInput = screen.getByRole('spinbutton', { name: /attack threshold/i });
    
    act(() => {
      fireEvent.change(thresholdInput, { target: { value: '-5' } });
    });
    expect(thresholdInput).toHaveValue(7); // Default value
    
    act(() => {
      fireEvent.change(thresholdInput, { target: { value: '21' } });
    });
    expect(thresholdInput).toHaveValue(7); // Default value
  });

  it('allows controlling via ref', () => {
    const ref = React.createRef<{ advance: () => void }>();
    render(<BarbarianTracker ref={ref} defaultThreshold={5} />);
    
    act(() => {
      ref.current?.advance();
    });
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '20%' });
  });

  it('maintains attack history', () => {
    render(<BarbarianTracker />);
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    const addKnightButton = screen.getByRole('button', { name: /add knight/i });
    
    // Add a knight and trigger an attack
    act(() => {
      fireEvent.click(addKnightButton);
      // Move to threshold
      for (let i = 0; i < 7; i++) {
        fireEvent.click(advanceButton);
      }
    });
    
    // Should show attack history
    expect(screen.getByText(/Last Attack/i)).toBeInTheDocument();
  });

  it('displays progress bar correctly at max value', () => {
    render(<BarbarianTracker defaultThreshold={3} />);
    const advanceButton = screen.getByRole('button', { name: /advance/i });
    
    act(() => {
      fireEvent.click(advanceButton);
      fireEvent.click(advanceButton);
    });
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '66.67%' });
  });
});