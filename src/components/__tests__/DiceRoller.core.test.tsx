import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('prevents double rolls', () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    act(() => {
      fireEvent.click(button);
    });
    expect(button).toBeDisabled();

    act(() => {
      fireEvent.click(button);
    });
    expect(mockRoll).toHaveBeenCalledTimes(1);
  });

  it('handles sound preferences', () => {
    render(<DiceRoller />);
    const button = screen.getByRole('button', { name: /roll dice/i });

    act(() => {
      fireEvent.click(button);
    });
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    const soundToggle = screen.getByRole('button', { name: /disable sound/i });
    
    act(() => {
      fireEvent.click(soundToggle);
      fireEvent.click(button);
    });
    
    expect(mockAudio).toHaveBeenCalledTimes(1);
  });
});