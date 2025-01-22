import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

// Mock the audio API
const mockAudio = {
  play: jest.fn().mockImplementation(() => Promise.resolve()),
};

// Mock the Audio constructor
(global as any).Audio = jest.fn(() => mockAudio);

// Mock DiceRollerUtil
jest.mock('@/utils/diceRoller', () => ({
  DiceRoller: jest.fn().mockImplementation(() => ({
    roll: jest.fn()
      .mockReturnValueOnce({ dice1: 2, dice2: 3, sum: 5 })
      .mockReturnValueOnce({ dice1: 4, dice2: 5, sum: 9 }),
    setDiscardCount: jest.fn(),
    getRemainingRolls: jest.fn().mockReturnValue(31),
    setUseSpecialDie: jest.fn()
  }))
}));

describe('DiceRoller statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps track of roll statistics', async () => {
    render(<DiceRoller />);

    const rollButton = screen.getByText(/Roll Dice/i);

    // First roll
    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for roll animation
    });

    // After first roll (2 + 3 = 5)
    expect(screen.getByText(/Total Rolls: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Average Roll: 5.0/)).toBeInTheDocument();

    // Second roll
    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for roll animation
    });

    // After second roll (4 + 5 = 9)
    expect(screen.getByText(/Total Rolls: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Average Roll: 7.0/)).toBeInTheDocument(); // (5 + 9) / 2 = 7
  });

  it('can reset statistics', async () => {
    render(<DiceRoller />);

    const rollButton = screen.getByText(/Roll Dice/i);

    await act(async () => {
      fireEvent.click(rollButton);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Check stats are tracked
    expect(screen.getByText(/Total Rolls: 1/)).toBeInTheDocument();

    // Find and click reset button
    const resetButton = screen.getByTitle('Reset statistics');
    fireEvent.click(resetButton);

    // Verify stats are reset
    expect(screen.getByText(/Total Rolls: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Average Roll: 0.0/)).toBeInTheDocument();
  });

  it('handles discard count changes', async () => {
    const { container } = render(<DiceRoller />);

    const input = screen.getByTestId('discard-count');
    
    // Test valid discard count
    fireEvent.change(input, { target: { value: '10' } });
    expect(input).toHaveValue(10);

    // Test invalid discard count (should keep previous value)
    fireEvent.change(input, { target: { value: '36' } });
    expect(input).toHaveValue(10);

    // Test negative value (should keep previous value)
    fireEvent.change(input, { target: { value: '-1' } });
    expect(input).toHaveValue(10);
  });
  
  it('toggles sound', () => {
    render(<DiceRoller />);
    
    const soundToggle = screen.getByTestId('sound-toggle');
    
    // Sound starts enabled by default
    expect(soundToggle).toHaveAttribute('aria-label', 'Disable sound');
    
    // Toggle sound off
    fireEvent.click(soundToggle);
    expect(soundToggle).toHaveAttribute('aria-label', 'Enable sound');
    
    // Toggle sound back on
    fireEvent.click(soundToggle);
    expect(soundToggle).toHaveAttribute('aria-label', 'Disable sound');
  });
});