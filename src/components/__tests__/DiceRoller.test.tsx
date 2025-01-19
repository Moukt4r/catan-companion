import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import { SPECIAL_DIE_INFO } from '@/types/diceTypes';

// Create mock implementation for DiceRollerUtil
const mockRoll = jest.fn().mockReturnValue({
  dice1: 3,
  dice2: 4,
  sum: 7,
  specialDie: 'science',
});

const mockSetDiscardCount = jest.fn();
const mockGetRemainingRolls = jest.fn().mockReturnValue(30);

// Mock the DiceRollerUtil
jest.mock('@/utils/diceRoller', () => {
  return {
    DiceRoller: jest.fn().mockImplementation((discardCount, useSpecialDie) => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls,
    })),
  };
});

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
  RotateCcw: () => <span>Reset</span>,
  Volume2: () => <span>Sound On</span>,
  VolumeX: () => <span>Sound Off</span>,
}));

// Mock the audio playback
const mockPlay = jest.fn();
const mockAudio = jest.fn(() => ({
  play: mockPlay,
}));
(global as any).Audio = mockAudio;

describe('DiceRoller', () => {
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (DiceRollerUtil as jest.Mock).mockClear();
    mockRoll.mockClear();
    mockSetDiscardCount.mockClear();
    mockGetRemainingRolls.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    mockConsoleError.mockRestore();
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
  });

  it('allows changing discard count', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: '8' } });
    });

    expect(input).toHaveValue(8);
    expect(mockSetDiscardCount).toHaveBeenCalledWith(8);
  });

  it('handles roll action', async () => {
    jest.useFakeTimers();
    const onRoll = jest.fn();
    render(<DiceRoller onRoll={onRoll} />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(mockRoll).toHaveBeenCalled();
    expect(onRoll).toHaveBeenCalledWith({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: 'science',
    });
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('handles roll errors gracefully', () => {
    jest.useFakeTimers();
    const rollError = new Error('Roll failed');
    mockRoll.mockImplementationOnce(() => {
      throw rollError;
    });

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    act(() => {
      jest.runAllTimers();
    });

    // Should log error and create new instance
    expect(mockConsoleError).toHaveBeenCalledWith('Error rolling dice:', rollError);
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('handles discard count change errors', () => {
    const discardError = new Error('Invalid discard count');
    mockSetDiscardCount.mockImplementationOnce(() => {
      throw discardError;
    });

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: '8' } });
    });

    // Should log error and create new instance
    expect(mockConsoleError).toHaveBeenCalledWith('Error setting discard count:', discardError);
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2);
    expect(input).toHaveValue(8);
  });

  it('updates statistics after rolling', () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.getByText(/total rolls: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/average roll: 7.0/i)).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });

    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');

    act(() => {
      jest.runAllTimers();
    });

    expect(mockRoll).toHaveBeenCalled();
  });

  it('toggles sound', () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    const soundButton = screen.getByRole('button', { name: /disable sound/i });

    fireEvent.click(soundButton);
    expect(screen.getByRole('button', { name: /enable sound/i })).toBeInTheDocument();

    // Check that sound is actually disabled
    fireEvent.click(screen.getByRole('button', { name: /roll dice/i }));
    expect(mockAudio).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    // Enable sound again and verify it works
    fireEvent.click(screen.getByRole('button', { name: /enable sound/i }));
    fireEvent.click(screen.getByRole('button', { name: /roll dice/i }));
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
  });

  it('validates discard count range', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    // Test minimum value
    fireEvent.change(input, { target: { value: '-1' } });
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Test maximum value
    fireEvent.change(input, { target: { value: '36' } });
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Test NaN value
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Test valid value
    fireEvent.change(input, { target: { value: '10' } });
    expect(mockSetDiscardCount).toHaveBeenCalledWith(10);
  });

  it('resets statistics', () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    // Roll dice
    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    act(() => {
      jest.runAllTimers();
    });

    // Reset stats
    const resetButton = screen.getByTitle(/reset statistics/i);
    fireEvent.click(resetButton);

    expect(screen.getByText(/total rolls: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/average roll: 0\.0/i)).toBeInTheDocument();
    expect(screen.queryByText(/roll history/i)).not.toBeInTheDocument();
  });

  it('prevents multiple simultaneous rolls', () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    
    // First click
    fireEvent.click(button);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Try to click again while rolling
    fireEvent.click(button);
    expect(mockRoll).not.toHaveBeenCalled(); // No rolls yet until timer completes

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(mockRoll).toHaveBeenCalledTimes(1); // Only one roll executed
  });

  it('handles roll history and special die display', () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });

    // Roll multiple times
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(button);
        jest.runAllTimers();
      });
    }

    // Check that roll history is displayed
    expect(screen.getByRole('heading', { name: /roll history/i })).toBeInTheDocument();
    expect(screen.getByText(/roll 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/roll 2:/i)).toBeInTheDocument();
    expect(screen.getByText(/roll 3:/i)).toBeInTheDocument();

    // Check that special die displays are present (3 history entries)
    const specialDieDisplays = screen.getAllByTestId('special-die-display');
    expect(specialDieDisplays).toHaveLength(3);
  });

  it('limits roll history to 10 items', () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });

    // Roll 12 times
    for (let i = 0; i < 12; i++) {
      act(() => {
        fireEvent.click(button);
        jest.runAllTimers();
      });
    }

    const historyItems = screen.getAllByText(/roll \d+:/i);
    expect(historyItems).toHaveLength(10);
    expect(screen.getByText(/roll 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/roll 10:/i)).toBeInTheDocument();
    expect(screen.queryByText(/roll 11:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/roll 12:/i)).not.toBeInTheDocument();
  });

  it('handles audio play failure gracefully', () => {
    jest.useFakeTimers();
    const audioError = new Error('Audio failed to play');
    mockPlay.mockRejectedValueOnce(audioError);

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    // This should not throw even though audio.play() fails
    fireEvent.click(button);
    act(() => {
      jest.runAllTimers();
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(mockRoll).toHaveBeenCalled(); // Roll should still happen
  });

  it('ignores non-r key presses', () => {
    render(<DiceRoller />);

    act(() => {
      fireEvent.keyDown(document, { key: 'a' });
    });

    expect(mockAudio).not.toHaveBeenCalled();
  });
});