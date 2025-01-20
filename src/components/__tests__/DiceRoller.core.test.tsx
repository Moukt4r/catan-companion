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

describe('DiceRoller - Core Functionality', () => {
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

  // Store original Audio constructor
  const OriginalAudio = global.Audio;

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
    // Restore Audio constructor
    (global as any).Audio = OriginalAudio;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('initialization and rendering', () => {
    it('renders initial state correctly', () => {
      render(<DiceRoller />);
      expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
      expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
      expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
      expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
      expect(screen.getByText('Remaining Rolls: 30')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /roll history/i })).not.toBeInTheDocument();
    });

    // Add test for sound toggle functionality
    it('toggles sound and correctly controls audio', async () => {
      jest.useFakeTimers();
      render(<DiceRoller />);
      
      // Initially sound should be enabled
      const soundButton = screen.getByRole('button', { name: /disable sound/i });
      expect(screen.getByText('Sound On')).toBeInTheDocument();
      expect(soundButton).toHaveAccessibleName('Disable sound');
      
      // Roll with sound enabled
      const rollButton = screen.getByRole('button', { name: /roll dice/i });
      fireEvent.click(rollButton);
      expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
      expect(mockPlay).toHaveBeenCalled();
      
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
      
      mockAudio.mockClear();
      mockPlay.mockClear();

      // Disable sound
      fireEvent.click(soundButton);
      expect(screen.getByText('Sound Off')).toBeInTheDocument();
      expect(soundButton).toHaveAccessibleName('Enable sound');
      
      // Roll with sound disabled
      fireEvent.click(rollButton);
      expect(mockAudio).not.toHaveBeenCalled();
      expect(mockPlay).not.toHaveBeenCalled();
      
      await act(async () => {
        jest.advanceTimersByTime(600);
      });

      // Re-enable sound
      fireEvent.click(soundButton);
      expect(screen.getByText('Sound On')).toBeInTheDocument();
      expect(soundButton).toHaveAccessibleName('Disable sound');
      
      // Roll with sound re-enabled
      fireEvent.click(rollButton);
      expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  describe('rolling functionality', () => {
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
  });

  describe('error handling', () => {
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
      expect(button).not.toBeDisabled();
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

      // Test empty value
      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue(4);
      expect(mockSetDiscardCount).not.toHaveBeenCalled();
      
      // Test non-numeric values
      fireEvent.change(input, { target: { value: 'abc' } });
      expect(input).toHaveValue(4);
      expect(mockSetDiscardCount).not.toHaveBeenCalled();

      // Test decimal values
      fireEvent.change(input, { target: { value: '5.5' } });
      expect(input).toHaveValue(5);
      expect(mockSetDiscardCount).toHaveBeenCalledWith(5);

      // Test boundary values
      mockSetDiscardCount.mockClear();
      fireEvent.change(input, { target: { value: '0' } });
      expect(input).toHaveValue(0);
      expect(mockSetDiscardCount).toHaveBeenCalledWith(0);

      mockSetDiscardCount.mockClear();
      fireEvent.change(input, { target: { value: '35' } });
      expect(input).toHaveValue(35);
      expect(mockSetDiscardCount).toHaveBeenCalledWith(35);

      // Test values in valid range
      mockSetDiscardCount.mockClear();
      fireEvent.change(input, { target: { value: '15' } });
      expect(input).toHaveValue(15);
      expect(mockSetDiscardCount).toHaveBeenCalledWith(15);
    });

    it('handles audio play errors gracefully', async () => {
      jest.useFakeTimers();
      mockPlay.mockRejectedValueOnce(new Error('Audio failed to play'));

      render(<DiceRoller />);
      const button = screen.getByRole('button', { name: /roll dice/i });
      
      await act(async () => {
        fireEvent.click(button);
        await Promise.resolve();
        jest.advanceTimersByTime(600);
      });

      expect(mockPlay).toHaveBeenCalled();
      expect(mockRoll).toHaveBeenCalled();
      expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
    });

    it('handles missing Audio API gracefully', async () => {
      jest.useFakeTimers();
      delete (global as any).Audio;

      render(<DiceRoller />);
      
      await act(async () => {
        const button = screen.getByRole('button', { name: /roll dice/i });
        fireEvent.click(button);
        jest.advanceTimersByTime(600);
      });

      expect(mockRoll).toHaveBeenCalled();
      expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
    });

    it('handles invalid Audio object gracefully', async () => {
      jest.useFakeTimers();
      (global as any).Audio = jest.fn(() => ({}));

      render(<DiceRoller />);
      
      await act(async () => {
        const button = screen.getByRole('button', { name: /roll dice/i });
        fireEvent.click(button);
        jest.advanceTimersByTime(600);
      });

      expect(mockRoll).toHaveBeenCalled();
      expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
    });
  });
});