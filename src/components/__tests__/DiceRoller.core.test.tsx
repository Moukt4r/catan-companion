import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import '@testing-library/jest-dom';

const mockRoll = jest.fn();
const mockGetRemainingRolls = jest.fn();

// Mock DiceRoller utility
jest.mock('@/utils/diceRoller', () => ({
  DiceRoller: jest.fn().mockImplementation(() => ({
    roll: mockRoll,
    getRemainingRolls: mockGetRemainingRolls
  }))
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span data-testid="loader">Loading...</span>,
  Volume2: () => <span data-testid="volume-on">Sound On</span>,
  VolumeX: () => <span data-testid="volume-off">Sound Off</span>,
  RotateCcw: () => <span data-testid="reset">Reset</span>,
}));

describe('DiceRoller Core', () => {
  const mockPlay = jest.fn();
  const originalError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup audio mock
    mockPlay.mockResolvedValue(undefined);
    (global as any).Audio = jest.fn(() => ({ play: mockPlay }));
    
    // Setup roll mock
    mockRoll.mockReturnValue({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });

    // Setup remaining rolls mock
    mockGetRemainingRolls.mockReturnValue(30);

    // Setup error logging mock
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    console.error = originalError;
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByTestId('discard-count-input')).toHaveValue("4");
    expect(screen.getByTestId('roll-button')).toBeEnabled();
  });

  it('allows rolling dice', async () => {
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    // Click roll button
    act(() => {
      fireEvent.click(button);
    });

    // Should be disabled during roll
    expect(button).toBeDisabled();

    // Complete roll animation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Should be enabled again
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);
  });

  it('handles roll failure gracefully', async () => {
    mockRoll.mockImplementationOnce(() => {
      throw new Error('Roll failed');
    });

    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    act(() => {
      fireEvent.click(button);
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error rolling dice:', expect.any(Error));
      expect(button).toBeEnabled();
    });
  });

  it('handles input validation', () => {
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');

    // Non-numeric input
    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    expect(input).toHaveValue('abc');

    // Out of range input
    act(() => {
      fireEvent.change(input, { target: { value: '36' } });
    });
    expect(input).toHaveValue('36');

    // Valid input
    act(() => {
      fireEvent.change(input, { target: { value: '15' } });
    });
    expect(input).toHaveValue('15');
  });

  it('responds to keyboard shortcuts', async () => {
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    // Press 'R' key
    act(() => {
      fireEvent.keyDown(document, { key: 'R' });
    });

    expect(button).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
      expect(mockRoll).toHaveBeenCalledTimes(1);
    });
  });

  it('toggles sound on and off', () => {
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');
    const soundToggle = screen.getByLabelText(/disable sound/i);

    // Initial roll with sound
    act(() => {
      fireEvent.click(button);
    });

    expect(mockPlay).toHaveBeenCalled();
    mockPlay.mockClear();

    // Toggle sound off
    act(() => {
      fireEvent.click(soundToggle);
    });

    // Roll without sound
    act(() => {
      fireEvent.click(button);
    });

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('prevents multiple simultaneous rolls', async () => {
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    // First click
    act(() => {
      fireEvent.click(button);
    });

    // Second click while first is in progress
    act(() => {
      fireEvent.click(button);
    });

    // Complete roll
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalledTimes(1);
    });
  });
});