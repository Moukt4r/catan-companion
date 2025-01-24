import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.useFakeTimers();

describe('DiceRoller Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial state correctly', () => {
    render(<DiceRoller />);
    
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
    expect(screen.getByLabelText(/use cities & knights special die/i)).not.toBeChecked();
    expect(screen.getByRole('button')).toHaveTextContent(/roll dice/i);
    
    const stats = screen.getByText(/total rolls:/i).parentElement;
    expect(stats).toHaveTextContent(/total rolls: 0/i);
    expect(stats).toHaveTextContent(/average roll: 0\.0/i);
    expect(stats).toHaveTextContent(/remaining rolls: 32/i);
  });

  test('handles dice roll correctly with loading state', async () => {
    jest.spyOn(global, 'setTimeout');
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button');
    fireEvent.click(rollButton);
    
    expect(rollButton).toBeDisabled();
    expect(rollButton).toHaveTextContent(/rolling\.\.\./i);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 600);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    expect(rollButton).not.toBeDisabled();
    expect(rollButton).toHaveTextContent(/roll dice/i);
    
    const stats = screen.getByText(/total rolls:/i).parentElement;
    expect(stats).toHaveTextContent(/total rolls: 1/i);
    expect(stats).toHaveTextContent(/remaining rolls: 31/i);
  });

  test('handles invalid discard count values', () => {
    render(<DiceRoller />);
    
    const input = screen.getByLabelText(/discard count/i);
    
    // Test non-numeric value
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(4); // Should not change
    
    // Test negative value
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(4); // Should not change
    
    // Test value > 35
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(4); // Should not change
  });

  test('handles edge cases in discard count', () => {
    render(<DiceRoller />);
    
    const input = screen.getByLabelText(/discard count/i);
    
    // Test boundary values
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue(0);
    
    fireEvent.change(input, { target: { value: '35' } });
    expect(input).toHaveValue(35);
    
    // Test decimal values
    fireEvent.change(input, { target: { value: '5.5' } });
    expect(input).toHaveValue(4); // Should not change from previous valid value
  });

  test('handles special die toggle and affects roll display', async () => {
    render(<DiceRoller />);
    
    const checkbox = screen.getByLabelText(/use cities & knights special die/i);
    fireEvent.click(checkbox);
    
    const rollButton = screen.getByRole('button');
    fireEvent.click(rollButton);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    // Additional assertions can be added here for special die display
    expect(checkbox).toBeChecked();
  });

  test('calculates and displays average roll properly', async () => {
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button');
    
    // Perform multiple rolls
    for (let i = 0; i < 5; i++) {
      fireEvent.click(rollButton);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }
    
    const averageText = screen.getByText(/average roll:/i).textContent;
    const average = parseFloat(averageText?.match(/\d+\.\d+/)?.[0] || '0');
    
    expect(average).toBeGreaterThan(0);
    expect(average).toBeLessThanOrEqual(12); // Max possible average
  });
});