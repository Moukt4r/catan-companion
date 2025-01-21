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
  const mockConsoleError = jest.fn();
  const mockRoll = jest.fn();
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);

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
    
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

    (global as any).Audio = mockAudio;
    console.error = mockConsoleError;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders initial state', () => {
    render(<DiceRoller />);
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeEnabled();
  });

  it('handles invalid discard counts', () => {
    const mockError = new Error('Failed to initialize');
    (DiceRollerUtil as jest.Mock).mockImplementationOnce(() => {
      throw mockError;
    });

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: '10' } });
    });

    expect(mockConsoleError).toHaveBeenCalledWith('Error setting discard count:', mockError);
  });

  it('prevents simultaneous rolls', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    // First click
    act(() => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();

    // Try second click while disabled
    act(() => {
      fireEvent.click(button);
    });

    // Fast-forward timers to complete the roll animation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalledTimes(1);
    });
  }, 10000);

  it('handles sound toggling correctly', async () => {
    render(<DiceRoller />);
    const soundButton = screen.getByLabelText(/disable sound/i);
    const rollButton = screen.getByRole('button', { name: /roll dice/i });

    // Initial roll with sound
    act(() => {
      fireEvent.click(rollButton);
    });

    // Fast-forward past the roll animation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(mockAudio).toHaveBeenCalledTimes(1);

    // Toggle sound off
    act(() => {
      fireEvent.click(soundButton);
    });

    // Roll without sound
    act(() => {
      fireEvent.click(rollButton);
    });

    // Fast-forward past the roll animation
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Should not create a new Audio instance
    expect(mockAudio).toHaveBeenCalledTimes(1);
  }, 10000);

  it('resets statistics properly', async () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Perform multiple rolls
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(button);
        jest.advanceTimersByTime(600);
      });
    }

    expect(mockRoll).toHaveBeenCalledTimes(3);

    // Find and click reset button using the title attribute
    const resetButton = screen.getByTitle(/reset statistics/i);
    act(() => {
      fireEvent.click(resetButton);
    });

    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
  });

  it('responds to keyboard events', async () => {
    render(<DiceRoller />);

    // Trigger keyboard event
    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalled();
    });
  });

  it('cleans up event listeners', async () => {
    const { unmount } = render(<DiceRoller />);

    // Trigger keyboard event
    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalled();
    });

    mockRoll.mockClear();
    unmount();

    // Trigger keyboard event after unmount
    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).not.toHaveBeenCalled();
  });
});
