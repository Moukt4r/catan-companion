import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock DiceRollerUtil
jest.mock('@/utils/diceRoller');

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
  RotateCcw: () => <span>Reset</span>,
  Volume2: () => <span>Sound On</span>,
  VolumeX: () => <span>Sound Off</span>,
}));

describe('DiceRoller - Statistics & History', () => {
  const mockRoll = jest.fn();
  let mockAudio: jest.Mock;
  const mockPlay = jest.fn();
  const OriginalAudio = global.Audio;
  const mockGetRemainingRolls = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));
    (global as any).Audio = mockAudio;

    // Default roll result
    mockRoll.mockReturnValue({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });

    mockGetRemainingRolls.mockReturnValue(30);

    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: jest.fn(),
      getRemainingRolls: mockGetRemainingRolls
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
    (global as any).Audio = OriginalAudio;
  });

  it('updates statistics correctly after each roll', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });

    // First roll - 3 + 4 = 7
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 7.0')).toBeInTheDocument();

    // Second roll - 6 + 6 = 12
    mockRoll.mockReturnValueOnce({
      dice1: 6,
      dice2: 6,
      sum: 12,
      specialDie: null
    });

    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText('Total Rolls: 2')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 9.5')).toBeInTheDocument();
  });

  it('maintains roll history up to 10 items', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });

    // Roll 12 times with different values
    for (let i = 1; i <= 12; i++) {
      mockRoll.mockReturnValueOnce({
        dice1: i,
        dice2: i,
        sum: i * 2,
        specialDie: null
      });

      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    // Get all history entries
    const historyEntries = screen.getAllByText(/Roll \d+: \d+ \+ \d+ = \d+/);
    expect(historyEntries).toHaveLength(10);
    
    // Since we've made 12 rolls, the history shows most recent first
    // But roll numbers are like "Roll 1", "Roll 2", etc.
    expect(historyEntries[0]).toHaveTextContent('Roll 10: 12 + 12 = 24');
    expect(historyEntries[1]).toHaveTextContent('Roll 9: 11 + 11 = 22');
    expect(historyEntries[9]).toHaveTextContent('Roll 1: 3 + 3 = 6');

    // Early rolls (1 and 2) should not be present
    const rollHistory = screen.getByRole('heading', { name: /roll history/i }).parentElement?.parentElement;
    expect(rollHistory).toBeTruthy();
    expect(rollHistory).not.toHaveTextContent('1 + 1 = 2');
    expect(rollHistory).not.toHaveTextContent('2 + 2 = 4');
  });

  it('resets all statistics correctly', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    // First make some rolls
    const button = screen.getByRole('button', { name: /roll dice/i });
    
    // Roll a few times
    for (let i = 1; i <= 3; i++) {
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    expect(screen.getByText('Total Rolls: 3')).toBeInTheDocument();
    expect(screen.getByText(/average roll:/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Roll \d+:/)).not.toHaveLength(0);

    // Reset stats
    const resetButton = screen.getByRole('button', { name: /reset statistics/i });
    fireEvent.click(resetButton);

    // Verify reset state
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /roll history/i })).not.toBeInTheDocument();
  });

  it('shows correct remaining rolls count', async () => {
    jest.useFakeTimers();

    // Set up the mock to return decreasing values after each roll
    let remainingRolls = 30;
    mockGetRemainingRolls.mockImplementation(() => {
      return remainingRolls;
    });

    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: /roll dice/i });
    
    // Initial count
    expect(screen.getByText('Remaining Rolls: 30')).toBeInTheDocument();

    // First roll
    fireEvent.click(button);
    remainingRolls = 29; // Update before the roll is completed

    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByText('Remaining Rolls: 29')).toBeInTheDocument();

    // Second roll
    fireEvent.click(button);
    remainingRolls = 28; // Update before the roll is completed

    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByText('Remaining Rolls: 28')).toBeInTheDocument();
  });

  it('displays roll history with special die values', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Roll with special die
    mockRoll.mockReturnValueOnce({
      dice1: 5,
      dice2: 5,
      sum: 10,
      specialDie: 'barbarian'
    });

    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Find the history entry by role to avoid duplicate matches
    const historyContainer = screen.getByRole('heading', { name: /roll history/i }).parentElement?.parentElement;
    expect(historyContainer).toBeTruthy();
    expect(historyContainer).toHaveTextContent('Roll 1: 5 + 5 = 10');

    // Special die indicator should be present
    expect(screen.getByText('Barbarian')).toBeInTheDocument();
  });

  it('updates history order correctly', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Three rolls with different values
    const rolls = [
      { dice1: 1, dice2: 2, sum: 3 },
      { dice1: 3, dice2: 4, sum: 7 },
      { dice1: 5, dice2: 6, sum: 11 }
    ];

    for (const roll of rolls) {
      mockRoll.mockReturnValueOnce({ ...roll, specialDie: null });
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    const historyEntries = screen.getAllByText(/Roll \d+: \d+ \+ \d+ = \d+/);
    expect(historyEntries[0]).toHaveTextContent('Roll 3: 5 + 6 = 11');
    expect(historyEntries[1]).toHaveTextContent('Roll 2: 3 + 4 = 7');
    expect(historyEntries[2]).toHaveTextContent('Roll 1: 1 + 2 = 3');
  });
});