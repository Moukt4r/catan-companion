import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
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
  const mockPlay = jest.fn();
  let mockAudio: jest.Mock;
  const mockConsoleError = jest.fn();
  const mockRoll = jest.fn();
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));

    mockRoll.mockReturnValue({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });
    
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

    (global as any).Audio = mockAudio;
    console.error = mockConsoleError;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state', () => {
    render(<DiceRoller />);
    expect(screen.getByTestId('discard-count-input')).toHaveValue('4');
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeEnabled();
  });

  it('updates discard count', () => {
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');
    
    act(() => {
      fireEvent.change(input, { target: { value: '15' } });
    });

    expect(input).toHaveValue('15');
    expect(DiceRollerUtil).toHaveBeenCalled();
  });

  it('handles invalid discard counts', () => {
    (DiceRollerUtil as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Failed to initialize');
    });

    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');
    
    act(() => {
      fireEvent.change(input, { target: { value: '10' } });
    });

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );
  });

  it('prevents simultaneous rolls', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    // First click
    act(() => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    // Second click while first is processing
    act(() => {
      fireEvent.click(button);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  }, 10000);

  it('handles sound toggling correctly', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const soundToggle = screen.getByRole('button', { name: /toggle sound/i });
    const rollButton = screen.getByTestId('roll-button');

    // Initial roll with sound
    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    // Toggle sound off
    act(() => {
      fireEvent.click(soundToggle);
      jest.advanceTimersByTime(100);
    });

    // Roll without sound
    act(() => {
      fireEvent.click(rollButton);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  }, 10000);

  it('resets statistics properly', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    // Perform multiple rolls
    const button = screen.getByTestId('roll-button');
    const resetButton = screen.getByTestId('reset-stats-button');

    // Do some rolls
    for (let i = 0; i < 3; i++) {
      act(() => {
        fireEvent.click(button);
        jest.advanceTimersByTime(100);
      });
    }

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalledTimes(3);
    });

    // Reset stats
    act(() => {
      fireEvent.click(resetButton);
      jest.advanceTimersByTime(100);
    });

    // Verify stats reset
    await waitFor(() => {
      const stats = screen.getByTestId('stats-display');
      expect(stats).toHaveTextContent('0');
    });

    jest.useRealTimers();
  }, 10000);

  it('responds to keyboard events', () => {
    render(<DiceRoller />);

    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });

    expect(mockRoll).toHaveBeenCalled();
  });

  it('cleans up event listeners', () => {
    const { unmount } = render(<DiceRoller />);

    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });
    expect(mockRoll).toHaveBeenCalled();

    mockRoll.mockClear();
    unmount();

    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });
    expect(mockRoll).not.toHaveBeenCalled();
  });
});
