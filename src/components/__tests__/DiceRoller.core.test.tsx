import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import '@testing-library/jest-dom';

// Mock DiceRollerUtil
const mockRoll = jest.fn().mockReturnValue({
  dice1: 3,
  dice2: 4,
  sum: 7,
  specialDie: null
});

const mockGetRemainingRolls = jest.fn().mockReturnValue(30);

jest.mock('@/utils/diceRoller', () => ({
  DiceRoller: jest.fn().mockImplementation(() => ({
    roll: mockRoll,
    getRemainingRolls: mockGetRemainingRolls
  }))
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
  Volume2: () => <span data-testid="volume-on-icon">Sound On</span>,
  VolumeX: () => <span data-testid="volume-off-icon">Sound Off</span>,
  RotateCcw: () => <span data-testid="reset-icon">Reset</span>,
}));

describe('DiceRoller Core', () => {
  const mockPlay = jest.fn();
  let mockAudio: jest.Mock;
  const onRollMock = jest.fn();
  const originalError = console.error;
  const originalWarn = console.warn;
  let throwError = false;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));
    
    (global as any).Audio = mockAudio;
    console.error = jest.fn();
    console.warn = jest.fn();

    // Reset mock implementation
    jest.mocked(DiceRollerUtil).mockImplementation(() => {
      if (throwError) {
        throw new Error('Failed to initialize');
      }
      return {
        roll: mockRoll,
        getRemainingRolls: mockGetRemainingRolls
      };
    });

    throwError = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    console.error = originalError;
    console.warn = originalWarn;
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');
    expect(input).toHaveValue("4");
    expect(screen.getByTestId('roll-button')).toBeEnabled();
    expect(screen.getByLabelText(/disable sound/i)).toBeInTheDocument();
  });

  it('validates discard count inputs', async () => {
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');
    
    // Test invalid values
    act(() => {
      fireEvent.change(input, { target: { value: '-1' } });
    });
    expect(input).toHaveValue("-1");

    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    expect(input).toHaveValue("abc");

    // Test valid value
    act(() => {
      fireEvent.change(input, { target: { value: '15' } });
    });
    expect(input).toHaveValue("15");
  });

  it('handles roll process with sound', async () => {
    render(<DiceRoller onRoll={onRollMock} />);
    const button = screen.getByTestId('roll-button');

    // Initial state
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent(/roll dice/i);
    expect(button.className).toContain('disabled:opacity-50');

    // Click the button
    act(() => {
      fireEvent.click(button);
    });

    // During rolling
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/rolling/i);
    expect(mockPlay).toHaveBeenCalled();

    // Advance timer to complete roll
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
      expect(button).toHaveTextContent(/roll dice/i);
      expect(onRollMock).toHaveBeenCalledWith(expect.objectContaining({
        dice1: 3,
        dice2: 4,
        sum: 7
      }));
    });
  });

  it('handles roll process without sound', async () => {
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');
    const soundToggle = screen.getByLabelText(/disable sound/i);

    // Turn off sound
    act(() => {
      fireEvent.click(soundToggle);
    });

    mockPlay.mockClear();

    // Click roll button
    act(() => {
      fireEvent.click(button);
    });

    expect(mockPlay).not.toHaveBeenCalled();

    // Complete the roll
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });

  it('responds to keyboard events and cleans up', async () => {
    const { unmount } = render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    // Test roll with 'R' key
    act(() => {
      fireEvent.keyDown(document, { key: 'R' });
    });
    expect(button).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    // Test roll with 'r' key
    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });
    expect(button).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Test cleanup
    unmount();
    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });
    expect(mockRoll).toHaveBeenCalledTimes(2);
  });

  it('prevents multiple simultaneous rolls', async () => {
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    // Start first roll
    act(() => {
      fireEvent.click(button);
    });

    // Try to roll again while first roll is in progress
    act(() => {
      fireEvent.click(button);
    });

    // Complete the roll
    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalledTimes(1);
    });
  });

  it('handles initialization failures', async () => {
    throwError = true;
    render(<DiceRoller />);
    expect(console.error).toHaveBeenCalledWith('Error initializing dice roller:', expect.any(Error));
  });
});