import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import '@testing-library/jest-dom';

// Mock DiceRollerUtil
jest.mock('@/utils/diceRoller');

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
  Volume2: () => <span data-testid="volume-on-icon">Sound On</span>,
  VolumeX: () => <span data-testid="volume-off-icon">Sound Off</span>,
  RotateCcw: () => <span data-testid="reset-icon">Reset</span>,
}));

describe('DiceRoller Core', () => {
  const mockPlay = jest.fn();
  let mockAudio: jest.Mock;
  const mockRoll = jest.fn();
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);
  const originalError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));

    mockRoll.mockReturnValue({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });

    mockSetDiscardCount.mockImplementation(() => {});
    
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

    (global as any).Audio = mockAudio;
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    console.error = originalError;
  });

  it('renders initial state', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    expect(input).toHaveValue("4");
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeEnabled();
  });

  it('handles discard count validation strictly', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    const initialValue = 4;

    // Test NaN cases
    act(() => {
      fireEvent.change(input, { target: { value: '' } });
    });
    expect(input).toHaveValue(initialValue);

    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    expect(input).toHaveValue(initialValue);

    act(() => {
      fireEvent.change(input, { target: { value: '3.14' } });
    });
    expect(input).toHaveValue(initialValue);

    // Test range validation
    act(() => {
      fireEvent.change(input, { target: { value: '-1' } });
    });
    expect(input).toHaveValue(initialValue);

    act(() => {
      fireEvent.change(input, { target: { value: '36' } });
    });
    expect(input).toHaveValue(initialValue);

    // Test valid values
    act(() => {
      fireEvent.change(input, { target: { value: '0' } });
    });
    expect(input).toHaveValue(0);

    act(() => {
      fireEvent.change(input, { target: { value: '35' } });
    });
    expect(input).toHaveValue(35);
  });

  it('handles invalid discard counts', () => {
    const mockError = new Error('Failed to initialize');

    // Return working instance first, then error-throwing instance
    let isFirstRender = true;
    (DiceRollerUtil as jest.Mock).mockImplementation(() => {
      if (isFirstRender) {
        isFirstRender = false;
        return {
          roll: mockRoll,
          setDiscardCount: () => { throw mockError; },
          getRemainingRolls: mockGetRemainingRolls
        };
      }
      throw mockError;
    });

    // Render and change value
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    fireEvent.change(input, { target: { value: '10' } });

    // Verify
    expect(console.error).toHaveBeenCalledWith('Error setting discard count:', mockError);
  });

  it('prevents simultaneous rolls', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Initial state
    expect(button.className).not.toContain('opacity-50');
    expect(button.className).not.toContain('cursor-not-allowed');

    // First click
    act(() => {
      fireEvent.click(button);
    });

    // During roll
    expect(button).toBeDisabled();
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');

    // Try second click while disabled
    act(() => {
      fireEvent.click(button);
    });

    // Fast-forward timers to complete the roll animation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // After roll completes
    await waitFor(() => {
      expect(button).toBeEnabled();
      expect(button.className).not.toContain('opacity-50');
      expect(button.className).not.toContain('cursor-not-allowed');
      expect(mockRoll).toHaveBeenCalledTimes(1);
    });
  });

  // ... rest of the tests remain the same ...
});