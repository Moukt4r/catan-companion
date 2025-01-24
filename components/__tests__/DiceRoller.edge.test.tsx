import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.useFakeTimers();

describe('DiceRoller Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles the full dice roll animation timing', async () => {
    render(<DiceRoller />);
    
    // Start roll
    const rollButton = screen.getByRole('button');
    fireEvent.click(rollButton);
    expect(rollButton).toBeDisabled();
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Fast-forward almost to completion
    await act(async () => {
      jest.advanceTimersByTime(599);
    });
    expect(rollButton).toBeDisabled();
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Complete the animation
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(rollButton).not.toBeDisabled();
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();
  });

  it('handles all discard count validation edge cases', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    const testCases = [
      { value: 'abc', expected: 4 },      // NaN case
      { value: '-1', expected: 4 },       // Below minimum
      { value: '36', expected: 4 },       // Above maximum
      { value: '35', expected: 35 },      // Maximum valid
      { value: '0', expected: 0 },        // Minimum valid
      { value: '5.5', expected: 4 },      // Invalid float
      { value: '20', expected: 20 }       // Valid middle value
    ];

    testCases.forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expected);
    });
  });

  it('verifies initial render without dice display', () => {
    render(<DiceRoller />);
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();
  });

  it('shows dice display after successful roll', async () => {
    render(<DiceRoller />);
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button'));
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();
  });
});