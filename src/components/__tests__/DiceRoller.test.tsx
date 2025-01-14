import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader: () => <span data-testid="loader-icon" />,
  RotateCcw: () => <span data-testid="reset-icon" />,
  Volume2: () => <span data-testid="volume-on-icon" />,
  VolumeX: () => <span data-testid="volume-off-icon" />,
}));

// Mock DiceDisplay component
jest.mock('../DiceDisplay', () => ({
  __esModule: true,
  default: ({ roll }) => (
    <div data-testid="dice-display">
      {`${roll.dice1} + ${roll.dice2} = ${roll.sum}`}
      {roll.specialDie && ` (${roll.specialDie})`}
    </div>
  ),
}));

describe('DiceRoller', () => {
  const mockOnRoll = jest.fn();

  beforeEach(() => {
    mockOnRoll.mockClear();
  });

  it('renders initial state correctly', () => {
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    expect(screen.getByLabelText(/discard count/i)).toHaveValue(4);
    expect(screen.getByText(/roll dice/i)).toBeInTheDocument();
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
  });

  it('handles dice roll', async () => {
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    const rollButton = screen.getByText(/roll dice/i);
    fireEvent.click(rollButton);
    
    // Wait for roll animation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });
    
    expect(mockOnRoll).toHaveBeenCalled();
    expect(screen.getByText('Total Rolls: 1')).toBeInTheDocument();
  });

  it('handles keyboard shortcut', async () => {
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    fireEvent.keyDown(document, { key: 'r' });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });
    
    expect(mockOnRoll).toHaveBeenCalled();
  });

  it('toggles sound', () => {
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    const soundButton = screen.getByLabelText(/disable sound/i);
    fireEvent.click(soundButton);
    
    expect(screen.getByLabelText(/enable sound/i)).toBeInTheDocument();
  });

  it('updates discard count', () => {
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    const discardInput = screen.getByLabelText(/discard count/i);
    fireEvent.change(discardInput, { target: { value: '10' } });
    
    expect(discardInput).toHaveValue(10);
  });

  it('resets statistics', async () => {
    render(<DiceRoller onRoll={mockOnRoll} />);
    
    // Roll dice first
    const rollButton = screen.getByText(/roll dice/i);
    fireEvent.click(rollButton);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });
    
    // Reset stats
    const resetButton = screen.getByTitle('Reset statistics');
    fireEvent.click(resetButton);
    
    expect(screen.getByText('Total Rolls: 0')).toBeInTheDocument();
  });
});
