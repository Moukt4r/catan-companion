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
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);
  let mockAudio: jest.Mock;
  const mockPlay = jest.fn();
  const OriginalAudio = global.Audio;

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

    // Should contain latest rolls but not earliest ones
    expect(screen.queryByText((content, element) => {
      return element?.textContent === 'Roll 1: 1 + 1 = 2';
    })).not.toBeInTheDocument();

    expect(screen.queryByText((content, element) => {
      return element?.textContent === 'Roll 2: 2 + 2 = 4';
    })).not.toBeInTheDocument();

    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Roll 1: 12 + 12 = 24';
    })).toBeInTheDocument();

    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Roll 2: 11 + 11 = 22';
    })).toBeInTheDocument();

    // Get all history entries
    const historyEntries = screen.getAllByText(/Roll \d+: \d+ \+ \d+ = \d+/);
    expect(historyEntries).toHaveLength(10);
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
    expect(screen.queryByText(/Roll \d+:/)).not.toBeInTheDocument();
  });

  it('shows correct remaining rolls count', async () => {
    jest.useFakeTimers();
    mockGetRemainingRolls
      .mockReturnValueOnce(30)  // Initial
      .mockReturnValueOnce(29)  // After first roll
      .mockReturnValueOnce(28); // After second roll

    render(<DiceRoller />);
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Remaining Rolls: 30';
    })).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /roll dice/i });
    
    // First roll
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Remaining Rolls: 29';
    })).toBeInTheDocument();

    // Second roll
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Remaining Rolls: 28';
    })).toBeInTheDocument();
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

    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Roll 1: 5 + 5 = 10';
    })).toBeInTheDocument();
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
    expect(historyEntries[0]).toHaveTextContent('Roll 1: 5 + 6 = 11');
    expect(historyEntries[1]).toHaveTextContent('Roll 2: 3 + 4 = 7');
    expect(historyEntries[2]).toHaveTextContent('Roll 3: 1 + 2 = 3');
  });
});