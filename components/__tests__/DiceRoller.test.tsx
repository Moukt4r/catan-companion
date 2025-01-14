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
});