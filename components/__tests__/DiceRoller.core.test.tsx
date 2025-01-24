import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe('DiceRoller Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state without dice display', () => {
    render(<DiceRoller />);
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();
  });

  it('handles rolling state correctly', async () => {
    render(<DiceRoller />);
    
    fireEvent.click(screen.getByRole('button'));
    
    // During rolling
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/rolling\.\.\./i);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 600);
    
    // After roll completes
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    // Dice display should appear
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent(/roll dice/i);
  });

  it('handles multiple rolls with different states', async () => {
    render(<DiceRoller />);
    
    // First roll with default settings
    fireEvent.click(screen.getByRole('button'));
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    // Enable special die
    fireEvent.click(screen.getByLabelText(/use cities & knights special die/i));
    
    // Roll with special die
    fireEvent.click(screen.getByRole('button'));
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    // Change discard count
    fireEvent.change(screen.getByLabelText(/discard count/i), { target: { value: '10' } });
    
    // Roll with new discard count
    fireEvent.click(screen.getByRole('button'));
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
  });

  it('handles all discard count scenarios', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    // Test values with order to ensure branch coverage
    const testValues = [
      { value: '-1', expected: 4 },
      { value: '0', expected: 0 },
      { value: '35', expected: 35 },
      { value: '36', expected: 4 },
      { value: 'abc', expected: 4 },
      { value: '5.5', expected: 4 }
    ];
    
    testValues.forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expected);
    });
  });

  it('updates dice rolls and statistics correctly', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button');
    
    // Multiple rolls to test statistics
    const rolls = 5;
    for (let i = 0; i < rolls; i++) {
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }
    
    const statsDiv = screen.getByText(/total rolls:/i).parentElement;
    expect(statsDiv).toHaveTextContent(`Total Rolls: ${rolls}`);
    expect(statsDiv).toHaveTextContent('Average Roll:');
    expect(statsDiv).toHaveTextContent('Remaining Rolls:');
  });
});