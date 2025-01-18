import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <span>Loading...</span>,
  RotateCcw: () => <span>Reset</span>,
  Volume2: () => <span>Sound On</span>,
  VolumeX: () => <span>Sound Off</span>,
}));

// Mock the audio playback
const mockPlay = jest.fn();
const mockAudio = jest.fn(() => ({
  play: mockPlay,
}));
(global as any).Audio = mockAudio;

describe('DiceRoller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlay.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller />);
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
  });

  it('allows changing discard count', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);
    
    act(() => {
      fireEvent.change(input, { target: { value: '8' } });
    });

    expect(input).toHaveValue(8);
  });

  it('handles roll action', async () => {
    jest.useFakeTimers();
    const onRoll = jest.fn();
    render(<DiceRoller onRoll={onRoll} />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
    expect(mockPlay).toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(onRoll).toHaveBeenCalled();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('updates statistics after rolling', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/total rolls: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/average roll/i)).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    render(<DiceRoller />);

    act(() => {
      fireEvent.keyDown(document, { key: 'r' });
    });

    expect(mockAudio).toHaveBeenCalledWith('/dice-roll.mp3');
  });

  it('toggles sound', () => {
    render(<DiceRoller />);
    const soundButton = screen.getByRole('button', { name: /disable sound/i });

    fireEvent.click(soundButton);

    expect(screen.getByRole('button', { name: /enable sound/i })).toBeInTheDocument();
  });

  it('validates discard count range', () => {
    render(<DiceRoller />);
    const input = screen.getByLabelText(/discard count/i);

    // Test minimum value
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(4);

    // Test maximum value
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(4);

    // Test valid value
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);
  });

  it('resets statistics', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);
    
    // Roll dice
    const button = screen.getByRole('button', { name: /roll dice/i });
    fireEvent.click(button);

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    // Reset stats
    const resetButton = screen.getByTitle(/reset statistics/i);
    fireEvent.click(resetButton);

    expect(screen.getByText(/total rolls: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/average roll: 0\.0/i)).toBeInTheDocument();
  });

  it('handles roll history', async () => {
    jest.useFakeTimers();
    render(<DiceRoller />);

    const button = screen.getByRole('button', { name: /roll dice/i });

    // Roll multiple times
    for (let i = 0; i < 3; i++) {
      fireEvent.click(button);
      await act(async () => {
        jest.advanceTimersByTime(600);
      });
    }

    expect(screen.getByText(/roll history/i)).toBeInTheDocument();
    expect(screen.getByText(/roll 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/roll 2:/i)).toBeInTheDocument();
    expect(screen.getByText(/roll 3:/i)).toBeInTheDocument();
  });
});
