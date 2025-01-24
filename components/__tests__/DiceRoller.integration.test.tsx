import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DiceRoller } from '../DiceRoller';

jest.useFakeTimers();

describe('DiceRoller Integration', () => {
  it('handles complete dice rolling workflow', async () => {
    render(<DiceRoller />);
    
    // No dice display initially
    expect(screen.queryByTestId('dice-display')).not.toBeInTheDocument();
    
    // Roll dice
    const rollButton = screen.getByRole('button', { name: /roll dice/i });
    
    await act(async () => {
      fireEvent.click(rollButton);
      expect(rollButton).toHaveTextContent(/rolling\.\.\./i);
      jest.advanceTimersByTime(600);
    });
    
    // Dice display should be visible now
    expect(screen.getByTestId('dice-display')).toBeInTheDocument();
    
    // Enable special die
    const specialDieCheckbox = screen.getByLabelText(/use cities & knights special die/i);
    fireEvent.click(specialDieCheckbox);
    
    // Roll again with special die
    await act(async () => {
      fireEvent.click(rollButton);
      expect(rollButton).toHaveTextContent(/rolling\.\.\./i);
      jest.advanceTimersByTime(600);
    });
    
    // Set discard count
    const discardInput = screen.getByLabelText(/discard count/i);
    fireEvent.change(discardInput, { target: { value: '10' } });
    
    // Roll a few more times
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        fireEvent.click(rollButton);
        jest.advanceTimersByTime(600);
      });
    }
    
    // Test stats display
    const statsDiv = screen.getByText(/total rolls:/i).parentElement;
    expect(statsDiv).toHaveTextContent(/total rolls: 5/i);
    expect(statsDiv).toHaveTextContent(/remaining rolls: 21/i); // 36 - 10 - 5
    
    // Verify average roll is displayed and in valid range
    const averageText = screen.getByText(/average roll:/i).textContent;
    const average = parseFloat(averageText?.match(/\d+\.\d+/)?.[0] || '0');
    expect(average).toBeGreaterThan(0);
    expect(average).toBeLessThanOrEqual(12);
  });
});