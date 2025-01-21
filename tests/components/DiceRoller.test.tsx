import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DiceRoller } from '../../components/DiceRoller';
import { DiceRoller as DiceRollerUtil } from '../../utils/diceRoller';

// Mock the DiceRollerUtil
jest.mock('../../utils/diceRoller');

describe('DiceRoller', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup default mock implementations
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: jest.fn().mockReturnValue({ die1: 1, die2: 2, sum: 3, specialDie: null }),
      setDiscardCount: jest.fn(),
      setUseSpecialDie: jest.fn(),
      getRemainingRolls: jest.fn().mockReturnValue(32),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders correctly with initial state', () => {
    render(<DiceRoller />);
    
    expect(screen.getByLabelText(/Discard Count/)).toHaveValue(4);
    expect(screen.getByLabelText(/Cities & Knights/)).not.toBeChecked();
    expect(screen.getByRole('button')).toHaveTextContent('Roll Dice');
  });

  test('handles discard count changes within valid range', async () => {
    render(<DiceRoller />);
    
    const input = screen.getByLabelText(/Discard Count/);
    
    // Test minimum valid value
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue(0);
    
    // Test maximum valid value
    fireEvent.change(input, { target: { value: '35' } });
    expect(input).toHaveValue(35);
    
    // Test middle range value
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);
  });

  test('handles invalid discard count inputs', async () => {
    const mockSetDiscardCount = jest.fn();
    const { rerender } = render(<DiceRoller />);
    
    const input = screen.getByLabelText(/Discard Count/);
    
    // Test negative number
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(4); // Should keep previous value
    
    // Test number > 35
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(4); // Should keep previous value
    
    // Test non-numeric input
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(4); // Should keep previous value
    
    // Test decimal number
    fireEvent.change(input, { target: { value: '2.5' } });
    expect(input).toHaveValue(4); // Should keep previous value
  });

  test('handles special die toggle', () => {
    const mockSetUseSpecialDie = jest.fn();
    render(<DiceRoller />);
    
    const checkbox = screen.getByLabelText(/Cities & Knights/);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('handles dice rolling with loading state and animation', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByRole('button');
    
    // Click the button to start rolling
    fireEvent.click(button);
    
    // Immediately after click, button should be disabled and show loading state
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Rolling...');
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');
    
    // Fast-forward past the animation delay
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    // After animation, button should be enabled and ready for next roll
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Roll Dice');
      expect(button.className).not.toContain('opacity-50');
      expect(button.className).not.toContain('cursor-not-allowed');
    });
  });

  test('updates statistics after rolling', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByRole('button');
    
    // First roll
    fireEvent.click(button);
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Total Rolls: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Average Roll: 3.0/)).toBeInTheDocument();
    });
    
    // Second roll
    fireEvent.click(button);
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Total Rolls: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Average Roll: 3.0/)).toBeInTheDocument();
    });
  });

  test('disables roll button during animation', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Button should be disabled immediately
    expect(button).toBeDisabled();
    
    // Try clicking again while disabled
    fireEvent.click(button);
    expect(button).toBeDisabled();
    
    // Fast-forward past the animation
    act(() => {
      jest.advanceTimersByTime(600);
    });
    
    // Button should be enabled again
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});