import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

describe('DiceRoller Focus Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('properly handles timer in roll animation', async () => {
    render(<DiceRoller />);

    // Track timer calls
    const timerSpy = jest.spyOn(window, 'setTimeout');

    // Click roll button
    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
    });

    // Check timer state
    expect(timerSpy).toHaveBeenCalledWith(expect.any(Function), 600);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Rolling...');

    // Advance timer
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Check post-animation state
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('Roll Dice');
  });

  it('handles all discard count input edge cases', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    const cases = [
      { value: '-1', expected: '4' },      // Below min
      { value: '0', expected: '0' },       // At min
      { value: '17', expected: '17' },     // Middle value
      { value: '35', expected: '35' },     // At max
      { value: '36', expected: '4' },      // Above max
      { value: 'abc', expected: '4' },     // NaN
      { value: '', expected: '4' }         // Empty
    ];

    cases.forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(parseInt(expected));
    });
  });

  it('shows/hides dice display correctly', async () => {
    const { container } = render(<DiceRoller />);

    // Initially no display
    const getDisplay = () => container.querySelector('.dice-display');
    expect(getDisplay()).not.toBeInTheDocument();

    // Roll and wait
    const button = screen.getByRole('button');
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(600);
    });

    // Display should show
    expect(getDisplay()).toBeInTheDocument();
  });
});