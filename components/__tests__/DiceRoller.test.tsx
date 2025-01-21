import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.mock('../../utils/diceRoller', () => {
  return {
    DiceRoller: jest.fn().mockImplementation(() => ({
      roll: jest.fn().mockReturnValue({ die1: 1, die2: 2, sum: 3, specialDie: null }),
      setDiscardCount: jest.fn(),
      setUseSpecialDie: jest.fn(),
      getRemainingRolls: jest.fn().mockReturnValue(32),
    })),
  };
});

describe('DiceRoller', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByText('Roll Dice')).toBeInTheDocument();
    expect(screen.getByLabelText(/Discard Count/i)).toHaveValue(4);
  });

  it('handles valid discard count changes', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    
    // Test minimum value
    act(() => {
      fireEvent.change(input, { target: { value: '0' } });
    });
    expect(input).toHaveValue(0);
    
    // Test maximum value
    act(() => {
      fireEvent.change(input, { target: { value: '35' } });
    });
    expect(input).toHaveValue(35);
    
    // Test middle value
    act(() => {
      fireEvent.change(input, { target: { value: '15' } });
    });
    expect(input).toHaveValue(15);
  });

  it('handles invalid discard count inputs', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    const initialValue = 4;
    
    // Test negative number
    act(() => {
      fireEvent.change(input, { target: { value: '-1' } });
    });
    expect(input).toHaveValue(initialValue);
    
    // Test above maximum
    act(() => {
      fireEvent.change(input, { target: { value: '36' } });
    });
    expect(input).toHaveValue(initialValue);
    
    // Test non-numeric input
    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    expect(input).toHaveValue(initialValue);
  });

  it('toggles special die', () => {
    render(<DiceRoller />);
    const toggle = screen.getByLabelText(/Use Cities & Knights special die/i);
    
    act(() => {
      fireEvent.click(toggle);
    });
    expect(toggle).toBeChecked();
    
    act(() => {
      fireEvent.click(toggle);
    });
    expect(toggle).not.toBeChecked();
  });

  it('shows loading state and proper button styling while rolling', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: 'Roll Dice' });

    // Initial state
    expect(button.className).not.toContain('opacity-50');
    expect(button.className).not.toContain('cursor-not-allowed');

    // Click to start rolling
    act(() => {
      fireEvent.click(button);
    });

    // During rolling
    expect(screen.getByRole('button')).toHaveTextContent('Rolling...');
    expect(button).toBeDisabled();
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');
    
    // Fast-forward animation timer
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // After rolling completes
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Roll Dice');
      expect(button).not.toBeDisabled();
      expect(button.className).not.toContain('opacity-50');
      expect(button.className).not.toContain('cursor-not-allowed');
    });
  });

  it('updates statistics after rolling', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: 'Roll Dice' });

    act(() => {
      fireEvent.click(button);
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText(/Total Rolls:/i)).toHaveTextContent('Total Rolls: 1');
      expect(screen.getByText(/Average Roll:/i)).toHaveTextContent('Average Roll: 3.0');
    });

    // Second roll
    act(() => {
      fireEvent.click(button);
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText(/Total Rolls:/i)).toHaveTextContent('Total Rolls: 2');
      expect(screen.getByText(/Average Roll:/i)).toHaveTextContent('Average Roll: 3.0');
    });
  });
});