import React from 'react';
import { render, screen } from '@testing-library/react';
import { DiceDisplay } from '../DiceDisplay';
import type { DiceRoll } from '../../types/diceTypes';

describe('DiceDisplay', () => {
  const mockRoll: DiceRoll = {
    dice1: 3,
    dice2: 4,
    sum: 7
  };

  it('renders standard dice correctly', () => {
    render(<DiceDisplay roll={mockRoll} isRolling={false} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Sum: 7')).toBeInTheDocument();
  });

  it('renders special die when provided', () => {
    const rollWithSpecial: DiceRoll = {
      ...mockRoll,
      specialDie: 'barbarian'
    };

    render(<DiceDisplay roll={rollWithSpecial} isRolling={false} />);
    expect(screen.getByLabelText(/Special die showing barbarian/i)).toBeInTheDocument();
  });

  it('applies animation classes when rolling', () => {
    render(<DiceDisplay roll={mockRoll} isRolling={true} />);
    
    const dice = screen.getAllByRole('img');
    dice.forEach(die => {
      expect(die).toHaveClass('animate-bounce');
    });
  });

  it('applies hover classes when not rolling', () => {
    render(<DiceDisplay roll={mockRoll} isRolling={false} />);
    
    const dice = screen.getAllByRole('img');
    dice.forEach(die => {
      expect(die).toHaveClass('hover:scale-105');
    });
  });
});