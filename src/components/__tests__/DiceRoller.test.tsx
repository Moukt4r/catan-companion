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

    act(() => {
      fireEvent.click(button);
    });

    expect(screen.getByRole('button')).toHaveTextContent('Rolling...');
    expect(button).toBeDisabled();
      
    // Fast-forward animation timer
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Roll Dice');
      expect(button).not.toBeDisabled();
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
    });
  });

  // Additional test cases to improve coverage
  it('validates discard count range', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);

    // Test minimum value
    act(() => {
      fireEvent.change(input, { target: { value: '-1' } });
    });
    expect(input).toHaveValue(0);

    // Test maximum value
    act(() => {
      fireEvent.change(input, { target: { value: '37' } });
    });
    expect(input).toHaveValue(36);
  });

  it('displays special die result', async () => {
    render(<DiceRoller />);
    const toggle = screen.getByLabelText(/Use Cities & Knights special die/i);
    
    // Enable special die
    act(() => {
      fireEvent.click(toggle);
    });

    // Roll dice
    const button = screen.getByRole('button', { name: 'Roll Dice' });
    act(() => {
      fireEvent.click(button);
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Check that special die result is displayed
    await waitFor(() => {
      expect(screen.getByTestId('special-die')).toBeInTheDocument();
    });
  });

  it('handles roll history correctly', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: 'Roll Dice' });

    // Roll multiple times
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(button);
      });

      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    }

    // Check history is tracked
    expect(screen.getByText(/Total Rolls: 3/i)).toBeInTheDocument();
  });
});