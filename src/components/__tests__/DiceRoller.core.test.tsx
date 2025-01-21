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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
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
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders initial state', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    expect(input).toHaveValue("4");
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeEnabled();
  });

  it('handles invalid discard counts', () => {
    // Mock implementation that throws
    const mockError = new Error('Failed to initialize');
    mockSetDiscardCount.mockImplementation(() => { throw mockError; });

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: '10' } });
    });

    expect(console.error).toHaveBeenCalledWith('Error setting discard count:', mockError);
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
  });

  it('handles sound toggling correctly', async () => {
    render(<DiceRoller />);
    const soundButton = screen.getByLabelText('Disable sound');
    const rollButton = screen.getByRole('button', { name: /roll dice/i });

    // Initial roll with sound
    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockAudio).toHaveBeenCalledTimes(1);
    });

    // Toggle sound off
    act(() => {
      fireEvent.click(soundButton);
    });

    // Roll without sound
    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    // Should not create a new Audio instance
    await waitFor(() => {
      expect(mockAudio).toHaveBeenCalledTimes(1);
    });
  });

  it('resets statistics properly', async () => {
    render(<DiceRoller />);
    const rollButton = screen.getByRole('button', { name: /roll dice/i });

    // Perform multiple rolls
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(rollButton);
      });
      act(() => {
        jest.advanceTimersByTime(600);
      });
      await waitFor(() => {
        expect(rollButton).toBeEnabled();
      });
    }

    expect(mockRoll).toHaveBeenCalledTimes(3);

    // Wait for roll history to appear and click reset
    const resetButton = await screen.findByTitle('Reset statistics');
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

  it('updates roll count correctly', async () => {
    render(<DiceRoller />);
    const rollButton = screen.getByRole('button', { name: /roll dice/i });

    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();

    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
    });
  });

  it('calculates average roll correctly', async () => {
    mockRoll.mockReturnValueOnce({ dice1: 3, dice2: 4, sum: 7, specialDie: null })
           .mockReturnValueOnce({ dice1: 2, dice2: 5, sum: 7, specialDie: null });

    render(<DiceRoller />);
    const rollButton = screen.getByRole('button', { name: /roll dice/i });

    // First roll
    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    // Second roll
    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(screen.getByText('Average Roll: 7.0')).toBeInTheDocument();
    });
  });
});
