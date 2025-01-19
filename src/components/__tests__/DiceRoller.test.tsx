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

// Get mock functions for assertions
const mockRoll = jest.fn();
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
      setDiscardCount: jest.fn(),
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

  it('allows changing discard count', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: '8' } });
    });

    expect(input).toHaveValue(8);
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

  it('updates statistics after rolling', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/total rolls: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/average roll: 7\.0/i)).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    render(<DiceRoller />);
    fireEvent.keyDown(document, { key: 'r' });
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();
  });

  it('toggles sound', () => {
    render(<DiceRoller />);

    // Find and click sound toggle button
    const soundButton = screen.getByRole('button', { name: /disable sound/i });
    fireEvent.click(soundButton);

    // Sound should be disabled
    expect(screen.getByRole('button', { name: /enable sound/i })).toBeInTheDocument();

    // Roll dice and check that sound is not played
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);
    expect(mockAudio).not.toHaveBeenCalled();
  });

  it('validates discard count range', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    // Test minimum value
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(4);

    // Test maximum value
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(4);

    // Test valid value
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);
  });

  it('resets statistics', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    // Roll dice
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Stats should show one roll
    expect(screen.getByText(/total rolls: 1/i)).toBeInTheDocument();

    // Reset stats using the reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    // Stats should be reset
    expect(screen.getByText(/total rolls: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/average roll: 0\.0/i)).toBeInTheDocument();
  });

  it('prevents multiple simultaneous rolls', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    
    // First click
    fireEvent.click(button);
    
    // Second click should not trigger another roll
    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalledTimes(1); // Only one roll executed
    expect(screen.queryByText(/rolling/i)).not.toBeInTheDocument();
  });

  it('handles roll history', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });

    // Roll three times
    for (let i = 0; i < 3; i++) {
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    // Verify roll history
    const heading = screen.getByRole('heading', { name: /roll history/i });
    expect(heading).toBeInTheDocument();

    // Check that roll histories are displayed
    const histories = screen.getAllByText(/3 \+ 4 = 7/i);
    expect(histories).toHaveLength(3);
  });
});