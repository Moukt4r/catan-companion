import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

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

  it('allows changing discard count', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: '6' } });
    });
    
    expect(input).toHaveValue(6);
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

  it('shows loading state while rolling', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: 'Roll Dice' });

    await act(async () => {
      fireEvent.click(button);
      expect(screen.getByText('Rolling...')).toBeInTheDocument();
      expect(button).toBeDisabled();
      
      // Fast-forward animation timer
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText('Roll Dice')).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('updates statistics after rolling', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: 'Roll Dice' });

    await act(async () => {
      fireEvent.click(button);
      // Fast-forward animation timer
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      const totalRolls = screen.getByText(/Total Rolls:/i);
      expect(totalRolls).toHaveTextContent('Total Rolls: 1');
    });
  });
});