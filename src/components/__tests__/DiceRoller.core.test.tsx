import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock the dice roller utility
jest.mock('@/utils/diceRoller');

// Mock Audio
const mockPlay = jest.fn();
global.Audio = jest.fn().mockImplementation(() => ({
  play: mockPlay
}));

describe('DiceRoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
  });

  it('renders with initial state', () => {
    render(<DiceRoller />);
    expect(screen.getByTestId('roll-button')).toHaveTextContent('Roll Dice (Press R)');
    expect(screen.getByText(/Discard Count \(0-35\):/i)).toBeInTheDocument();
    expect(screen.getByTestId('volume-2-icon')).toBeInTheDocument();
  });

  it('handles dice rolling', async () => {
    const mockRoll = {
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: 'merchant'
    };

    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: () => mockRoll,
      setDiscardCount: jest.fn(),
      getRemainingRolls: () => 30
    }));

    const onRoll = jest.fn();
    render(<DiceRoller onRoll={onRoll} />);

    const rollButton = screen.getByTestId('roll-button');
    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(onRoll).toHaveBeenCalledWith(mockRoll);
    expect(screen.getByTestId('total-rolls')).toHaveTextContent('Total Rolls: 1');
    expect(screen.getByTestId('average-roll')).toHaveTextContent('Average Roll: 7.0');
  });

  it('handles discard count changes', () => {
    const mockSetDiscardCount = jest.fn();
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: () => 30
    }));

    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count');
    fireEvent.change(input, { target: { value: '5' } });

    expect(mockSetDiscardCount).toHaveBeenCalledWith(5);
  });

  it('handles invalid discard count changes', () => {
    const mockSetDiscardCount = jest.fn(() => {
      throw new Error('Invalid discard count');
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: () => 30
    }));

    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count');
    
    act(() => {
      fireEvent.change(input, { target: { value: '5' } });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );

    // Verify that a new DiceRollerUtil instance was created
    expect(DiceRollerUtil).toHaveBeenCalledWith(5, true);

    consoleErrorSpy.mockRestore();
  });

  it('handles errors during roll', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: () => {
        throw new Error('Roll failed');
      },
      getRemainingRolls: () => 30
    }));

    render(<DiceRoller />);

    const rollButton = screen.getByTestId('roll-button');
    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error rolling dice:',
      expect.any(Error)
    );

    // Verify that a new DiceRollerUtil instance was created
    expect(DiceRollerUtil).toHaveBeenCalledWith(4, true);

    consoleErrorSpy.mockRestore();
  });

  it('handles keyboard rolls', async () => {
    const mockRoll = {
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    };

    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: () => mockRoll,
      getRemainingRolls: () => 30
    }));

    render(<DiceRoller />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'r' });
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(screen.getByTestId('total-rolls')).toHaveTextContent('Total Rolls: 1');
    expect(screen.getByTestId('average-roll')).toHaveTextContent('Average Roll: 7.0');
  });

  it('toggles sound and handles audio play errors', async () => {
    // Mock audio.play to reject
    mockPlay.mockRejectedValue(new Error('Audio playback failed'));
    
    render(<DiceRoller />);
    const soundButton = screen.getByTestId('sound-toggle');
    expect(screen.getByTestId('volume-2-icon')).toBeInTheDocument();
    
    // Test sound toggle
    fireEvent.click(soundButton);
    expect(screen.getByTestId('volume-x-icon')).toBeInTheDocument();
    
    // Enable sound again
    fireEvent.click(soundButton);
    expect(screen.getByTestId('volume-2-icon')).toBeInTheDocument();
    
    // Try to roll with sound on but audio.play failing
    const rollButton = screen.getByTestId('roll-button');
    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 600));
    });
    
    // Should continue without error
    expect(mockPlay).toHaveBeenCalled();
  });

  it('resets statistics', async () => {
    const mockRoll = {
      dice1: 3,
      dice2: 4,
      sum: 7,
      specialDie: null
    };

    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      roll: () => mockRoll,
      getRemainingRolls: () => 30
    }));

    render(<DiceRoller />);

    // First roll
    await act(async () => {
      fireEvent.click(screen.getByTestId('roll-button'));
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    // Reset stats
    fireEvent.click(screen.getByTestId('reset-stats'));
    expect(screen.getByTestId('total-rolls')).toHaveTextContent('Total Rolls: 0');
    expect(screen.getByTestId('average-roll')).toHaveTextContent('Average Roll: 0.0');
  });
});