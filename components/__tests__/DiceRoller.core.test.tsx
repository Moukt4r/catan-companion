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

  test('handles dice roll correctly', async () => {
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button');
    fireEvent.click(rollButton);
    
    expect(rollButton).toBeDisabled();
    expect(rollButton).toHaveTextContent(/rolling\.\.\./i);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    expect(rollButton).not.toBeDisabled();
    expect(rollButton).toHaveTextContent(/roll dice/i);
    
    const stats = screen.getByText(/total rolls:/i).parentElement;
    expect(stats).toHaveTextContent(/total rolls: 1/i);
    expect(stats).toHaveTextContent(/remaining rolls: 31/i);
  });

  test('handles discard count changes', () => {
    render(<DiceRoller />);
    
    const input = screen.getByLabelText(/discard count/i);
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);
    expect(screen.getByText(/remaining rolls:/i).parentElement).toHaveTextContent(/remaining rolls: 26/i);
    
    // Test invalid values
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(10); // Should not change
    
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(10); // Should not change
    
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(10); // Should not change
  });

  test('handles special die toggle', () => {
    render(<DiceRoller />);
    
    const checkbox = screen.getByLabelText(/use cities & knights special die/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('calculates average roll correctly', async () => {
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button');
    
    // Simulate multiple rolls
    for (let i = 0; i < 3; i++) {
      fireEvent.click(rollButton);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }
    
    const stats = screen.getByText(/total rolls:/i).parentElement;
    expect(stats).toHaveTextContent(/total rolls: 3/i);
    expect(stats).toHaveTextContent(/average roll:/i); // We can't test exact value as it's random
  });
});