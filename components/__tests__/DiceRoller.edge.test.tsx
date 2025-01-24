import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

describe('DiceRoller Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('handles all Promise-based roll timing', async () => {
    // Mock Promise/setTimeout
    jest.spyOn(global, 'Promise').mockImplementation((executor) => {
      return new Promise((resolve) => {
        executor(resolve);
        jest.advanceTimersByTime(600);
      });
    });

    render(<DiceRoller />);
    
    // Start roll
    const rollButton = screen.getByRole('button');
    fireEvent.click(rollButton);

    // Should show rolling state
    expect(rollButton).toBeDisabled();
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Wait for animation
    await act(async () => {
      await Promise.resolve();
    });

    // Should show results
    expect(rollButton).not.toBeDisabled();
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();
  });

  it('handles all discard count validation cases', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    // Test edge cases for the validation conditions
    [
      { value: 'abc', expected: 4 },     // NaN case
      { value: '-1', expected: 4 },      // < 0 case
      { value: '36', expected: 4 },      // > 35 case
      { value: '35', expected: 35 },     // Maximum boundary
      { value: '0', expected: 0 },       // Minimum boundary
      { value: '15', expected: 15 },     // Valid middle value
      { value: '', expected: 4 },        // Empty string
      { value: '3.14', expected: 4 }     // Float value
    ].forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expected);
    });
  });

  it('correctly shows/hides dice display based on roll state', async () => {
    render(<DiceRoller />);

    // Should not show display initially
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Roll dice
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Complete roll
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Should show display after roll
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();

    // Set current roll to null (internal state)
    const rollButton = screen.getByRole('button');
    await act(async () => {
      // @ts-ignore - Accessing private state for testing
      rollButton._reactProps.onClick();
    });

    // Should hide display during new roll
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();
  });
});