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

describe('DiceRoller', () => {
  // Test data
  const defaultRoll = {
    dice1: 3,
    dice2: 4,
    sum: 7,
    specialDie: null
  };

  // Mock audio playback
  const mockPlay = jest.fn();
  let mockAudio: jest.Mock;
  const mockConsoleError = jest.fn();
  
  // Mock utility methods
  const mockRoll = jest.fn().mockReturnValue(defaultRoll);
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);
  const mockDiceRollerConstructor = jest.fn().mockReturnValue({
    roll: mockRoll,
    setDiscardCount: mockSetDiscardCount,
    getRemainingRolls: mockGetRemainingRolls
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(mockConsoleError);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));
    
    // Setup DiceRollerUtil mock for each test
    (DiceRollerUtil as jest.Mock).mockImplementation(mockDiceRollerConstructor);

    // Setup global mocks
    (global as any).Audio = mockAudio;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('handles a failed roll correctly', async () => {
    jest.useFakeTimers();
    
    // Mock roll to throw an error
    const mockError = new Error('Roll failed');
    const rollError = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    // Create a new instance for this test
    (DiceRollerUtil as jest.Mock).mockImplementationOnce(() => ({
      roll: rollError,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    // Check loading state
    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(button).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Check error handling
    expect(mockConsoleError).toHaveBeenCalledWith('Error rolling dice:', mockError);
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2); // Initial + reinitialize
    expect(button).not.toBeDisabled();
  });

  // Add more test cases...
});