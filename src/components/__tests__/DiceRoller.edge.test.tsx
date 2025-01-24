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

  it('handles dice roll timing and display', async () => {
    const mockSetTimeout = jest.spyOn(global, 'setTimeout');
    render(<DiceRoller />);

    // Initial state
    const rollButton = screen.getByTestId('roll-button');
    expect(screen.queryByRole('img', { name: /first die/i })).not.toBeInTheDocument();

    // Click and start roll
    fireEvent.click(rollButton);
    expect(rollButton).toBeDisabled();

    // Wait for partial promise resolution
    await act(async () => {
      // Force immediate promise resolution
      jest.runAllTimers();
    });

    // Verify promise timing
    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 600);
    expect(screen.getByRole('img', { name: /first die/i })).toBeInTheDocument();
  });

  it('handles discard count validation edge cases', () => {
    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count');

    // Test edge cases
    [
      { value: 'abc', expected: 4 },     // NaN
      { value: '-1', expected: 4 },      // Below minimum
      { value: '36', expected: 4 },      // Above maximum
      { value: '35', expected: 35 },     // Maximum
      { value: '0', expected: 0 },       // Minimum
      { value: '17', expected: 17 }      // Valid middle
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
    const rollButton = screen.getByTestId('roll-button');
    
    // Attempt roll that will error
    fireEvent.click(rollButton);
    await act(async () => {
      jest.runAllTimers();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error rolling dice:', mockError);
    expect(rollButton).not.toBeDisabled();
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
    expect(playMock).toHaveBeenCalledTimes(1); // Still only called once
  });

  it('handles error during discard count change', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Failed to set discard count');
    jest.spyOn(DiceRollerUtil.prototype, 'setDiscardCount').mockImplementationOnce(() => {
      throw mockError;
    });

    render(<DiceRoller />);
    const input = screen.getByTestId('discard-count');
    
    fireEvent.change(input, { target: { value: '10' } });

    expect(consoleSpy).toHaveBeenCalledWith('Error setting discard count:', mockError);
    expect(input).toHaveValue(10);
    
    consoleSpy.mockRestore();
  });

  it('handles key press for roll', async () => {
    render(<DiceRoller />);
    const rollButton = screen.getByTestId('roll-button');

    // Simulate 'R' key press
    fireEvent.keyDown(document, { key: 'R' });
    await act(async () => {
      jest.runAllTimers();
    });

    expect(rollButton).toBeDisabled(); // Should trigger roll
    
    await act(async () => {
      jest.runAllTimers();
    });

    expect(rollButton).not.toBeDisabled();
  });
});