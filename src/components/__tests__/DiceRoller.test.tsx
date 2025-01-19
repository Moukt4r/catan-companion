import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
  RotateCcw: () => <span>Reset</span>,
  Volume2: () => <span>Sound On</span>,
  VolumeX: () => <span>Sound Off</span>,
}));

describe('DiceRoller', () => {
  // Mock the dice roller utility functions
  const mockRoll = jest.fn();
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn();
  const MockDiceRollerClass = jest.fn().mockImplementation(() => ({
    roll: mockRoll,
    setDiscardCount: mockSetDiscardCount,
    getRemainingRolls: mockGetRemainingRolls,
  }));

  // Mock audio playback
  const mockPlay = jest.fn();
  const mockAudio = jest.fn(() => ({ play: mockPlay }));

  // Mock console.error for clean test output
  const mockConsoleError = jest.fn();

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(mockConsoleError);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockRoll.mockReturnValue({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });
    mockGetRemainingRolls.mockReturnValue(30);
    mockPlay.mockResolvedValue(undefined);
    mockSetDiscardCount.mockResolvedValue(undefined);

    // Setup global mocks
    (global as any).Audio = mockAudio;
    jest.spyOn(DiceRollerUtil, 'prototype', 'get').mockImplementation(() => MockDiceRollerClass());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.restoreAllMocks();
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
    mockRoll.mockImplementationOnce(() => {
      throw new Error('Roll failed');
    });

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    // Wait for error to be handled
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error rolling dice:',
      expect.any(Error)
    );
    expect(MockDiceRollerClass).toHaveBeenCalledTimes(2); // Initial + error recovery
  });

  it('handles discard count change errors gracefully', () => {
    mockSetDiscardCount.mockImplementationOnce(() => {
      throw new Error('Failed to set discard count');
    });

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    // Trigger error by changing discard count
    fireEvent.change(input, { target: { value: '10' } });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );
    expect(MockDiceRollerClass).toHaveBeenCalledTimes(2); // Initial + error recovery
  });

  it('handles audio play errors gracefully', async () => {
    jest.useFakeTimers();
    mockPlay.mockRejectedValueOnce(new Error('Audio failed to play'));

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
    const resetButton = screen.getByText('Reset');
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

  it('handles non-numeric discard count input', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    // Test non-numeric input
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(4); // Should maintain default value

    // Test decimal input
    fireEvent.change(input, { target: { value: '5.5' } });
    expect(input).toHaveValue(5); // Should parse to integer
  });
});