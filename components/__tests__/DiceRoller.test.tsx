import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

describe('DiceRoller', () => {
  it('renders without crashing', () => {
    render(<DiceRoller />);
    expect(screen.getByText(/Roll Dice/i)).toBeInTheDocument();
  });

  it('shows dice values after rolling', () => {
    render(<DiceRoller />);
    fireEvent.click(screen.getByText(/Roll Dice/i));
    
    // Two dice should be visible
    const diceElements = screen.getAllByRole('generic').filter(el => {
      const styles = window.getComputedStyle(el);
      return styles.width === '64px' && styles.height === '64px';
    });
    expect(diceElements).toHaveLength(2);
    
    // Sum should be visible
    expect(screen.getByText(/Sum:/i)).toBeInTheDocument();
  });

  it('allows changing discard count', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    
    fireEvent.change(input, { target: { value: '6' } });
    expect(input).toHaveValue(6);
  });

  it('shows remaining rolls', () => {
    render(<DiceRoller />);
    fireEvent.click(screen.getByText(/Roll Dice/i));
    expect(screen.getByText(/Remaining rolls:/i)).toBeInTheDocument();
  });

  it('prevents invalid discard counts', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).not.toHaveValue(-1);
    
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).not.toHaveValue(36);
  });
});