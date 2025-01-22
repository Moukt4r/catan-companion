import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

// Mock the audio API
const mockAudio = {
  play: jest.fn().mockImplementation(() => Promise.resolve()),
};

// Mock the Audio constructor
(global as any).Audio = jest.fn(() => mockAudio);

describe('DiceRoller statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps track of roll statistics', async () => {
    render(<DiceRoller />);

    const rollButton = screen.getByText(/Roll Dice/i);

    // Mock the random dice rolls to test statistics
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2) // First roll: dice1 = 2
      .mockReturnValueOnce(0.4) // First roll: dice2 = 3
      .mockReturnValueOnce(0.6) // Second roll: dice1 = 4
      .mockReturnValueOnce(0.8); // Second roll: dice2 = 5

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

    // Do one roll first
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.4);

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
});
