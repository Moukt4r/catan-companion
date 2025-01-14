import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

// Mock timer
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DiceRoller', () => {
  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByText(/Roll Dice/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Discard Count/i)).toHaveValue(4);
  });

  it('allows changing discard count', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    
    fireEvent.change(input, { target: { value: '6' } });
    expect(input).toHaveValue(6);
  });

  it('toggles special die', () => {
    render(<DiceRoller />);
    const toggle = screen.getByLabelText(/Use Cities & Knights special die/i);
    
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('shows loading state while rolling', async () => {
    render(<DiceRoller />);
    const button = screen.getByText(/Roll Dice/i);
    
    fireEvent.click(button);
    expect(screen.getByText(/Rolling.../i)).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Fast-forward animation timer
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/Roll Dice/i)).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('updates statistics after rolling', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByText(/Roll Dice/i);
    fireEvent.click(button);
    
    // Fast-forward animation timer
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/Total Rolls: 1/)).toBeInTheDocument();
  });
});