import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import userEvent from '@testing-library/user-event';

// Mock DiceRollerUtil
jest.mock('@/utils/diceRoller');

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
  RotateCcw: () => <span>Reset</span>,
  Volume2: () => <span>Sound On</span>,
  VolumeX: () => <span>Sound Off</span>,
}));

describe('DiceRoller Core', () => {
  // Mock audio playback
  const mockPlay = jest.fn();
  let mockAudio: jest.Mock;
  const mockConsoleError = jest.fn();
  
  // Mock utility methods
  const mockRoll = jest.fn();
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));

    // Setup default mock behavior
    mockRoll.mockReturnValue({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });
    
    // Setup DiceRollerUtil mock
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

    // Setup global mocks
    (global as any).Audio = mockAudio;
    console.error = mockConsoleError;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state', () => {
    render(<DiceRoller />);
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.getByText('Remaining Rolls: 30')).toBeInTheDocument();
  });

  it('handles invalid discard count inputs', async () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    // Empty value
    await userEvent.clear(input);
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Non-numeric value
    await userEvent.type(input, 'abc');
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Negative value
    await userEvent.type(input, '-1');
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Too large value
    await userEvent.type(input, '36');
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Valid values
    await userEvent.type(input, '15');
    expect(input).toHaveValue(15);
    expect(mockSetDiscardCount).toHaveBeenCalledWith(15);
  });

  it('handles discard count errors', async () => {
    mockSetDiscardCount.mockImplementationOnce(() => {
      throw new Error('Failed to set discard count');
    });

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    await userEvent.clear(input);
    await userEvent.type(input, '10');

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2); // Initial + reinitialize
    expect(input).toHaveValue(10);
  });

  it('handles sound preferences', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    const soundButton = screen.getByRole('button', { name: /disable sound/i });

    // Sound initially enabled
    await user.click(rollButton);
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    // Disable sound
    mockAudio.mockClear();
    mockPlay.mockClear();
    await user.click(soundButton);
    expect(screen.getByRole('button', { name: /enable sound/i })).toBeInTheDocument();
    
    // Roll with sound disabled
    await user.click(rollButton);
    expect(mockAudio).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Re-enable sound
    await user.click(soundButton);
    expect(screen.getByRole('button', { name: /disable sound/i })).toBeInTheDocument();
    
    // Roll with sound re-enabled
    await user.click(rollButton);
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();
  });

  it('prevents simultaneous rolls', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    // Start first roll
    await user.click(rollButton);
    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(rollButton).toBeDisabled();
    
    // Try to roll again while first roll is in progress
    await user.click(rollButton);
    await user.click(rollButton);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('cleans up event listeners', async () => {
    const user = userEvent.setup({ delay: null });
    const { unmount } = render(<DiceRoller />);
    
    // Initial setup - keydown listener should be added
    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
    });
    expect(mockRoll).toHaveBeenCalledTimes(1);
    
    // Unmount and verify cleanup
    unmount();
    
    // Press 'r' again - should not trigger roll
    mockRoll.mockClear();
    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
    });
    expect(mockRoll).not.toHaveBeenCalled();
  });

  it('handles roll errors', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    // Mock roll to throw error
    const mockError = new Error('Roll failed');
    mockRoll.mockImplementationOnce(() => {
      throw mockError;
    });

    render(<DiceRoller />);
    const rollButton = screen.getByRole('button', { name: /roll dice/i });

    // Attempt roll
    await user.click(rollButton);
    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(rollButton).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Verify error handling
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error rolling dice:',
      mockError
    );
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2); // Initial + reinitialize
    expect(rollButton).not.toBeDisabled();
  });

  it('handles audio errors gracefully', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    // Make audio.play() reject
    mockPlay.mockRejectedValueOnce(new Error('Audio failed'));

    render(<DiceRoller />);
    const rollButton = screen.getByRole('button', { name: /roll dice/i });

    await user.click(rollButton);
    expect(mockPlay).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Roll should succeed even though audio failed
    expect(mockRoll).toHaveBeenCalled();
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });
});