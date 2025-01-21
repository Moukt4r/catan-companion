import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    // Make sure timers are cleaned up
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
    const user = userEvent.setup();
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');

    // Clear and enter new value
    await user.clear(input);
    await user.type(input, '15');

    expect(input).toHaveValue('15');
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2);
  });

  it('handles discard count errors', async () => {
    const user = userEvent.setup();
    
    const error = new Error('Failed to initialize');
    (DiceRollerUtil as jest.Mock)
      .mockImplementationOnce(() => ({
        roll: mockRoll,
        setDiscardCount: mockSetDiscardCount,
        getRemainingRolls: mockGetRemainingRolls
      }))
      .mockImplementationOnce(() => { throw error; });

    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count-input');
    
    await user.clear(input);
    await user.type(input, '10');

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error setting discard count:',
      error
    );
  });

  it('handles keyboard shortcuts correctly', () => {
    render(<DiceRoller />);

    // Press 'r' key, should trigger roll
    fireEvent.keyDown(document, { key: 'r' });
    jest.advanceTimersByTime(600);
    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Press 'R' key (uppercase), should also work
    mockRoll.mockClear();
    fireEvent.keyDown(document, { key: 'R' });
    jest.advanceTimersByTime(600);
    expect(mockRoll).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listeners properly', () => {
    const { unmount } = render(<DiceRoller />);

    // Press 'r' key before unmount
    fireEvent.keyDown(document, { key: 'r' });
    jest.advanceTimersByTime(600);
    expect(mockRoll).toHaveBeenCalledTimes(1);

    // Unmount and try pressing 'r' again
    mockRoll.mockClear();
    unmount();
    fireEvent.keyDown(document, { key: 'r' });
    jest.advanceTimersByTime(600);
    expect(mockRoll).not.toHaveBeenCalled();
  });

  it('prevents simultaneous rolls', async () => {
    const user = userEvent.setup();
    render(<DiceRoller />);
    const button = screen.getByTestId('roll-button');

    // Start first roll
    await user.click(button);
    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Try clicking again while rolling
    await user.click(button);
    await user.click(button);

    // Only one roll should have occurred
    expect(mockRoll).toHaveBeenCalledTimes(1);
  });

  it('handles sound toggling correctly', async () => {
    const user = userEvent.setup();
    render(<DiceRoller />);

    const soundButton = screen.getByRole('button', { name: /disable sound/i });
    const rollButton = screen.getByTestId('roll-button');

    // Initial roll with sound enabled
    await user.click(rollButton);
    jest.advanceTimersByTime(600);
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    // Disable sound
    mockAudio.mockClear();
    mockPlay.mockClear();
    await user.click(soundButton);

    // Roll with sound disabled
    await user.click(rollButton);
    jest.advanceTimersByTime(600);
    expect(mockAudio).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('resets statistics properly', async () => {
    const user = userEvent.setup();
    render(<DiceRoller />);

    // Do some rolls first
    const rollButton = screen.getByTestId('roll-button');
    await user.click(rollButton);
    jest.advanceTimersByTime(600);

    // Reset stats
    const resetButton = screen.getByTestId('reset-button');
    await user.click(resetButton);

    // Check everything is reset
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
    expect(screen.queryByTestId('roll-history')).not.toBeInTheDocument();
  });
});