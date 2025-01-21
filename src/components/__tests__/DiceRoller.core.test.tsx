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

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state', () => {
    render(<DiceRoller />);
    expect(screen.getByTestId('discard-count-input')).toHaveValue('4');
    expect(screen.getByTestId('roll-button')).toBeInTheDocument();
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.getByText('Remaining Rolls: 30')).toBeInTheDocument();
  });

  it('handles discard count changes correctly', async () => {
    const { rerender } = render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');

    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, '15');
      rerender(<DiceRoller />);
    });

    expect(input).toHaveValue('15');
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2);
  });

  it('handles discard count errors', async () => {
    (DiceRollerUtil as jest.Mock)
      .mockImplementationOnce(() => ({
        roll: mockRoll,
        setDiscardCount: mockSetDiscardCount,
        getRemainingRolls: mockGetRemainingRolls
      }))
      .mockImplementationOnce(() => {
        throw new Error('Failed to initialize');
      });

    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');
    
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, '10');
    });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );
  });

  it('handles sound preferences', async () => {
    render(<DiceRoller />);
    
    const rollButton = screen.getByTestId('roll-button');
    const soundButton = screen.getByRole('button', { name: /disable sound/i });

    // Sound initially enabled
    await act(async () => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    // Disable sound
    mockAudio.mockClear();
    mockPlay.mockClear();

    await act(async () => {
      fireEvent.click(soundButton);
    });

    // Roll with sound disabled
    await act(async () => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    expect(mockAudio).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('prevents simultaneous rolls', async () => {
    render(<DiceRoller />);
    const rollButton = screen.getByTestId('roll-button');
    
    await act(async () => {
      fireEvent.click(rollButton);
    });

    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(rollButton).toBeDisabled();

    await act(async () => {
      fireEvent.click(rollButton);
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('cleans up event listeners', async () => {
    const { unmount } = render(<DiceRoller />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
      await Promise.resolve();
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);

    unmount();
    mockRoll.mockClear();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
      await Promise.resolve();
    });

    expect(mockRoll).not.toHaveBeenCalled();
  });

  it('handles keyboard shortcuts', async () => {
    render(<DiceRoller />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
      await Promise.resolve();
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Press the key while rolling (should be ignored)
    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
      await Promise.resolve();
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Reset rolling state
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Press the key again (should work)
    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
      await Promise.resolve();
    });

    expect(mockRoll).toHaveBeenCalledTimes(2);
  });

  it('tracks roll history', () => {
    render(<DiceRoller />);
    const rollButton = screen.getByTestId('roll-button');

    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText('Roll 1: 3 + 4 = 7')).toBeInTheDocument();
  });

  it('resets statistics correctly', async () => {
    render(<DiceRoller />);
    const rollButton = screen.getByTestId('roll-button');
    const resetButton = screen.getByTestId('reset-button');
    
    await act(async () => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(resetButton);
    });

    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
  });
});