import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.useFakeTimers();

describe('DiceRoller Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles discard count validation in all branches', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    const testCases = [
      { value: 'abc', expected: 4 },     // NaN case
      { value: '-1', expected: 4 },      // < 0 case
      { value: '36', expected: 4 },      // >= 36 case
      { value: '35', expected: 35 },     // valid upper bound
      { value: '0', expected: 0 },       // valid lower bound
      { value: '20', expected: 20 }      // valid middle value
    ];

    testCases.forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expected);
    });
  });

  it('handles rolling dice with all states', async () => {
    render(<DiceRoller />);

    // Roll without displaying results
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();

    // Complete roll and show results
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();

    // Roll with special die
    const checkbox = screen.getByLabelText(/use cities & knights special die/i);
    fireEvent.click(checkbox);
    fireEvent.click(button);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Check rolling state transitions
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/rolling\.\.\./i);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/roll dice/i);
  });

  it('maintains correct statistics through edge cases', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button');
    
    // Roll multiple times with different discard counts
    for (const discardCount of [0, 35, 15]) {
      fireEvent.change(screen.getByLabelText(/discard count/i), {
        target: { value: String(discardCount) }
      });
      
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }
    
    const stats = screen.getByText(/total rolls:/i).parentElement;
    expect(stats).toHaveTextContent(/total rolls: 3/i);
    expect(stats).toHaveTextContent(/average roll:/i);
  });
});