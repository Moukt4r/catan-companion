import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock the DiceRollerUtil
jest.mock('@/utils/diceRoller');

// Mock the Lucide icons
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

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(mockConsoleError);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));
    
    // Setup DiceRollerUtil mock for each test
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

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
  });

  it('handles roll action', async () => {
    jest.useFakeTimers();
    const onRoll = jest.fn();
    render(<DiceRoller onRoll={onRoll} />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalled();
    expect(onRoll).toHaveBeenCalledWith(defaultRoll);
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

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error rolling dice:',
      expect.any(Error)
    );
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2);
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
  });

  it('handles audio play errors gracefully', async () => {
    jest.useFakeTimers();
    mockPlay.mockRejectedValueOnce(new Error('Audio failed to play'));

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });
    
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve(); // Let the audio promise reject
      jest.advanceTimersByTime(600);
    });

    expect(mockPlay).toHaveBeenCalled();
    expect(mockRoll).toHaveBeenCalled();
  });

  it('handles missing Audio API gracefully', async () => {
    jest.useFakeTimers();
    
    // Temporarily remove Audio API
    const Audio = (global as any).Audio;
    (global as any).Audio = undefined;

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Click should not throw even though Audio is undefined
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalled();

    // Restore Audio API
    (global as any).Audio = Audio;
  });

  it('handles invalid Audio object gracefully', async () => {
    jest.useFakeTimers();
    
    // Mock an Audio object without the play method
    mockAudio.mockReturnValueOnce({});

    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    // Click should not throw even though play is undefined
    await act(async () => {
      fireEvent.click(button);
      jest.advanceTimersByTime(600);
    });

    expect(mockAudio).toHaveBeenCalled();
    expect(mockRoll).toHaveBeenCalled();
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

  it('toggles sound and handles errors during roll', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    // First disable sound
    const soundButton = screen.getByRole('button', { name: /disable sound/i });
    fireEvent.click(soundButton);

    // Clear mocks after toggling
    mockAudio.mockClear();
    mockPlay.mockClear();

    // Roll with sound disabled
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Verify no audio was attempted with sound disabled
    expect(mockAudio).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
    expect(mockRoll).toHaveBeenCalled();
  });

  it('validates discard count range', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(4);

    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(4);

    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);
  });

  it('resets statistics', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(rollButton);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/total rolls: 1/i)).toBeInTheDocument();

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByText(/total rolls: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/average roll: 0\.0/i)).toBeInTheDocument();
  });

  it('prevents multiple simultaneous rolls', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    
    fireEvent.click(button);
    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/rolling/i)).not.toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    render(<DiceRoller />);
    fireEvent.keyDown(document, { key: 'r' });
    
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();
  });

  it('ignores non-r key presses', () => {
    render(<DiceRoller />);
    fireEvent.keyDown(document, { key: 'a' });
    
    expect(mockAudio).not.toHaveBeenCalled();
    expect(mockRoll).not.toHaveBeenCalled();
  });

  it('handles non-numeric discard count input', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(4);

    fireEvent.change(input, { target: { value: '5.5' } });
    expect(input).toHaveValue(5);
  });
});