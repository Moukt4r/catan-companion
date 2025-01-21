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

  const specialRoll = {
    dice1: 5,
    dice2: 6,
    sum: 11,
    specialDie: 'barbarian'
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

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.getByText('Remaining Rolls: 30')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /roll history/i })).not.toBeInTheDocument();
  });

  it('handles successful roll action', async () => {
    jest.useFakeTimers();
    const onRoll = jest.fn();
    render(<DiceRoller onRoll={onRoll} />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    // Check loading state
    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Check final state
    expect(mockRoll).toHaveBeenCalled();
    expect(onRoll).toHaveBeenCalledWith(defaultRoll);
    expect(screen.queryByText(/rolling/i)).not.toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('prevents multiple simultaneous rolls', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    
    // Try rolling multiple times quickly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Should only roll once
    expect(mockRoll).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts properly', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    // Test 'R' key
    fireEvent.keyDown(document, { key: 'R' });
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Test 'r' key
    mockRoll.mockClear();
    fireEvent.keyDown(document, { key: 'r' });
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Test other keys
    mockRoll.mockClear();
    fireEvent.keyDown(document, { key: 'x' });
    expect(mockRoll).not.toHaveBeenCalled();
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

  it('handles invalid discard count values', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    // Test negative values
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Test too large values
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Test non-numeric values
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Test valid values
    mockSetDiscardCount.mockClear();
    fireEvent.change(input, { target: { value: '15' } });
    expect(input).toHaveValue(15);
    expect(mockSetDiscardCount).toHaveBeenCalledWith(15);
  });

  it('handles discard count change errors gracefully', () => {
    mockSetDiscardCount.mockImplementationOnce(() => {
      throw new Error('Failed to set discard count');
    });

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    fireEvent.change(input, { target: { value: '10' } });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2);
    expect(input).toHaveValue(10);
  });

  it('handles audio play errors gracefully', async () => {
    jest.useFakeTimers();
    mockPlay.mockRejectedValueOnce(new Error('Audio failed to play'));

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });
    
    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(mockRoll).toHaveBeenCalled();
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('toggles sound effects', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const soundButton = screen.getByRole('button', { name: /disable sound/i });
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    // Initially sound is enabled
    fireEvent.click(rollButton);
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    mockAudio.mockClear();
    
    // Disable sound
    fireEvent.click(soundButton);
    expect(screen.getByRole('button', { name: /enable sound/i })).toBeInTheDocument();
    
    // Roll with sound disabled
    fireEvent.click(rollButton);
    expect(mockAudio).not.toHaveBeenCalled();
  });

  it('maintains roll history', async () => {
    jest.useFakeTimers();
    mockRoll
      .mockReturnValueOnce(defaultRoll)
      .mockReturnValueOnce(specialRoll);

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    // First roll
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/roll 1: 3 \+ 4 = 7/i)).toBeInTheDocument();

    // Second roll
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/roll 2: 5 \+ 6 = 11/i)).toBeInTheDocument();
    expect(screen.getByTitle(/barbarian die face/i)).toBeInTheDocument();
  });

  it('handles roll statistics reset', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    // Make some rolls
    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    fireEvent.click(button);
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Verify stats
    expect(screen.getByText('Total Rolls: 2')).toBeInTheDocument();
    expect(screen.getByText(/average roll: 7/i)).toBeInTheDocument();
    expect(screen.getByText(/roll 2:/i)).toBeInTheDocument();

    // Reset stats
    fireEvent.click(screen.getByTitle('Reset statistics'));

    // Verify reset state
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.queryByText(/roll history/i)).not.toBeInTheDocument();
  });
});