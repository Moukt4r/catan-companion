import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

describe('DiceRoller Edge Cases', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('handles conditional rendering of dice', async () => {
    const { rerender } = render(<DiceRoller />);

    // Initially no dice
    expect(screen.queryByRole('img', { name: /first die/i })).not.toBeInTheDocument();

    // First roll
    fireEvent.click(screen.getByTestId('roll-button'));
    await act(async () => {
      await new Promise(resolve => resolve()); // Force Promise branch
      jest.runAllTimers();
    });

    // Check dice is shown
    expect(screen.getByRole('img', { name: /first die/i })).toBeInTheDocument();
    
    // Clear current roll
    rerender(
      <DiceRoller currentRoll={null} />
    );

    // Check dice is hidden
    expect(screen.queryByRole('img', { name: /first die/i })).not.toBeInTheDocument();
  });

  it('handles discard count validation edge cases', () => {
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count');

    [
      { value: 'abc', expected: 4 },
      { value: '-1', expected: 4 },
      { value: '36', expected: 4 },
      { value: '35', expected: 35 },
      { value: '0', expected: 0 },
      { value: '17', expected: 17 }
    ].forEach(({ value, expected }) => {
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(expected);
    });
  });

  it('handles roll error cases', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Roll failed');
    jest.spyOn(DiceRollerUtil.prototype, 'roll').mockImplementationOnce(() => {
      throw mockError;
    });

    render(<DiceRoller />);
    fireEvent.click(screen.getByTestId('roll-button'));
    
    await act(async () => {
      jest.runAllTimers();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error rolling dice:', mockError);
    consoleSpy.mockRestore();
  });

  it('handles sound toggle', async () => {
    const playMock = jest.fn().mockResolvedValue(undefined);
    window.Audio.prototype.play = playMock;

    render(<DiceRoller />);
    
    // Default state - sound enabled
    fireEvent.click(screen.getByTestId('roll-button'));
    await act(async () => {
      jest.runAllTimers();
    });
    expect(playMock).toHaveBeenCalledTimes(1);

    // Disable sound
    fireEvent.click(screen.getByTestId('sound-toggle'));
    
    // Roll with sound disabled
    fireEvent.click(screen.getByTestId('roll-button'));
    await act(async () => {
      jest.runAllTimers();
    });
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('handles key press for roll', async () => {
    render(<DiceRoller />);
    const rollButton = screen.getByTestId('roll-button');

    fireEvent.keyDown(document, { key: 'R' });
    
    await act(async () => {
      jest.runAllTimers();
    });
    
    expect(screen.getByRole('img', { name: /first die/i })).toBeInTheDocument();
  });
});