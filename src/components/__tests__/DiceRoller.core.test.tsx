import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock the dice roller utility
jest.mock('@/utils/diceRoller');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Volume2: () => <span data-testid="volume-2-icon">Volume2</span>,
  VolumeX: () => <span data-testid="volume-x-icon">VolumeX</span>,
  Loader: () => <span data-testid="loader-icon">Loader</span>,
  RotateCcw: () => <span data-testid="rotate-ccw-icon">RotateCcw</span>
}));

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
    expect(screen.getByText(/Roll Dice \\(Press R\\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Discard Count \\(0-35\\):/i)).toBeInTheDocument();
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

    const rollButton = screen.getByText(/Roll Dice/i);
    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(onRoll).toHaveBeenCalledWith(mockRoll);
    expect(screen.getByText(/3 \\+ 4 = 7/)).toBeInTheDocument();
  });

  it('handles discard count changes', () => {
    const mockSetDiscardCount = jest.fn();
    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      setDiscardCount: mockSetDiscardCount,
      getRemainingRolls: () => 30
    }));

    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    fireEvent.change(input, { target: { value: '5' } });

    expect(mockSetDiscardCount).toHaveBeenCalledWith(5);
  });

  it('handles invalid discard count changes', () => {
    const mockSetDiscardCount = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (DiceRollerUtil as jest.Mock).mockImplementation(() => ({
      setDiscardCount: () => {
        throw new Error('Invalid discard count');
      },
      getRemainingRolls: () => 30
    }));

    render(<DiceRoller />);
    const input = screen.getByLabelText(/Discard Count/i);
    fireEvent.change(input, { target: { value: '5' } });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error setting discard count:',
      expect.any(Error)
    );

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

    const rollButton = screen.getByText(/Roll Dice/i);
    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error rolling dice:',
      expect.any(Error)
    );

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

    expect(screen.getByText(/3 \\+ 4 = 7/)).toBeInTheDocument();
  });

  it('toggles sound', () => {
    render(<DiceRoller />);
    const soundButton = screen.getByLabelText(/Disable sound/i);
    expect(screen.getByTestId('volume-2-icon')).toBeInTheDocument();
    
    fireEvent.click(soundButton);
    expect(screen.getByLabelText(/Enable sound/i)).toBeInTheDocument();
    expect(screen.getByTestId('volume-x-icon')).toBeInTheDocument();
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
      fireEvent.click(screen.getByText(/Roll Dice/i));
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    // Reset stats
    const resetButton = screen.getByTitle(/Reset statistics/i);
    expect(screen.getByTestId('rotate-ccw-icon')).toBeInTheDocument();
    fireEvent.click(resetButton);

    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
    expect(screen.getByText('Average Roll: 0.0')).toBeInTheDocument();
  });
});