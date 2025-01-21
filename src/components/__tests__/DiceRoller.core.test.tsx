import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock DiceRollerUtil
jest.mock('@/utils/diceRoller');

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
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
    expect(screen.getByTestId('discard-count-input')).toHaveValue(4);
    expect(screen.getByTestId('roll-button')).toBeInTheDocument();
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.getByText('Remaining Rolls: 30')).toBeInTheDocument();
  });

  it('handles discard count changes correctly', async () => {
    const user = userEvent.setup();
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');

    await user.clear(input);
    await user.type(input, '15');
    expect(input).toHaveValue(15);
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2); // Initial + new value
  });

  it('handles discard count errors', async () => {
    (DiceRollerUtil as jest.Mock).mockImplementationOnce(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    })).mockImplementationOnce(() => {
      throw new Error('Failed to initialize');
    });

    const user = userEvent.setup();
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');
    
    await user.clear(input);
    await user.type(input, '10');

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );
  });

  it('handles sound preferences', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<DiceRoller />);
    
    const rollButton = screen.getByTestId('roll-button');
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
    
    // Roll with sound disabled
    await user.click(rollButton);
    expect(mockAudio).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
  });

  it('prevents simultaneous rolls', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(<DiceRoller />);
    
    const rollButton = screen.getByTestId('roll-button');
    
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
    const user = userEvent.setup();
    const { unmount } = render(<DiceRoller />);

    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(event);
    });
    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Unmount and verify cleanup
    unmount();
    mockRoll.mockClear();

    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(event);
    });
    expect(mockRoll).not.toHaveBeenCalled();
  });

  it('handles roll errors', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    const mockError = new Error('Roll failed');
    mockRoll.mockImplementationOnce(() => {
      throw mockError;
    });

    render(<DiceRoller />);
    const rollButton = screen.getByTestId('roll-button');

    await user.click(rollButton);
    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(rollButton).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

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
    mockPlay.mockRejectedValueOnce(new Error('Audio failed'));

    render(<DiceRoller />);
    const rollButton = screen.getByTestId('roll-button');

    await user.click(rollButton);
    expect(mockPlay).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Roll should succeed even though audio failed
    expect(mockRoll).toHaveBeenCalled();
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup();
    render(<DiceRoller />);

    // Press R key
    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(event);
    });
    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Press R key while rolling
    mockRoll.mockClear();
    await act(async () => {
      const event = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(event);
    });
    expect(mockRoll).toHaveBeenCalledTimes(1);
  });
});