import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock the DiceRollerUtil
jest.mock('@/utils/diceRoller', () => {
  const mockRoll = jest.fn().mockReturnValue({
    dice1: 3,
    dice2: 4,
    sum: 7,
    specialDie: null
  });
  
  return {
    DiceRoller: jest.fn().mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: jest.fn(),
      getRemainingRolls: jest.fn().mockReturnValue(30),
    }))
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

// Mock console.error for clean test output
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Get mock functions for assertions
const mockRoll = jest.fn();
const mockSetDiscardCount = jest.fn();
const MockDiceRollerClass = (DiceRollerUtil as jest.Mock);

describe('DiceRoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    MockDiceRollerClass.mockImplementation(() => ({
      roll: mockRoll.mockReturnValue({
        dice1: 3,
        dice2: 4,
        sum: 7,
        specialDie: null
      }),
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: jest.fn().mockReturnValue(30),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
  });

  it('handles roll action', async () => {
    jest.useFakeTimers();
    const onRoll = jest.fn();
    render(<DiceRoller onRoll={onRoll} />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    // Check loading state
    const loadingElement = screen.getByText(/rolling/i);
    expect(loadingElement).toBeInTheDocument();
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    // Wait for roll to complete
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Verify roll was called and loading is gone
    expect(mockRoll).toHaveBeenCalled();
    expect(onRoll).toHaveBeenCalledWith({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });
    expect(screen.queryByText(/rolling/i)).not.toBeInTheDocument();
  });

  it('handles roll errors gracefully', async () => {
    jest.useFakeTimers();
    const rollError = new Error('Roll failed');
    mockRoll.mockRejectedValueOnce(rollError);

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    // Wait for error to be handled
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockConsoleError).toHaveBeenCalledWith('Error rolling dice:', rollError);
    expect(MockDiceRollerClass).toHaveBeenCalledTimes(2); // Initial + error recovery
  });

  it('handles discard count change errors gracefully', () => {
    const setDiscardError = new Error('Failed to set discard count');
    mockSetDiscardCount.mockRejectedValueOnce(setDiscardError);

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    // Trigger error by changing discard count
    fireEvent.change(input, { target: { value: '10' } });

    expect(mockConsoleError).toHaveBeenCalledWith('Error setting discard count:', setDiscardError);
    expect(MockDiceRollerClass).toHaveBeenCalledTimes(2); // Initial + error recovery
  });

  it('handles audio play errors gracefully', async () => {
    jest.useFakeTimers();
    const audioError = new Error('Audio failed to play');
    mockPlay.mockRejectedValueOnce(audioError);

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    // Audio error should not prevent roll
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(mockRoll).toHaveBeenCalled(); // Roll should still happen
  });

  // ... (rest of the existing tests) ...

});