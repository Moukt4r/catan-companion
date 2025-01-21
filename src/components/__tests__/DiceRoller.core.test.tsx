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
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Non-numeric value
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Negative value
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Too large value
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(4);
    expect(mockSetDiscardCount).not.toHaveBeenCalled();

    // Decimal value (should be rounded)
    fireEvent.change(input, { target: { value: '5.7' } });
    expect(input).toHaveValue(5);
    expect(mockSetDiscardCount).toHaveBeenCalledWith(5);
  });

  it('handles failed discard count updates', async () => {
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
    expect(DiceRollerUtil).toHaveBeenCalledTimes(2); // Initial + reinitialize
    expect(input).toHaveValue(10);
  });

  it('handles sound preferences', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    const soundButton = screen.getByRole('button', { name: /disable sound/i });

    // Sound initially enabled
    fireEvent.click(rollButton);
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });
    
    // Disable sound
    mockAudio.mockClear();
    mockPlay.mockClear();
    fireEvent.click(soundButton);
    expect(screen.getByRole('button', { name: /enable sound/i })).toBeInTheDocument();
    
    // Roll with sound disabled
    fireEvent.click(rollButton);
    expect(mockAudio).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Re-enable sound
    fireEvent.click(soundButton);
    expect(screen.getByRole('button', { name: /disable sound/i })).toBeInTheDocument();
    
    // Roll with sound re-enabled
    fireEvent.click(rollButton);
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();
  });

  it('prevents simultaneous rolls', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    // Start first roll
    fireEvent.click(rollButton);
    expect(screen.getByText(/rolling/i)).toBeInTheDocument();
    expect(rollButton).toBeDisabled();
    
    // Try to roll again while first roll is in progress
    fireEvent.click(rollButton);
    fireEvent.click(rollButton);
    
    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(mockRoll).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('cleans up event listeners', () => {
    const { unmount } = render(<DiceRoller />);
    
    // Initial setup - keydown listener should be added
    fireEvent.keyDown(document, { key: 'r' });
    expect(mockRoll).toHaveBeenCalledTimes(1);
    
    // Unmount and verify cleanup
    unmount();
    
    // Press 'r' again - should not trigger roll
    mockRoll.mockClear();
    fireEvent.keyDown(document, { key: 'r' });
    expect(mockRoll).not.toHaveBeenCalled();
  });
});