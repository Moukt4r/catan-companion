import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiceRoller } from '../../components/DiceRoller';
import { DiceRoller as DiceRollerUtil } from '../../utils/diceRoller';

// Mock the DiceRollerUtil
jest.mock('../../utils/diceRoller');

describe('DiceRoller', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: jest.fn().mockReturnValue({ die1: 1, die2: 2, sum: 3, specialDie: null }),
      setDiscardCount: jest.fn(),
      setUseSpecialDie: jest.fn(),
      getRemainingRolls: jest.fn().mockReturnValue(32),
    }));
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
    fireEvent.change(input, { target: { value: '10' } });
    
    expect(input).toHaveValue(10);
  });

  test('handles invalid discard count inputs', async () => {
    render(<DiceRoller />);
    
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
  });

  test('handles special die toggle', () => {
    render(<DiceRoller />);
    
    const checkbox = screen.getByLabelText(/Cities & Knights/);
    fireEvent.click(checkbox);
    
    expect(checkbox).toBeChecked();
  });

  test('handles dice rolling with loading state', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Button should be disabled and show loading state
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Rolling...');
    
    // Wait for the roll animation to complete
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Roll Dice');
    }, { timeout: 1000 });
  });

  test('updates statistics after rolling', async () => {
    render(<DiceRoller />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Total Rolls: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Average Roll: 3.0/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});