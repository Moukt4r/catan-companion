import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.useFakeTimers();

describe('DiceRoller Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial state correctly without dice display', () => {
    render(<DiceRoller />);
    
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
    expect(screen.getByLabelText(/use cities & knights special die/i)).not.toBeChecked();
    expect(screen.getByRole('button')).toHaveTextContent(/roll dice/i);
    
    // Verify no dice display initially
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();
  });

  test('handles dice roll with promise resolution', async () => {
    const mockResolve = jest.fn();
    jest.spyOn(global, 'Promise').mockImplementationOnce((executor) => {
      return new Promise((resolve) => {
        executor(resolve);
        mockResolve();
      });
    });

    render(<DiceRoller />);
    const rollButton = screen.getByRole('button');
    fireEvent.click(rollButton);
    
    expect(mockResolve).toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
  });

  test('handles all discard count boundary conditions', () => {
    render(<DiceRoller />);
    
    const input = screen.getByLabelText(/discard count/i);
    const testValue = (value: string, expectedValue: number) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expectedValue);
    };

    // Test values just around all boundaries
    testValue('-1', 4); // Below minimum
    testValue('0', 0); // Minimum boundary
    testValue('1', 1); // Just above minimum
    testValue('34', 34); // Just below maximum
    testValue('35', 35); // Maximum boundary
    testValue('36', 4); // Above maximum
    testValue('abc', 4); // Non-numeric
    testValue('5.5', 4); // Decimal
  });

  test('handles special die toggle with full rendering', async () => {
    render(<DiceRoller />);
    
    // Enable special die and roll
    const checkbox = screen.getByLabelText(/use cities & knights special die/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    // Roll dice
    const rollButton = screen.getByRole('button');
    fireEvent.click(rollButton);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Verify dice display appears
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();
    
    // Disable special die
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});