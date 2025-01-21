import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import '@testing-library/jest-dom';

// Mock DiceRollerUtil
jest.mock('@/utils/diceRoller');

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
  const mockRoll = jest.fn();
  const mockSetDiscardCount = jest.fn();
  const mockGetRemainingRolls = jest.fn().mockReturnValue(30);
  const originalError = console.error;
  const onRollMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockPlay.mockResolvedValue(undefined);
    mockAudio = jest.fn(() => ({ play: mockPlay }));

    mockRoll.mockReturnValue({
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    });

    mockSetDiscardCount.mockImplementation(() => {});
    
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    }));

    (global as any).Audio = mockAudio;
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    console.error = originalError;
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    expect(input).toHaveValue("4");
    expect(screen.getByTestId('roll-button')).toBeEnabled();
    expect(screen.getByLabelText(/disable sound/i)).toBeInTheDocument();
  });

  it('handles all discard count validation cases', () => {
    const instanceMock = {
      roll: mockRoll,
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: mockGetRemainingRolls
    };
    (DiceRollerUtil as jest.Mock).mockReturnValue(instanceMock);

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    // Test non-numeric input
    act(() => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Test valid input
    act(() => {
      fireEvent.change(input, { target: { value: '15' } });
    });
    expect(mockSetDiscardCount).toHaveBeenCalled();
  });

  it('reinitializes dice roller when setting discard count fails', () => {
    const error = new Error('Failed to set discard count');
    const mockInstance = {
      roll: mockRoll,
      setDiscardCount: jest.fn(() => { throw error; }),
      getRemainingRolls: mockGetRemainingRolls
    };
    (DiceRollerUtil as jest.Mock)
      .mockReturnValueOnce(mockInstance)
      .mockReturnValueOnce({
        roll: mockRoll,
        setDiscardCount: mockSetDiscardCount,
        getRemainingRolls: mockGetRemainingRolls
      });

    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    act(() => {
      fireEvent.change(input, { target: { value: '10' } });
    });

    expect(console.error).toHaveBeenLastCalledWith('Error setting discard count:', error);
    expect(DiceRollerUtil).toHaveBeenLastCalledWith(10, true);
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
    expect(button.className).toContain('disabled:opacity-50');
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

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    // Test cleanup
    unmount();
    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });
    expect(mockRoll).toHaveBeenCalledTimes(2); // Should not increment after unmount
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

  it('handles roll failures', async () => {
    const error = new Error('Roll failed');
    mockRoll.mockImplementationOnce(() => {
      throw error;
    });

    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    act(() => {
      fireEvent.click(button);
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenLastCalledWith('Error rolling dice:', error);
      expect(button).toBeEnabled();
    });
  });
});