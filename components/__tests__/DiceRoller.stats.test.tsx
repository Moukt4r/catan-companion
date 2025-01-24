import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.useFakeTimers();

describe('DiceRoller Statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('tracks total rolls correctly', async () => {
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button');
    
    // Roll multiple times
    for (let i = 0; i < 5; i++) {
      fireEvent.click(rollButton);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }
    
    expect(screen.getByText(/total rolls: 5/i)).toBeInTheDocument();
  });

  test('tracks remaining rolls with discard count changes', () => {
    render(<DiceRoller />);
    
    const input = screen.getByLabelText(/discard count/i);
    const remainingRolls = () => screen.getByText(/remaining rolls:/i).textContent?.match(/\d+/)?.[0];
    
    // Default discard count (4) = 36 - 4 = 32 remaining rolls
    expect(remainingRolls()).toBe('32');
    
    // Change discard count to 10 = 36 - 10 = 26 remaining rolls
    fireEvent.change(input, { target: { value: '10' } });
    expect(remainingRolls()).toBe('26');
    
    // Change discard count to 0 = 36 - 0 = 36 remaining rolls
    fireEvent.change(input, { target: { value: '0' } });
    expect(remainingRolls()).toBe('36');
  });

  test('updates average roll after multiple rolls', async () => {
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button');
    const getAverage = () => {
      const text = screen.getByText(/average roll:/i).textContent;
      return parseFloat(text?.match(/\d+\.\d+/)?.[0] || '0');
    };
    
    // Initial average should be 0
    expect(getAverage()).toBe(0);
    
    // Roll multiple times
    for (let i = 0; i < 3; i++) {
      fireEvent.click(rollButton);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }
    
    // Average should be updated and be a number between 2 and 12
    const avg = getAverage();
    expect(avg).toBeGreaterThanOrEqual(2);
    expect(avg).toBeLessThanOrEqual(12);
  });

  test('handles special die statistics', async () => {
    render(<DiceRoller />);
    
    // Enable special die
    const checkbox = screen.getByLabelText(/use cities & knights special die/i);
    fireEvent.click(checkbox);
    
    const rollButton = screen.getByRole('button');
    
    // Roll and verify display updates
    fireEvent.click(rollButton);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    expect(screen.getByText(/total rolls: 1/i)).toBeInTheDocument();
    
    // Remaining rolls should still be decremented
    expect(screen.getByText(/remaining rolls: 31/i)).toBeInTheDocument();
  });
});