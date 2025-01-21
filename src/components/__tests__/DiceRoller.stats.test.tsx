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

describe('DiceRoller Statistics', () => {
  // Test data
  const rolls = [
    { dice1: 3, dice2: 4, sum: 7, specialDie: null },
    { dice1: 5, dice2: 6, sum: 11, specialDie: 'barbarian' },
    { dice1: 2, dice2: 2, sum: 4, specialDie: 'merchant' }
  ];

  // Mock utility methods
  const mockRoll = jest.fn();
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);
  const mockPlay = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock dice roller
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

    // Setup audio mock
    (global as any).Audio = jest.fn(() => ({ play: mockPlay }));

    // Setup roll sequence
    let rollIndex = 0;
    mockRoll.mockImplementation(() => {
      const roll = rolls[rollIndex % rolls.length];
      rollIndex++;
      return roll;
    });
  });

  it('maintains accurate roll statistics', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Make three rolls
    for (let i = 0; i < 3; i++) {
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    // Check statistics
    expect(screen.getByText('Total Rolls: 3')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 7.3')).toBeInTheDocument(); // (7 + 11 + 4) / 3
    
    // Check roll history
    const history = screen.getAllByText(/roll \d+: \d+ \+ \d+ = \d+/i);
    expect(history).toHaveLength(3);
    expect(history[0]).toHaveTextContent('Roll 3: 2 + 2 = 4');
    expect(history[1]).toHaveTextContent('Roll 2: 5 + 6 = 11');
    expect(history[2]).toHaveTextContent('Roll 1: 3 + 4 = 7');

    // Special die faces should be displayed
    expect(screen.getByTitle(/merchant die face/i)).toBeInTheDocument();
    expect(screen.getByTitle(/barbarian die face/i)).toBeInTheDocument();
  });

  it('limits roll history to 10 entries', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Make 12 rolls
    for (let i = 0; i < 12; i++) {
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    // Should only show last 10 rolls
    const history = screen.getAllByText(/roll \d+: \d+ \+ \d+ = \d+/i);
    expect(history).toHaveLength(10);

    // First entry should be Roll 12
    expect(history[0]).toHaveTextContent('Roll 12:');
  });

  it('resets statistics correctly', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Make some rolls
    for (let i = 0; i < 3; i++) {
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    // Reset stats
    const resetButton = screen.getByTitle('Reset statistics');
    fireEvent.click(resetButton);

    // Check reset state
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.queryByText(/roll \d+:/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/die face/i)).not.toBeInTheDocument();
  });

  it('updates remaining rolls after each roll', async () => {
    jest.useFakeTimers();
    let remainingRolls = 30;
    mockGetRemainingRolls.mockImplementation(() => remainingRolls);

    render(<DiceRoller />);
    
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Check initial state
    expect(screen.getByText('Remaining Rolls: 30')).toBeInTheDocument();

    // Roll and decrease remaining count
    remainingRolls = 29;
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByText('Remaining Rolls: 29')).toBeInTheDocument();

    // Roll again
    remainingRolls = 28;
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    expect(screen.getByText('Remaining Rolls: 28')).toBeInTheDocument();
  });
});
