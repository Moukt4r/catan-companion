import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

describe('DiceRoller Edge Cases', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('handles promise resolution in handleRoll', async () => {
    // Mock setTimeout to resolve immediately
    const mockSetTimeout = jest.spyOn(global, 'setTimeout');
    mockSetTimeout.mockImplementation((callback) => {
      callback();
      return 0 as any;
    });

    render(<DiceRoller />);

    // Initial state check
    const rollButton = screen.getByTestId('roll-button');
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Click roll button
    fireEvent.click(rollButton);
    expect(rollButton).toBeDisabled();

    // Wait for promise to resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Check state after roll
    expect(rollButton).not.toBeDisabled();
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();

    // Verify setTimeout was called with correct duration
    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 600);

    mockSetTimeout.mockRestore();
  });

  it('handles invalid discard count input', () => {
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count');

    // Test edge cases that should be rejected
    [
      { value: 'abc', expected: 4 },    // NaN
      { value: '-1', expected: 4 },     // Below min
      { value: '36', expected: 4 },     // Above max
      { value: '5.5', expected: 4 },    // Float
      { value: '', expected: 4 }        // Empty
    ].forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expected);
    });

    // Test edge cases that should be accepted
    [
      { value: '0', expected: 0 },      // Min
      { value: '35', expected: 35 },    // Max
      { value: '17', expected: 17 }     // Middle
    ].forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expected);
    });
  });

  it('handles dice display conditional rendering', async () => {
    jest.spyOn(global, 'Promise').mockImplementation((executor) => {
      return new Promise((resolve) => {
        executor(resolve);
      });
    });

    render(<DiceRoller />);
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Roll dice
    const rollButton = screen.getByTestId('roll-button');
    await act(async () => {
      fireEvent.click(rollButton);
      await Promise.resolve();
    });

    expect(screen.getByTestId('dice-display')).toBeInTheDocument();

    // Roll again to verify conditional
    await act(async () => {
      fireEvent.click(rollButton);
      await Promise.resolve();
    });

    expect(screen.getByTestId('dice-display')).toBeInTheDocument();
  });
});